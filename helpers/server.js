const Rcon = require('srcds-rcon');
const randomstring = require("randomstring");

exports.setup = async function(gameMode, cfg, mapID) {
  const rcon = Rcon({
    address: process.env.SERVER_ADDRESS,
    password: process.env.SERVER_RCON_PASSWORD
  });

  const password = randomstring.generate(7);

  await rcon.connect().then(() => {
    return rcon.command(`sv_password ${password}`).then((password) => console.log(`Password changed to ${password}`));
  }).then(
    () => rcon.command(`game_mode ${gameMode}`).then(() => console.log("Changed game mode"))
  ).then(
    () => rcon.command(`exec ${cfg}`).then(() => console.log("Config executed"))
  ).then(
    () => rcon.command(`changelevel ${mapID}`)
  ).catch(
    err => {
      rcon.disconnect();
    }
  );

  rcon.disconnect();

  return password;
}

exports.getScore = async function() {
  const rcon = Rcon({
    address: process.env.SERVER_ADDRESS,
    password: process.env.SERVER_RCON_PASSWORD
  });

  let scoreboard = {
    t: 0,
    ct: 0
  }

  await rcon.connect().then(() => {
    return rcon.command("sm_teamscore T").then((score) => scoreboard.t = score.substr(0, score.indexOf('\n')));
  }).then(
    () => rcon.command("sm_teamscore CT").then((score) => scoreboard.ct = score.substr(0, score.indexOf('\n')))
  ).catch(
    err => {
      console.log(err);
    }
  );

  return scoreboard;
}
