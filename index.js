const dotenv = require('dotenv');
const Discord = require('discord.js');
const client = new Discord.Client();
const commandsHelper = require('./helpers/commands');
let { commands } = require('./commands');

dotenv.config();

// Create socket for Discord server
client.on('ready', () => {
  console.log(`Let's go!`);
});

// Login into Bot profile
client.login(process.env.CLIENT_TOKEN);

client.on('message', msg => {
  if (msg.mentions.users.first() && msg.mentions.users.first().id === process.env.BOT_ID) {
    // Instantly delete bot command
    msg.delete();

    // Get command name from the message
    const regex = new RegExp("<@" + process.env.BOT_ID + "> ");
    const commandName = msg.content.replace(regex, '');

    const commandsList = commandsHelper.buildCommands(msg, commands, process);

    // Check if command exists
    if(Object.keys(commandsList).includes(commandName)) {
      // Execute command
      commandsList[commandName](msg);
    }
  }
});
