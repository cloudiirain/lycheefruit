"use strict";

const { Hiori, NotFoundError, NavigationError, HioriError, consoleLog } = require('hiori');

const mainStabLoop = require('./stab/index.js');
const config = require('./config.json');

/* Startup checks */
 if (!process.env.HIORI_USER || !process.env.HIORI_PSWD) {
   console.log('Please set HIORI_USER and HIORI_PSWDD environment variables.')
   process.exit(1);
 }

/**
 * Main application loop
 */
const mainLoop = async () => {
  consoleLog('Start loop.', 'main')

  // Start hiori instance
  const hiori = new Hiori(process.env.HIORI_USER, process.env.HIORI_PSWD);
  hiori.debug = true;
  hiori.init(async () => {

    //try {

      // Register apps
      await mainStabLoop(hiori);

    // Attempt to catch and silence soft errors
    /*
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof NavigationError) {
        consoleLog('ERROR!', e);
      } else{
        throw new Error(e);
      }
    }
    */

    hiori.close();
  });
}

/**
 * Set main loop to repeat every X milliseconds.
 */
consoleLog('Starting application...', 'main');
setInterval(mainLoop, config.loop_interval);
