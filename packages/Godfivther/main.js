/**
 * @overview The Godfivther
 * @author Jan "Waffle" C. edit: Daranix
 * @copyright (c) GTA:Multiplayer [gta-mp.net]
 * @license https://master.gta-mp.net/LICENSE
 */
"use strict";

/*
    A few notes from Jan:
    The default package is using the strict mode. If you need more information about the strict mode, read this:
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
    We are also using ES6 features:
        https://iojs.org/en/es6.html

    This package is split up into multiple files. This was a personal choice. You *could* append all content into one single file.
    However, this would become kind of messy somewhen. In order to keep your code as readable as possible, I decided to split it up.

    This package is also conform to Google's Javascript Style Guide:
        https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 */

// Creating a global namespace to prevent naming issues with GTA:MP
/**
 * @namespace
 */

//Data player vars
global.pAdmin     = [];
global.pLogged    = [];
global.pMoney     = [];
global.pFaction   = [];
global.pId        = [];
global.pLicenses  = [[][]];

//Other player variables
global.ConfirmReg = [];
global.ConfirmPwd = [];
global.Registered = [];


//Assoc faction ID to name
global.FactionName = ["none","Police"];

global.gm = {
  config:   require('./config.js'),
  events:   require('./events.js'),
  utility:  require('./utility.js'),
  mysql:    require('./node_modules/mysql'),
  md5:      require('./node_modules/md5'),
  //fs:       require('./node_modules/writable-file-stream') // ONLY WRITE
};

function printf(msg) {
  let fmsg = gm.utility.timestamp() + " " + msg;
  console.log(fmsg);
  /*let f = gm.fs("./logs/general.txt");
  f.write(fmsg+ "\n");
  f.end();*/
}

/**
 * The main function of this package.
 */
function main () {
  //console.log("Registering Events...");
  
  printf("Registering Events...")

  gm.events.register();

  printf("Server started!");
  let updateInterval = gm.utility.minutes(1);
  printf("Player update interval: " + updateInterval + " miliseconds");
  setInterval(function() { gm.events.updateAllPlayers(); }, updateInterval);
}

main();




