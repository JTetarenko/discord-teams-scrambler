const dotenv = require('dotenv');
const Discord = require('discord.js');
const client = new Discord.Client();
const Shuffle = require('shuffle-array');
const Rcon = require('srcds-rcon');
const randomstring = require("randomstring");
const configuration = require("./configuration");

const rcon = Rcon({
  address: process.env.SERVER_ADDRESS,
  password: process.env.SERVER_RCON_PASSWORD
});

client.on('ready', () => {
  console.log(`Let's go!`);
});

dotenv.config();

client.login(process.env.CLIENT_TOKEN);

client.on('message', msg => {
  if (msg.mentions.users.first() && msg.mentions.users.first().id === process.env.BOT_ID) {
    // Instantly delete bot command
    msg.delete();

    // Global variables
    const preGameChannel = (process.env.GET_FROM_PRE_GAME_CHANNEL_TOO)
      ? msg.guild.channels.find(channel => channel.name === process.env.PRE_GAME_CHANNEL_NAME)
      : null;
    const teamAChannel = msg.guild.channels.find(channel => channel.name === process.env.TEAM_A_NAME);
    const teamBChannel = msg.guild.channels.find(channel => channel.name === process.env.TEAM_B_NAME);
    const adminRole = msg.member.roles.find(role => role.name === process.env.ADMIN_ROLE_NAME);

    // Commands
    let regex = new RegExp("<@" + process.env.BOT_ID + "> ");
    switch(msg.content.replace(regex, '')) {
      case "scramble": {
        if (adminRole && msg.member.roles.has(adminRole.id)) {
          let members = teamAChannel.members.array().concat(teamBChannel.members.array());

          if (process.env.GET_FROM_PRE_GAME_CHANNEL_TOO) {
            members = members.concat(preGameChannel.members.array());
          }

          moveMembersToVoiceChannels(Shuffle(members), teamAChannel, teamBChannel);

          msg.channel.send(new Discord.RichEmbed()
            .setTitle("Teams scrambled")
            .setColor(0x008000)
            .setFooter(`Have Fun and Good Luck =]`));
        }
        break;
      }

      case "back to lobby": {
        if (adminRole && msg.member.roles.has(adminRole.id)) {
          let members = teamAChannel.members.array().concat(teamBChannel.members.array());

          members.forEach((member) => {
            member.setVoiceChannel(preGameChannel.id);
          });

          msg.channel.send(new Discord.RichEmbed()
            .setTitle("Hey hey! Game is over, let's talk :P")
            .setColor(0xFF0000));
        }
        break;
      }

      case "vote map": {
        if (adminRole && msg.member.roles.has(adminRole.id)) {
          const emojiList = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','🔟'];

          const mode = preGameChannel.members.array().length > 6 ? "mm" : "wingman";

          let description = "";
          configuration.modes[mode].maps.forEach((map, key) => {
            description += `${emojiList[key]} - ${map.name}\n`;
          });

          let embed = new Discord.RichEmbed()
            .setTitle("Vote for the map")
            .setDescription(description)
            .setColor(0x008000)
            .setFooter(`Voting time is ${configuration.modes[mode].time / 1000} seconds`)
            .setTimestamp();

          msg.channel.send({embed})
            .then(async function (message) {
              // Add reactions to message
              let reactionArray = {};
              for(let i = 0; i < configuration.modes[mode].maps.length; i++) {
                reactionArray[i] = await message.react(emojiList[i]);
              }

              setTimeout(() => {
                // Re-fetch the message and get reaction counts
                message.channel.fetchMessage(message.id)
                  .then(async function (message) {
                    let reactionCountsArray = [];
                    for (let i = 0; i < configuration.modes[mode].maps.length; i++) {
                      reactionCountsArray[i] = message.reactions.get(emojiList[i]).count - 1;
                    }

                    // Find winner
                    let max = {
                      key: 0,
                      value: reactionCountsArray[0]
                    };

                    for (let i = 1; i < reactionCountsArray.length; i++) {
                      if (reactionCountsArray[i] > max.value) {
                        max.value = reactionCountsArray[i];
                        max.key = i;
                      }
                    }

                    let winners = [];

                    for (let i = 0; i < reactionCountsArray.length; i++) {
                      if (reactionCountsArray[i] === max.value) {
                        winners.push({value: reactionCountsArray[i], key: i});
                      }
                    }

                    const winner = winners.length > 1 ? winners[Math.floor(Math.random() * winners.length)] : winners[0];

                    embed.setImage(configuration.modes[mode].maps[winner.key].img);
                    embed.setColor(0xFF0000);
                    embed.addField("**Winner:**", `${emojiList[winner.key]} ${configuration.modes[mode].maps[winner.key].name} (${winner.value} vote(s))`);
                    embed.setTimestamp();

                    message.edit("", embed);

                    // Setup CS server
                    const password = "p3cinj4";//randomstring.generate(7);

                    rcon.connect().then(() => {
                      return rcon.command(`sv_password "${password}"`).then(() => console.log(`Password changed to ${password}`));
                    }).then(
                      () => rcon.command(`exec ${configuration.modes[mode].cfg}`).then(() => console.log("Config executed"))
                    ).then(
                      () => rcon.command(`game_mode ${configuration.modes[mode].gameMode}`).then(() => console.log("Changed game mode"))
                    ).then(
                      () => rcon.command("mp_restartgame 1").then(() => console.log("Round restarted"))
                    ).then(
                      () => rcon.command(`map ${configuration.modes[mode].maps[winner.key].id}`)
                    ).catch(
                      err => {
                        rcon.disconnect();
                      }
                    );

                    preGameChannel.members.forEach((member) => {
                      member.send(new Discord.RichEmbed()
                        .setTitle("Pecinja.lv Friendly Scrim is ready")
                        .setDescription(`
                        ==============================================
                        
                        \`connect ${process.env.SERVER_ADDRESS};password ${password};\`
                        
                        ==============================================
                        `)
                        .setFooter("Copy this in console"));
                    });
                  });
              }, configuration.modes[mode].time);
            })
            .catch(console.error);

        }
        break;
      }

      case "help": {
        msg.author.send(new Discord.RichEmbed()
          .setTitle("Commands list")
          .setDescription(`
            \`scramble\` - scramble members who are in "${process.env.TEAM_A_NAME}", "${process.env.TEAM_B_NAME}" and "${process.env.PRE_GAME_CHANNEL_NAME}" voice channels"
            
            \`vote map\` - execute map voting based on how much members are in lobby
            
            \`back to lobby\` - move members to "${process.env.PRE_GAME_CHANNEL_NAME}" voice channel from "${process.env.TEAM_A_NAME}" and "${process.env.TEAM_B_NAME}"
          `)
          .setFooter("Developed specially for pecinja.lv community <3"));
        break;
      }
    }
  }
});

function moveMembersToVoiceChannels(members, teamAChannel, teamBChannel) {
  let i = 1;
  members.forEach((member) => {
    if (i <= Math.round(members.length / 2)) {
      member.setVoiceChannel(teamAChannel.id);
    } else {
      member.setVoiceChannel(teamBChannel.id);
    }
    i++;
  });
}
