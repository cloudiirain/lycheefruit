"use strict";

const Hiori = require('hiori');

const config = require('./config.json');
const testLoop = require('./test/index.js')

/* Startup checks */
 if (!process.env.HIORI_USER || !process.env.HIORI_PSWD) {
   console.log('Please set HIORI_USER and HIORI_PSWDD environment variables.')
   process.exit(1);
 }

/**
 * Main application loop
 */
const mainLoop = async () => {
  console.log(`${new Date().toISOString()}[main] Start loop.`);

  // Start hiori instance
  const hiori = new Hiori(process.env.HIORI_USER, process.env.HIORI_PSWD);
  hiori.init(async () => {

    // Register apps
    await testLoop(hiori);

    hiori.close();
  });
}

/**
 * Set main loop to repeat every X milliseconds.
 */
console.log(`${new Date().toISOString()}[main] Starting application...`);
setInterval(mainLoop, config.loop_interval);
