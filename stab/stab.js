"use strict";

const converter = require('number-to-words');
const fs = require('fs');
const util = require('util');
const { BBcode, Hiori } = require('hiori')

const { asyncWriteFile } = require('../global/helpers.js');
const readFile = util.promisify(fs.readFile);
const config = require('./config.json');

/**
 * Logic for the !stab cmd. Returns a string response.
 * @param {DetailedCommand} cmd
 * @return {string}
 */
module.exports = async function runStab(cmd) {

  // Determine target and validate cmd input
  const argv = cmd.value.split(' ');
  const target = argv.length > 1 ? argv[1] : '';
  if (!target || target.indexOf('@USER:') < 0) {
    var msg = 'STAB! STAB! STAB!!! ...wait, who is getting stabbed? :blobdizzy:';
    var dunnoQuote =  BBcode.quote(cmd.value, cmd.post.user, cmd.post.uid, cmd.post.pid);
    return `${dunnoQuote}${msg}`;
  }

  // Process target information
  const enemy = Hiori.decodeUserstr(target);
  const quoteString = `${cmd.action} ${target}`;
  const quote = BBcode.quote(quoteString, cmd.post.user, cmd.post.uid, cmd.post.pid);

  // Check if multiple commquand post
  if (cmd.index > 0) {
    var msg = `:blobdead: *huff* *huff* You're going too fast! I can't keep up!`;
    return `${quote}${msg}`;
  }

  // Check if double post
  if (cmd.post.uid == cmd.prevPost.uid) {
    var msg = `:blob_thor: Double posting is bad! ...At least when I say so!`;
    return `${quote}${msg}`;
  }

  // Check if stabbing self
  if (cmd.post.uid == enemy.uid) {
    var msg = `:blobfearful: Don't stab yourself!! Knives are sharp!!`;
    return `${quote}${msg}`;
  }

  // Check if stabbing bot
  if (cmd.post.user == process.env.HIORI_USER) {
    var msg = `:blobupset: Stabbing me is mean! I won't like you anymore!`;
    return `${quote}${msg}`;
  }

  // Load data
  const usrsFile = await readFile(config.db.usrs);
  const usrsDb = JSON.parse(usrsFile);

  // If this is the player's first time playing
  const uid = cmd.post.uid.toString();
  if (!(uid in usrsDb)) {
    usrsDb[uid] = {
      "user": cmd.post.user,
      "uid": cmd.post.uid,
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

  // Check if player or enemy is a ghost
  if (usrsDb[uid].isGhost) {
    var msg = `Silly ghost! You're dead! No stab stabby for you! :blob_ghost:`;
    return `${quote}${msg}`;
  }
  if (usrsDb[enemyid].isGhost) {
    var msg = `Your fabulous knife goes *whoosh* and misses! It looks like @${enemy.user} is already a ghost!!`;
    return `${quote}${msg}`;
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
  await asyncWriteFile(config.db.usrs, usrsDb, config.scope, false);

  if (kills.length) {
    const ghosts = kills.length > 1 ? 'ghosts' : 'ghost';
    var msg = `Revenge!! @${enemy.user} has fallen in a puddle of ketchup!!!! :blobhero::blobhero::blobhero:
               In the graveyard, ${converter.toWords(kills.length)} ${ghosts} have arisen from the dead...`
    return `${quote}${msg}`;
  }
  var msg = `M-murder!! @${enemy.user} was so innocent... How could you be so cruel... :blob_teary::blob_teary::blob_teary:`;
  return `${quote}${msg}`;

}
