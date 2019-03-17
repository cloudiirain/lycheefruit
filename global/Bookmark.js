/**
 * @module      Bookmark.js
 * @author      cloudiirain
 * @description Class for stashing information about recently read posts.
 */

'use strict';

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const { asyncWriteFile } = require('./helpers');
const config = require('../config.json');


/* Bookmark class */
module.exports = class Bookmark {

  /**
   * @typedef {Object} Bookmark
   * @property {string} file The file path for where the bookmark is stored.
   * @property {Object[]} stack A list of JSON objects that are stored.
   */

  /**
   * Constructs a ThreadPost object using a Cheerio selector.
   * Individual posts in NUF are wrapped by <li class="message"> tags. To
   * select posts in a thread, use the css selector: '#messageList .message'.
   * @param {string} filepath
   * @return {ThreadPost}
   */
  constructor(filepath, stack=[]) {
    this.file = filepath;
    this.stack = stack;
  }

  /**
   * Factory constructor for Bookmark class.
   * @return {Bookmark}
   */
  static async load (filepath) {
    const bookmark = new Bookmark(filepath);
    if (fs.existsSync(filepath)) {
      const bookmarkFile = await readFile(filepath);
      bookmark.stack = JSON.parse(bookmarkFile).stack;
      return bookmark;
    }
    return bookmark;
  }

  /**
   * Factory constructor for Bookmark class.
   * If a bookmark does not exist, a bookmark will be constructed from the
   * provided thread id.
   * @return {Bookmark}
   */
  static async loadOrFetch (filepath, bot, threadId) {
    const bookmark = await Bookmark.load(filepath);
    if (bookmark.stack.length) {
      return bookmark;
    }
    // No bookmarks saved, so get last posts from NUF and save new bookmark
    const url = await bot.fetchThreadLastPageURL(threadId);
    const threadPosts = await bot.fetchThreadPosts(url, false);
    const lastNPosts = threadPosts.slice(-1 * config.max_bookmark_size);
    bookmark.stack = lastNPosts.map((el) => { return el.toJSON(); });
    await bookmark.save();
    return bookmark;
  }

  /**
   * Add additional objects to the bookmark.
   * This method ensures that the total stack length does not exceed the max
   * configured length.
   * @param {DetailedCommand[]} commandList
   * @return {Object[]}
   */
  push (commandList) {
    // First convert the list of commands to a dictionary of posts
    const postDict = {};
    for (let i = 0; i < commandList.length; i++) {
      const cmd = commandList[i];
      const pid = cmd.post.pid.toString();
      if (!(pid in postDict)) {
        postDict[pid] = cmd.post;
      }
    }

    // Now convert the dictionary to an array
    const postArray = Object.keys(postDict).map(function(v) { return postDict[v]; });
    const sortArray = postArray.sort(function(a, b){ return a.pid - b.pid });

    // Now update
    const totalSize = this.stack.length + sortArray.length;
    const sizeDiff = totalSize - config.max_bookmark_size;
    if (sizeDiff > 0) {
      const trimmedStack = this.stack.slice(sizeDiff);
      this.stack = trimmedStack.concat(sortArray);
      return this.stack;
    }
    this.stack = this.stack.concat(sortArray);
    return this.stack;
  }

  /**
   * Deletes the most recent bookmark post.
   * @return {Object}
   */
  deleteOne () {
    const pop = this.stack.pop();
    consoleLog(`Post ${pop.pid} was deleted. Reverting bookmark...`, 'stab');
    return pop;
  }

  /**
   * Saves the current bookmark to file.
   * @return {Promise}
   */
  async save () {
    const json = { 'stack': this.stack };
    return asyncWriteFile(this.file, json);
  }

}
