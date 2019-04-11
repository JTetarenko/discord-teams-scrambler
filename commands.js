const { help } = require("./commands/help");
const { scramble } = require("./commands/scramble");
const { backToLobby } = require("./commands/backToLobby");
const { voteMap } = require("./commands/voteMap");

exports.commands = {
  "help": help,
  "scramble": scramble,
  "back to lobby": backToLobby,
  "vote map": voteMap
}
