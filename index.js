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
    const preGameChannel = msg.guild.channels.find(channel => channel.name === process.env.PRE_GAME_CHANNEL_NAME);
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
            .setColor(0xFF0000)
            .setFooter(`Have Fun and Good Luck =]`));
        }
        break;
      }

      case "help": {
        msg.author.send(new Discord.RichEmbed()
          .setTitle("Commands list")
          .setDescription("`scramble` - scramble members who are in \"team A\" and \"team B\" voice channels (\"pre game\" is optional)")
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
