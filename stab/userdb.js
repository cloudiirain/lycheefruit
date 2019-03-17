/**
 * @module      userdb.js
 * @author      cloudiirain
 * @description Class for manipulating the user database..
 */

'use strict';

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const { asyncWriteFile } = require('../global/helpers');
const config = require('./config.json');


/* Bookmark class */
module.exports = class UserDB {

  /**
   * @typedef {Object} Record
   * @property {string} user
   * @property {number} uid
   * @property {number} killedBy
   * @property {number[]} kills
   * @property {number} guarding
   * @property {number[]} guardedBy
   * @property {number} haunting
   * @property {number[]} hauntedBy
   */

  /**
   * @typedef {Object} UserDb
   * @property {string} file The file path for where the db is stored.
   * @property {RecordDict} db A dictionary with each user's data.
   */

  /**
   * Constructs a UserDB.
   * @param {string} filepath
   * @return {ThreadPost}
   */
  constructor(filepath, db={}) {
    this.file = filepath;
    this.stack = db;
  }

  /**
   * Factory constructor for UserDb class.
   * @return {UserDB}
   */
  static async load (filepath) {
    const userDb = new UserDB(filepath);
    if (fs.existsSync(filepath)) {
      const usrsFile = await readFile(config.db.usrs);
      const userDb.db = JSON.parse(usrsFile);
      return userDb;
    }
    await asyncWriteFile(config.db.usrs, {}, config.scope);
    return userDb;
  }

  /**
   * Registers a user in a game if they are not already in the db.
   * @param {number} uid
   * @param {string} user
   */
  register (uid, user) {
    const userId = uid.toString();
    if (!(uid in usrsDb)) {
      this.db[userId] = {
        "user": user,
        "uid": uid,
        "killedBy": null,
        "kills": [],
        "guarding": null,
        "guardedBy": [],
        "haunting": null,
        "hauntedBy": []
      }
      return true;
    }
    return false;
  }

  kill (killer, victim) {
    const killerId = killer.toString();
    const victimId = victim.toString();

    // Killer gains +1 kill
    if (!this.db[killerId].kills.includes(victimId)) {
      this.db[killerId].kills.push(victim);
    }

    // Loop and unset victim's kills
    const kills = this.db[victimId].kills;
    for (var i = 0; i < kills.length; i++) {
      const playerId = kills[i];
      const pid = playerId.toString();
      this.db[pid].killedBy = null;

      // If the ghost is haunting someone, unset that
      const hauntId = this.db[pid].haunting;
      if (hauntId) {
        this.db[pid].haunting = null;
        const hid = hauntId.toString();
        const newHaunt = this.db[hid].hauntedBy.filter(e => e != playerId);
        this.db[hid].hauntedBy = newHaunt;
      }
    }

    // If the victim is guarding someone, unset that
    const lordId = this.db[victimId].guarding;
    if (lordId) {
      this.db[victimId].guarding = null;
      const lid = lordId.toString();
      const newGuard = this.db[lid].guardedBy.filter(e => e != lordId);
    }
  }

  haunt (ghostId, targetId) {
    const gid = ghostId.toString();
    const tid = targetId.toString();
    this.db[gid].haunting = targetId;
    if (!this.db[tid].hauntedBy.includes(gid)) {
      this.db[tid].hauntedBy.push(ghostId);
    }
  }

  guard (guardId, targetId) {
    const gid = guardId.toString();
    const tid = targetId.toString();
    this.db[gid].guarding = targetId;
    if (!this.db[tid].guardedBy.includes(gid)) {
      this.db[tid].guardedBy.push(guardId);
    }
  }

  hauntBlock (userId) {
    const uid = userId.toString();
    const ghostId = this.db[uid].hauntedBy.shift();
    if (ghostId) {
      const gid = ghostId.toString();
      this.db[gid].haunting = null;
    }
  }

  guardBlock (userId) {
    const uid = userId.toString();
    const guardId = this.db[uid].guardedBy.shift();
    if (guardId) {
      const gid = guardId.toString();
      this.db[gid].guarding = null;
    }
  }

  /**
   * Saves the current bookmark to file.
   * @return {Promise}
   */
  async save () {
    return asyncWriteFile(config.db.usrs, this.db, config.scope, false);
  }

}
