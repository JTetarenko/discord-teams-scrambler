const Discord = require('discord.js');
const serverHelper = require('../helpers/server');

exports.getScore = async function(msg) {
  const score = await serverHelper.getScore();
  return msg.channel.send(new Discord.RichEmbed()
    .setTitle("Match score")
    .setDescription(`
    CT: ${score.ct}
    T: ${score.t}
    `));
}

exports.help = function(process) {
  return "Get active match score";
}
