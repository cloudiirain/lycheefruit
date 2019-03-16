"use strict";

const Hiori = require('hiori');

const config = require('./config.json');

/*
var bot = new Hiori(process.argv[2], process.argv[3]);
bot.init(async () => {
  const cmds = await bot.fetchThreadCommandsSince('4785847');
  console.log(cmds);
  bot.close();
});
*/

const main = () => {
  console.log(`${new Date().toISOString()}[main] Start loop.`);
}

// Main loop to repeat every X milliseconds
console.log(`${new Date().toISOString()}[main] Starting application.`);
setInterval(main, config.global.loop_interval);
