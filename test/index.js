"use strict";

const fs = require('fs');
const util = require('util');
const Hiori = require('hiori');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const config = require('./config.json');
const testParseArgs = require('./parser.js');


/**
 * Set up storage files if they do not exist.
 */
if (!fs.existsSync(config.bookmark)) {
  const bookmark = { "pid": config.reset_pid }
  writeFile(config.bookmark, JSON.stringify(bookmark), 'utf8');
  console.log(`${new Date().toISOString()}[test] Created file: ${config.bookmark}`);
}
if (!fs.existsSync(config.db.usrs)) {
  writeFile(config.db.usrs, JSON.stringify({}), 'utf8');
  console.log(`${new Date().toISOString()}[test] Created file: ${config.db.usrs}`);
}

/**
 * Test application loop
 */
module.exports = async function testLoop(bot) {

  // Load bookmark to determine lastpid
  const bookmarkFile = await readFile(config.bookmark);
  const lastpid = JSON.parse(bookmarkFile).pid;

  // Check if any new posts, and if true, execute loop
  const cmds = await bot.fetchThreadCommandsSince(lastpid);
  const lastcmd = cmds.slice(-1)[0];
  if (lastcmd.pid > lastpid) {

    // Login bot
    await bot.login();

    // Foreach command, prepare final response
    const textHead = '';
    const textBody = await cmds.reduce(async (text, cmd) => {
      await text;
      await cmd;

      // Skip old commands or commands issued by the bot
      if (cmd.user != process.env.HIORI_USER && cmd.pid > lastpid ) {

        // Parse arguments and build reply
        const reply = await testParseArgs(cmd) + '\n';
        const quote = Hiori.bbCodeQuote(cmd);
        return await text + quote + reply;

      } else {
        return await text;
      }
    }, Promise.resolve(textHead));
    const response = Hiori.stripUserCode(textBody);

    // Make Reply
    await bot.replyThread(config.thread_id, response);
    console.log(`${new Date().toISOString()}[test] Sent reply:\n\n${response}`);

    // Update bookmark
    await writeFile(config.bookmark, JSON.stringify(lastcmd), 'utf8');
    console.log(`${new Date().toISOString()}[test] Wrote file: ${config.bookmark}`);

  }

}
