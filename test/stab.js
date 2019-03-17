"use strict";

const fs = require('fs');
const util = require('util');
const Hiori = require('hiori');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const config = require('./config.json');

/**
 * Logic for the !stab command. Returns a string response.
 * @param {object} command
 * @return {string}
 */
module.exports = async function runStab(command) {

  // Parser syntax check
  const target = command.value.split(' ')[0];
  if (target.indexOf('@USER:') < 0) {
    return 'STAB! STAB! STAB!!! ...wait, who is getting stabbed? :blobdizzy:';
  }
  const enemy = Hiori.decodeUser(target);

  // Load data
  const usrsFile = await readFile(config.db.usrs);
  const usrsDb = JSON.parse(usrsFile);

  // If this is the player's first time playing
  const uid = command.uid.toString();
  if (!(uid in usrsDb)) {
    usrsDb[uid] = {
      "user": command.user,
      "uid": command.uid,
      "isGhost": false,
      "killedBy": null,
      "kills": []
    }
  }
  const enemyid = enemy.uid.toString();
  if (!(enemyid in usrsDb)) {
    usrsDb[enemyid] = {
      "user": enemy.user,
      "uid": enemy.uid,
      "isGhost": false,
      "killedBy": null,
      "kills": []
    }
  }

  // Check if stabbing self
  if (command.uid == enemy.uid) {
    return `:blobfearful: Don't stab yourself!! Knives are sharp!!`;
  }

  // Check if player or enemy is a ghost
  if (usrsDb[uid].isGhost) {
    return `Silly ghost! You're dead! No stab stabby for you! :blob_ghost:`;
  }
  if (usrsDb[enemyid].isGhost) {
    return `Your fabulous knife goes *whoosh* and misses! It looks like @${enemy.user} is already a ghost!!`;
  }

  // Set user to gain kill
  if (!usrsDb[uid].kills.includes(enemyid)) {
    usrsDb[uid].kills.push(enemyid);
  }

  // Loop and unset enemy's kills
  const kills = usrsDb[enemyid].kills
  for (var i = 0; i < kills.length; i++) {
    const gid = kills[i];
    usrsDb[gid].isGhost = false;
    usrsDb[gid].killedBy = null;
  }

  // Set enemy to ghost
  usrsDb[enemyid].isGhost = true;
  usrsDb[enemyid].killedBy = uid;
  usrsDb[enemyid].kills = [];

  // Write to database
  await writeFile(config.db.usrs, JSON.stringify(usrsDb, null, 2), 'utf8');
  console.log(`${new Date().toISOString()}[test] Wrote file: ${config.db.usrs}`);

  if (kills.length) {
    return `Revenge!! @${enemy.user} has fallen in a puddle of ketchup!!!! :blobhero::blobhero::blobhero:
            ...${kills.length} ghost(s) have arisen from the dead...`
  }
  return `M-murder!! @${enemy.user} was so innocent... How could you be so cruel... :blob_teary::blob_teary::blob_teary:`;

}
