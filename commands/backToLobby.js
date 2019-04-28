const Discord = require('discord.js');

exports.backToLobby = function(msg, client, interval) {
  const adminRole = msg.member.roles.find(role => role.name === process.env.ADMIN_ROLE_NAME);
  const preGameChannel = msg.guild.channels.find(channel => channel.name === process.env.PRE_GAME_CHANNEL_NAME);
  const teamAChannel = msg.guild.channels.find(channel => channel.name === process.env.TEAM_A_NAME);
  const teamBChannel = msg.guild.channels.find(channel => channel.name === process.env.TEAM_B_NAME);

  if (adminRole && msg.member.roles.has(adminRole.id)) {
    let members = teamAChannel.members.array().concat(teamBChannel.members.array());

    members.forEach((member) => {
      member.setVoiceChannel(preGameChannel.id);
    });

    msg.channel.send(new Discord.RichEmbed()
      .setTitle("Hey hey! Game is over, let's talk :P")
      .setColor(0xFF0000));

    clearInterval(interval);

    client.user.setActivity("commands", { type: "LISTENING" });

    return {
      interval: false
    }
  }
};

exports.help = function(process) {
  return `Move members to "${process.env.PRE_GAME_CHANNEL_NAME}" voice channel from "${process.env.TEAM_A_NAME}" and "${process.env.TEAM_B_NAME}"`;
}
