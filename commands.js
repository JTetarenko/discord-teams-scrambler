const scramble = require("./commands/scramble");
const backToLobby = require("./commands/backToLobby");
const voteMap = require("./commands/voteMap");

const commands = {
  "scramble": scramble,
  "back to lobby": backToLobby,
  "vote map": voteMap
}

exports.commands = commands;
