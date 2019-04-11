const dotenv = require('dotenv');
const Discord = require('discord.js');
const client = new Discord.Client();
const { commands } = require('./commands');

client.on('ready', () => {
  console.log(`Let's go!`);
});

dotenv.config();

client.login(process.env.CLIENT_TOKEN);

client.on('message', msg => {
  if (msg.mentions.users.first() && msg.mentions.users.first().id === process.env.BOT_ID) {
    // Instantly delete bot command
    msg.delete();

    const regex = new RegExp("<@" + process.env.BOT_ID + "> ");
    const commandName = msg.content.replace(regex, '');

    if(Object.keys(commands).includes(commandName)) {
      commands[commandName](msg);
    }
  }
});
