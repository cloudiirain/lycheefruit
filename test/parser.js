"use strict";

const runStab = require('./stab.js');

/**
 * Test application parser. Returns a string response.
 * @param {object} command
 * @param {object} usrsDb
 * @return {string}
 */
module.exports = async function testParseArgs(command) {

  const action = command.cmd.toLowerCase();
  switch (action) {
    case '!help':
      return 'I don\'t know how to help you! Try hitting something!';
      break;
    case '!stab':
      return await runStab(command);
      break;
    case '!hit':
      return 'Ouch! Hitting people isn\'t nice!';
      break;
    case '!freemoney':
      return 'No money here... T__T';
      break;
    default:
      return 'I don\'t understand! Go easy on me, sensei!';
  }

}
