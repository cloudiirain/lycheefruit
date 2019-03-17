"use strict";

const fs = require('fs');
const { BBcode, NotFoundError, consoleLog } = require('hiori');
const Bookmark = require('../global/Bookmark.js');
const { asyncWriteFile } = require('../global/helpers.js');
const config = require('./config.json');
const parseArgs = require('./parser.js');


/**
 * Set up storage files if they do not exist.
 */
if (!fs.existsSync(config.db.usrs)) {
  asyncWriteFile(config.db.usrs, {}, config.scope);
}

/**
 * Test application loop
 */
module.exports = async function mainTestLoop(bot) {

  const bookmark = await Bookmark.loadOrFetch(config.bookmark, bot, config.thread_id);
  const lastBookmark = bookmark.stack.slice(-1)[0];

  try {

    // Check if any new commands, and if true, execute loop
    const commandList = await bot.fetchThreadCommandsSince(lastBookmark.pid);
    if (commandList.length) {

      // Inject prevPost bookmark context into first command
      commandList[0].prevPost = lastBookmark;

      // Foreach command, prepare final response
      const allText = await commandList.reduce(async (promiseText, cmd) => {
        const text = await promiseText;

        // Skip commands issued by the bot
        if (cmd.post.user != process.env.HIORI_USER) {

          // Parse arguments and build reply
          const reply = await parseArgs(cmd) + '\n';
          return await text + reply;

        } else {
          return await text;
        }
      }, Promise.resolve(''));
      const response = BBcode.stripUserStr(allText);

      // Make Reply
      await bot.replyThread(config.thread_id, response);
      consoleLog(`Sent reply:\n\n${response}`, 'stab');

      // Update bookmark
      bookmark.push(commandList);
      await bookmark.save();

    }

  } catch(e) {
    if (e instanceof NotFoundError) {
      // If post id wasn't found, this means it was deleted by its original user
      // We delete this pid from the bookmark stack so the next loop does not
      // run into the same error.
      bookmark.deleteOne();
      await bookmark.save();
    } else {
      throw new Error(e);
    }
  }

}
