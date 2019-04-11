const Discord = require('discord.js');

exports.help = async function (msg) {
  return msg.author.send(new Discord.RichEmbed()
    .setTitle("Commands list")
    .setDescription(`
            \`scramble\` - scramble members who are in "${process.env.TEAM_A_NAME}", "${process.env.TEAM_B_NAME}" and "${process.env.PRE_GAME_CHANNEL_NAME}" voice channels"
            
            \`vote map\` - execute map voting based on how much members are in lobby
            
            \`back to lobby\` - move members to "${process.env.PRE_GAME_CHANNEL_NAME}" voice channel from "${process.env.TEAM_A_NAME}" and "${process.env.TEAM_B_NAME}"
          `)
    .setFooter("Developed specially for pecinja.lv community <3"));
}
