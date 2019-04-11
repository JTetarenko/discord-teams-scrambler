const scramble = require("./commands/scramble");
const backToLobby = require("./commands/backToLobby");
const voteMap = require("./commands/voteMap");
const getScore = require("./commands/getScore");

const commands = {
  "scramble": scramble,
  "back to lobby": backToLobby,
  "vote map": voteMap,
  "get score": getScore
}

exports.commands = commands;
