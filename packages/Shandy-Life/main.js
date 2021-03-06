/*
  _|_|_|  _|                                  _|                _|        _|      _|_|
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|
                                                        _|
                                                    _|_|
 *****************************************************************
 * @overview GTA:Multiplayer Shandy Life - Roleplay: Main File   *
 * @authors "Daranix"                                            *
 *****************************************************************

  This package was based on the default server package: https://master.gta-mp.net/LICENSE
  
  * The contents of this package can be modified but you should mention the original author (Daranix)
  


 */

"use strict";

/*
    A few notes from Jan (Waffle):
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

//Basic player global variables
/*global.PlayerInfo = [];
global.PlayerInventory = [];

//Other player variables
global.pLogged    = [];
global.pInCall    = [];
global.pInCallNumber  = [];
global.ConfirmReg = [];
global.ConfirmPwd = [];
global.Registered = [];
global.GroupInvite = [];*/
// ----

// Shopping system variables
global.g_shops = 0;
global.ShopInfo = [];

// Group system variables
global.g_groups = 0;
global.GroupInfo = [];

// Farm system variables
global.g_farmpoints = 0;
global.FarmPoint = [];

// House system variables
global.g_houses = 0;
global.HouseInfo = [];
global.g_housesv2 = [];

// Vehicle system variable
global.VehInfo = [];


// Timers of call system
global.TimerRing  = [];
global.gTimerRing = [];

//Assoc faction ID to name
global.FactionName = ["none",    // 0
                      "Police"]; // 1
//Assoc license to a name
global.LicenseName = ["Drive license", // car 0
                      "Boat license",  // boat 1
                      "Truck license",  // truck 2
                      "Helicopter pilot license", // pilot_helicopter 3
                      "Plane pilot license"]; // pilot_plane 4

global.gm = {
  commandManager: new (require('./commandManager'))(),
  commands: require('./commands/commands.js'),
  config:   require('./config.js'),
  events:   require('./events.js'),
  utility:  require('./utility.js'),
  mysql:    require('./node_modules/mysql'),
  md5:      require('./node_modules/md5'),
  items:    require('./inventory.js'),
  rpsys:    require('./roleplay_systems/systems')
  //fs:       require('./node_modules/writable-file-stream') // ONLY WRITE
};

/**
 * The main function of this package.
 */

function main() {

  gm.utility.print("Registering Events...");
  gm.events.register();
  gm.utility.print("Registering commands...");
  gm.commands(gm.commandManager.add.bind(gm.commandManager));

  // Load shop system
  //gm.utility.LoadShops();
  gm.rpsys.LoadShops();
  gm.rpsys.LoadFarms();

  // ---- This is for check database connection and spawn vehicles ----- //

  let connection = gm.utility.dbConnect();

  connection.connect(function(err) {
    if(err) {
      console.log("Error connecting to the database ... ");
      throw err;
    } else {
      console.log('Database connected!')
    }
  });

  gm.utility.LoadVehicles(connection); // Spawn the vehicles
  gm.rpsys.LoadGroups(connection); // Load groups
  gm.rpsys.LoadHouses(connection);

  connection.end();

  // ----------------------------------------------------------------- //

  let updateInterval = gm.utility.minutes(1);
  gm.utility.print("Player update interval: " + updateInterval + " miliseconds");

  //setInterval(function() { gm.events.updateAllPlayers(); }, updateInterval);

  console.log("+==============================================================+");
  console.log("  _______ __                   __        ___    __  ___");
  console.log(" |   _   |  |--.---.-.-----.--|  .--.--.|   |  |__.'  _.-----.");
  console.log(" |   1___|     |  _  |     |  _  |  |  ||.  |  |  |   _|  -__|");
  console.log(" |____   |__|__|___._|__|__|_____|___  ||.  |__|__|__| |_____|");
  console.log(" |:  1   |                       |_____||:  1   | ");
  console.log(" |::.. . |                              |::.. . | ");
  console.log(" `-------'                              `-------' ");
  console.log("+=============================================================+");
  gm.utility.print("Server started!");

}

main();
