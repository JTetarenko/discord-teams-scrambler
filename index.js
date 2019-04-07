const dotenv = require('dotenv');
const Discord = require('discord.js');
const client = new Discord.Client();
const Shuffle = require('shuffle-array');

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
          // REFACTOR THIS SHIT!!
          const emojiList = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','🔟'];
          const optionsList = [
            'Vertigo', 'Inferno', 'Overpass', 'Cobblestone', 'Train', 'Nuke', 'Cache', 'Subzero', 'Mirage', 'Dust2'
          ];
          const mapImageList = [
            "https://i.imgur.com/pbzftZQ.jpg",
            "https://i.imgur.com/eF6VV4z.jpg",
            "https://i.imgur.com/trZ5kHh.jpg",
            "https://i.imgur.com/zX65Jd1.jpg",
            "https://i.imgur.com/eY9o5Yd.jpg",
            "https://i.imgur.com/SbPt7xJ.jpg",
            "https://i.imgur.com/v0qSZJS.jpg",
            "https://i.imgur.com/XYODUyS.jpg",
            "https://i.imgur.com/pkkDbAh.jpg",
            "https://i.imgur.com/6B5WONK.jpg"
          ];
          const maps = {
            mm: {
              time: 30 * 1000,
              count: 8,
              text: `
                '1⃣' - Vertigo
                '2⃣' - Inferno
                '3⃣' - Overpass
                '4⃣' - Cobblestone
                '5⃣' - Train
                '6⃣' - Nuke
                '7⃣' - Cache
                '8⃣' - Subzero
                '9⃣' - Mirage
              `
            },
            wingman: {
              time: 60 * 1000,
              count: 10,
              text: `
                '1⃣' - Vertigo
                '2⃣' - Inferno
                '3⃣' - Overpass
                '4⃣' - Cobblestone
                '5⃣' - Train
                '6⃣' - Nuke
                '7⃣' - Cache
                '8⃣' - Subzero
                '9⃣' - Mirage
                '🔟' - Dust2
              `
            }
          }

          const mode = preGameChannel.members.array().length > 6 ? "wingman" : "mm";

          let embed = new Discord.RichEmbed()
            .setTitle("Vote for the map")
            .setDescription(maps[mode].text)
            .setColor(0x008000)
            .setFooter(`Voting time is ${maps[mode].time / 1000} seconds`)
            .setTimestamp();

          msg.channel.send({embed})
            .then(async function (message) {
              let reactionArray = {};
              for(let i = 0; i <= maps[mode].count; i++) {
                reactionArray[i] = await message.react(emojiList[i]);
              }

              setTimeout(() => {
                // Re-fetch the message and get reaction counts
                message.channel.fetchMessage(message.id)
                  .then(async function (message) {
                    let reactionCountsArray = [];
                    for (let i = 0; i < maps[mode].count; i++) {
                      reactionCountsArray[i] = message.reactions.get(emojiList[i]).count - 1;
                    }

                    // Find winner(s)
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

                    let winnersText = "";
                    let winnerImg = "";
                    if (reactionCountsArray[winners[0].key] === 0) {
                      winnersText = "No one voted!"
                    } else {
                      const winner = winners.length > 1 ? winners[Math.floor(Math.random() * winners.length)] : winners[0];
                      winnersText +=
                        emojiList[winner.key] + " " + optionsList[winner.key] +
                        " (" + winner.value + " vote(s))\n";
                      winnerImg = mapImageList[winner.key];
                    }

                    embed.setImage(winnerImg);
                    embed.setColor(0xFF0000);
                    embed.addField("**Winner:**", winnersText);
                    embed.setTimestamp();

                    message.edit("", embed);
                  });
              }, maps[mode].time);
            })
            .catch(console.error);

        }
        break;
      }

      // TODO: Write about new commands
      case "help": {
        msg.author.send(new Discord.RichEmbed()
          .setTitle("Commands list")
          .setDescription(`
            \`scramble\` - scramble members who are in "${process.env.TEAM_A_NAME}", "${process.env.TEAM_B_NAME}" and "${process.env.PRE_GAME_CHANNEL_NAME}" voice channels"
            
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
