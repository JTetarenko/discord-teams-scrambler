const Discord = require('discord.js');
const Shuffle = require('shuffle-array');

exports.scramble = async function(msg) {
  const adminRole = msg.member.roles.find(role => role.name === process.env.ADMIN_ROLE_NAME);
  const preGameChannel = msg.guild.channels.find(channel => channel.name === process.env.PRE_GAME_CHANNEL_NAME);
  const teamAChannel = msg.guild.channels.find(channel => channel.name === process.env.TEAM_A_NAME);
  const teamBChannel = msg.guild.channels.find(channel => channel.name === process.env.TEAM_B_NAME);

  if (adminRole && msg.member.roles.has(adminRole.id)) {
    let members = Shuffle(teamAChannel.members
      .array()
      .concat(teamBChannel.members.array())
      .concat(preGameChannel.members.array()));

    let i = 1;
    members.forEach((member) => {
      if (i <= Math.round(members.length / 2)) {
        member.setVoiceChannel(teamAChannel.id);
      } else {
        member.setVoiceChannel(teamBChannel.id);
      }
      i++;
    });

    msg.channel.send(new Discord.RichEmbed()
      .setTitle("Teams scrambled")
      .setColor(0x008000)
      .setFooter(`Have Fun and Good Luck =]`));
  }
};

exports.help = function(process) {
  return `Execute map voting based on how much members are in lobby`;
}
