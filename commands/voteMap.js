const Discord = require('discord.js');
const configuration = require("../configuration");
const server = require("../helpers/server");

exports.voteMap = async function(msg, client) {
  const adminRole = msg.member.roles.find(role => role.name === process.env.ADMIN_ROLE_NAME);
  const preGameChannel = msg.guild.channels.find(channel => channel.name === process.env.PRE_GAME_CHANNEL_NAME);

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

    let winner;

    return msg.channel.send({embed})
      .then(async function (message) {
        // Add reactions to message
        let reactionArray = {};
        for(let i = 0; i < configuration.modes[mode].maps.length; i++) {
          reactionArray[i] = await message.react(emojiList[i]);
        }

        return setTimeout(() => {
          // Re-fetch the message and get reaction counts
          message.channel.fetchMessage(message.id)
            .then(async function (message) {
              let reactionCountsArray = [];
              for (let i = 0; i < configuration.modes[mode].maps.length; i++) {
                reactionCountsArray[i] = await message.reactions.get(emojiList[i]).count - 1;
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

              winner = winners.length > 1 ? winners[Math.floor(Math.random() * winners.length)] : winners[0];

              embed.setImage(configuration.modes[mode].maps[winner.key].img);
              embed.setColor(0xFF0000);
              embed.addField("**Winner:**", `${emojiList[winner.key]} ${configuration.modes[mode].maps[winner.key].name} (${winner.value} vote(s))`);
              embed.setTimestamp();

              await message.edit("", embed);

              // Setup CS server
              const password = await server.setup(configuration.modes[mode].gameMode, configuration.modes[mode].cfg,
                configuration.modes[mode].maps[winner.key].id);

              await preGameChannel.members.forEach((member) => {
                member.send(new Discord.RichEmbed()
                .setTitle("Pecinja.lv Friendly Scrim is ready")
                .setDescription(`
                        ==============================================
                        
                        \`connect ${process.env.SERVER_ADDRESS};password ${password};\`
                        
                        ==============================================
                        `)
                .setFooter("Copy this in console"));
              });

              console.log("Server is done and starting score tracking...");

              return {
                interval: setInterval(async() => {
                  const response = await server.getScore();

                  console.log("Score:", response);

                  if (response === "Warmup" || response === "Match ended") {
                    client.user.setActivity(
                      `${response} @${configuration.modes[mode].maps[winner.key].name}`,
                      {type: "WATCHING"});
                  }
                  else {
                    client.user.setActivity(
                      `ALPHA: ${response.alpha} vs BRAVO: ${response.bravo} @${configuration.modes[mode].maps[winner.key].name}`,
                      {type: "WATCHING"});
                  }
                }, 10 * 1000)
              };
            });
        }, configuration.modes[mode].time);
      })
      .catch(console.error);
  }
};

exports.help = function(process) {
  return `Scramble members who are in "${process.env.TEAM_A_NAME}", "${process.env.TEAM_B_NAME}" and "${process.env.PRE_GAME_CHANNEL_NAME}" voice channels`;
}
