"use strict";

const { BBcode } = require('hiori');
const runStab = require('./stab.js');
const runStatus = require('./status.js');

/**
 * Test application parser. Returns a string response.
 * @param {DetailedCommand} cmd
 * @return {string}
 */
module.exports = async function parseArgs(cmd) {

  const action = cmd.action.toLowerCase();
  const quote = BBcode.quote(action, cmd.post.user, cmd.post.uid, cmd.post.pid);

  switch (action) {
    case '!help':
      var msg = 'I don\'t know how to help you! Try hitting something!';
      return `${quote}${msg}`;
      break;
    case '!stab':
      return await runStab(cmd);
      break;
    case '!status':
      return await runStatus(cmd);
      break;
    case '!hit':
      var msg = 'Ouch! Hitting people isn\'t nice!';
      return `${quote}${msg}`;
      break;
    case '!freemoney':
      var msg = 'No money here... T__T';
      return `${quote}${msg}`;
      break;
    default:
      var msg = 'I don\'t understand! Go easy on me, sensei!';
      return `${quote}${msg}`;
  }

}
