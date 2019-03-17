/**
 * @module helpers.js
 * @author cloudiirain
 * @description Module for custom helper functions.
 */

const fs = require('fs');
const util = require('util');
const { consoleLog } = require('hiori');
const writeFile = util.promisify(fs.writeFile);

/**
 * Writes a JSON object to a file path.
 * @param {string} path
 * @param {object} json
 * @return {Promise}
 */
const asyncWriteFile = (path, json, context, verbose=true) => {
  if (verbose) {
    consoleLog(`Wrote file: ${path}`, context);
  }
  return writeFile(path, JSON.stringify(json, null, 2), 'utf8');
}

module.exports = {
  asyncWriteFile: asyncWriteFile
}
