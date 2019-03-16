"use strict";

/**
 * Test application parser. Returns a string response.
 * @param {object} command
 * @return {string}
 */
module.exports = async function testParseArgs(command) {

  const action = command.cmd.toLowerCase();
  switch (action) {
    case '!help':
      return 'I don\'t know how to help you! Try hitting something!\n';
      break;
    case '!hit':
      return 'Ouch! Hitting people isn\'t nice!\n';
      break;
    case '!freemoney':
      return 'No money here... T__T';
      break;
    default:
      return 'I don\'t understand! Go easy on me, sensei!\n';
  }

}


//await msgDb.find({}).sort({ pid: 1 }).limit(10).exec(async (err, docs) => {
  //const lastpid = docs.length ? docs[0].pid : config.test.reset_pid;
  //console.log(lastpid);
  //const lastpid = config.test.reset_pid;

  // Fetch all commands since last post
  //const cmds = await bot.fetchThreadCommandsSince(lastpid);
  //const lastcmd = cmds.slice(-1)[0];
  //console.log(cmds);
  //if (lastcmd.pid > lastpid) {}

  /*
  const reply = await cmds.reduce((bbcode, cmd) => {
    const cmds = post.getCommands();
    return bbcode + ;
  }, []);
  */
