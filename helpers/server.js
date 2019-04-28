const Rcon = require('srcds-rcon');
const randomstring = require("randomstring");

exports.setup = async function(gameMode, cfg, mapID) {
  const rcon = Rcon({
    address: process.env.SERVER_ADDRESS,
    password: process.env.SERVER_RCON_PASSWORD
  });

  const password = randomstring.generate(7);

  console.log("Setup server...");

  await rcon.connect().then(() => {
    console.log("Successfully connected to server");
    return rcon.command("sm_kick @all").then(() => console.log("Everyone was kicked from server"));
  }).then(
    () => rcon.command(`game_mode ${gameMode}`).then(() => console.log("Changed game mode"))
  ).then(
    () => rcon.command(`exec ${cfg}`).then(() => console.log("Config executed"))
  ).then(
    () => rcon.command(`changelevel ${mapID}`)
  ).then(
    () => rcon.disconnect()
  ).catch(console.error);

  await rcon.connect().then(() => {
     return rcon.command(`sm_passwd "${password}"`).then(() => console.log(`Password changed to ${password}`));
  }).then(
    () => rcon.disconnect()
  ).catch(console.error);

  return password;
}

exports.getScore = async function() {
  const rcon = Rcon({
    address: process.env.SERVER_ADDRESS,
    password: process.env.SERVER_RCON_PASSWORD
  });

  let scoreboard = {
    t: 0,
    ct: 0,
    isWarmup: true,
    phase: 1
  };

  await rcon.connect().then(() => {
    return rcon.command("sm_warmup").then((response) => scoreboard.isWarmup = response.substr(0, response.indexOf('\n')) === "Warmup")
  }).then(
    () => rcon.disconnect()
  ).catch(console.error);

  if (scoreboard.isWarmup) {
    return "Warmup";
  }

  await rcon.connect().then(() => {
    return rcon.command("sm_teamscore T").then((score) => scoreboard.t = score.substr(0, score.indexOf('\n')));
  }).then(
    () => rcon.command("sm_teamscore CT").then((score) => scoreboard.ct = score.substr(0, score.indexOf('\n')))
  ).then(
    () => rcon.command("sm_phase").then((phase) => scoreboard.phase = phase.substr(0, phase.indexOf('\n')))
  ).then(
    () => rcon.disconnect()
  ).catch(console.error);

  if (scoreboard.phase === "MatchEnded") {
    return "Match ended";
  }

  return {
    alpha: scoreboard.phase === "FirstHalf" ? scoreboard.ct : scoreboard.t,
    bravo: scoreboard.phase === "FirstHalf" ? scoreboard.t : scoreboard.ct
  };
}
