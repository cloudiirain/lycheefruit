"use strict";

// Database definitions
// msg = { pid: 'int', user: 'string'}

/**
 * Test application loop
 */
module.exports = async function testLoop(bot, db, config) {
  const msgDb = db.test.msgs;

  // Prune db size
  // Load most recent post
  //const count = await setTimeout(() => { return 1; }, 1000);
  //console.log(count);

  //await msgDb.find({}).sort({ pid: 1 }).limit(10).exec(async (err, docs) => {
    //const lastpid = docs.length ? docs[0].pid : config.test.reset_pid;
    //console.log(lastpid);
    const lastpid = config.test.reset_pid;

    // Fetch all commands since last post
    const cmds = await bot.fetchThreadCommandsSince(lastpid);
    const lastcmd = cmds.slice(-1)[0];
    console.log(cmds);
    //if (lastcmd.pid > lastpid) {}

    /*
    const reply = await cmds.reduce((bbcode, cmd) => {
      const cmds = post.getCommands();
      return bbcode + ;
    }, []);
    */

    // if most recent cmd > lastpid

    // For cmds > lastpid

    //    Do stuff: parse args

    // Make reply

  //});
}
