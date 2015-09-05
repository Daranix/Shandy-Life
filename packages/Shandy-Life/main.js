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
 * @authors "Daranix" & Jan "Waffle" C.                          *
 *****************************************************************
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

//Data player vars
/*global.pAdmin     = [];
global.pMoney     = [];
global.pFaction   = [];
global.pId        = [];*/
//global.pLicenses  = [[],[]];

// PlayerInfo definition
global.PlayerInfo = [];
global.PlayerInventory = [];

//Other player variables
global.pLogged    = [];
global.pInCall    = [];
global.pInCallNumber  = [];
global.ConfirmReg = [];
global.ConfirmPwd = [];
global.Registered = [];
global.GroupInvite = [];
// ----

// Shopping system variables
global.g_shops = 0;
global.ShopInfo = [];
// Group system variables
global.g_groups = 0;
global.GroupInfo = [];


// Timers of call system
global.TimerRing = [];
global.gTimerRing = [];

//Assoc faction ID to name
global.FactionName = ["none",    // 0
                      "Police"]; // 1
//Assoc license to a good name
global.LicenseName = ["Drive license", // car
                      "Boat license",  // boat
                      "Truck license",  // truck
                      "Helicopter pilot license", // pilot_helicopter 
                      "Plane pilot license"]; // pilot_plane

global.gm = {
  config:   require('./config.js'),
  events:   require('./events.js'),
  utility:  require('./utility.js'),
  mysql:    require('./node_modules/mysql'),
  md5:      require('./node_modules/md5'),
  items:    require('./inventory.js')
  //fs:       require('./node_modules/writable-file-stream') // ONLY WRITE
};

/**
 * The main function of this package.
 */

function main () {
  
  gm.utility.print("Registering Events...");
  gm.events.register();

  // Load shop system
  gm.utility.LoadShops();

  // ---- This is for check database connection and spawn vehicles ----- //

  let testdb = gm.utility.dbConnect(); 

  testdb.connect(function(err) {
    if(err) {
      console.log("Error connecting to the database ... ")
      throw err;
    } else {
      console.log('Database connected!')
    }
  });

  gm.utility.LoadVehicles(testdb); // Spawn the vehicles
  gm.utility.LoadGroups(testdb); // Spawn groups
  testdb.end();

  // ----------------------------------------------------------------- //

  let updateInterval = gm.utility.minutes(1);
  gm.utility.print("Player update interval: " + updateInterval + " miliseconds");

  setInterval(function() { gm.events.updateAllPlayers(); }, updateInterval);

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




