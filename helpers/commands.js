const Discord = require('discord.js');
const changeCase = require('change-case');

exports.buildCommands = function(msg, commands, process) {
  let desription = "";
  let commandsList = {};

  Object.keys(commands).forEach((commandName) => {
    desription += `\`${commandName}\` - ${commands[commandName].help(process)}\n\n`;
    commandsList[commandName] = commands[commandName][changeCase.camelCase(commandName)];
  });

  commandsList["help"] = async function(msg) {
    msg.author.send(new Discord.RichEmbed()
      .setTitle("Commands list")
      .setDescription(desription)
      .setFooter("Developed specially for pecinja.lv community <3"))
  };

  return commandsList;
}


