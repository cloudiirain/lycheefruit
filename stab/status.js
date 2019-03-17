"use strict";

const fs = require('fs');
const util = require('util');
const converter = require('number-to-words');
const { BBcode } = require('hiori');

const readFile = util.promisify(fs.readFile);
const config = require('./config.json');

// Random function
const capitalize = function (s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

/**
 * Logic for the !status cmd. Returns a string response.
 * @param {object} cmd
 * @return {string}
 */
module.exports = async function runStab(cmd) {

  // Parser syntax check -- nothing to check

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

  // Make response
  const quote = BBcode.quote(cmd.action, cmd.post.user, cmd.post.uid, cmd.post.pid);
  const me = usrsDb[uid];
  if (me.isGhost) {
    const killer = usrsDb[me.killedBy.toString()].user;
    var msg = `You are a ghost! You were killed by @${killer}! :blobflag:`;
    return `${quote}${msg}`;
  }
  if (me.kills.length == 1) {
    var msg = `You are an evil ninja! One innocent bunny has fallen to your kitchen knife of doom! :blobspearpeek:`;
    return `${quote}${msg}`;
  } else if (me.kills.length > 1) {
    var msg = `You are an evil ninja! ${capitalize(converter.toWords(me.kills.length))} innocent bunnies have fallen to your kitchen knife of doom! :blobspearpeek:`;
    return `${quote}${msg}`;
  }
  var msg = `You are an innocent bystander! :blobpopcorn:`;
  return `${quote}${msg}`;

}
