const Rcon = require('srcds-rcon');
const randomstring = require("randomstring");

exports.setup = async function(gameMode, cfg, mapID) {
  const rcon = Rcon({
    address: process.env.SERVER_ADDRESS,
    password: process.env.SERVER_RCON_PASSWORD
  });

  const password = randomstring.generate(7);

  rcon.connect().then(() => {
    return rcon.command(`sv_password ${password}`).then(() => console.log(`Password changed to ${password}`));
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

  return password;
}
