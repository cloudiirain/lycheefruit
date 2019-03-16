"use strict";

const Datastore = require('nedb')
const Hiori = require('hiori');
const config = require('./config.json');
const testLoop = require('./test/index.js')

/* Startup checks */
 if (!process.env.HIORI_USER || !process.env.HIORI_PSWD) {
   console.log('Please set HIORI_USER and HIORI_PSWDD environment variables.')
   process.exit(1);
 }

 /* Load and configure databases */
const db = {
  "test": {
      "msgs": new Datastore({ filename: config.test.db.msgs, autoload: true }),
      "usrs": new Datastore({ filename: config.test.db.usrs, autoload: true })
  }
}
db.test.msgs.ensureIndex({ fieldName: 'pid', unique: true });

/**
 * Main application loop
 */
const mainLoop = async () => {
  console.log(`${new Date().toISOString()}[main] Start loop.`);

  // Start hiori instance
  const hiori = new Hiori(process.env.HIORI_USER, process.env.HIORI_PSWD);
  hiori.init(async () => {

    // Register apps
    await testLoop(hiori, db, config);

    hiori.close();
  });
}

/**
 * Set main loop to repeat every X milliseconds.
 */
console.log(`${new Date().toISOString()}[main] Starting application.`);
setInterval(mainLoop, config.global.loop_interval);
