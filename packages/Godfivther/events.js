/*

/*
 
  _|_|_|  _|                                  _|                _|        _|      _|_|            
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
                                                        _|                                        
                                                    _|_| 
 *****************************************************************
 * @overview GTA:Multiplayer Shandy Life - Roleplay: Events      *
 * @author "Daranix" & Jan "Waffle" C.                           *
 *****************************************************************
*/

"use strict";

/**
 * @namespace
 */

let Events    = module.exports;
let commands  = require('./commands');
//let mysql     = require('./node_modules/mysql');

/**
 * Registers all Events.
 *
 */
Events.register = () => {
  // Note: 'events' is the GTA:MP Event-System.
  events.Add("ClientConnected", Events.onClientConnected);
  events.Add("ClientDisconnected", Events.onClientDisconnected);

  events.Add("ChatMessage", Events.onChatMessage);
  events.Add("ChatCommand", Events.onChatCommand);

  events.Add("PlayerCreated", Events.onPlayerCreated);
  events.Add("PlayerDestroyed", Events.onPlayerDestroyed);

  events.Add("PlayerShot", Events.onPlayerShot);
  events.Add("PlayerDeath", Events.onPlayerDeath);
};

/**
 * Called when a Client connects
 *
 * @param {Client} client the new client
 */
Events.onClientConnected = client => {
  console.log("Client (ip: " + client.ipAddress + ") connected.");
};

/**
 * Called when a Client disconnects
 *
 * @param {Client} client the new client
 * @param {integer} reason disconnect reason
 */
Events.onClientDisconnected = (client, reason) => {
  console.log("Client (ip: " + client.ipAddress + ") disconnected. Reason: " + (reason === 1 ? "Timeout" : "Normal quit"));
};

/**
 * Called when a Player typed a message in the chat.
 *
 * @param {Player} player the player
 * @param {string} message the message
 * @returns {boolean} whether the chat message should be blocked or not.
 */
Events.onChatMessage = (player, message) => {
  // basic example on blocking swearing players
  /*let lowMsg = message.toLowerCase();
  for (let badWord of gm.config.badWords) {
    if (lowMsg.indexOf(badWord.toLowerCase()) !== -1) {
      player.SendChatMessage("Please be nice.", new RGB(255, 59, 59));
      return true;
    }
  }*/
    //return `${player.name}: ${message}`;
    let fmsg = player.name + ': ' + message;

    if(pInCall[player.name]) {
      if(pInCallNumber[player.name] == 911) {
        let callMessage = "(CALL) " + message;  
        gm.utility.factionMessage(1, callMessage, new RGB(0,0,255));
      } else {
        fmsg = "(Phone) " + player.name + ": " + message;
        gm.utility.phoneTalkTo(player, fmsg, new RGB(255,255,0));
      }
    }

    gm.utility.proximityMessage(100.0, player, fmsg, new RGB(255,255,255))
    return true;  
};

/**
 * Called when a Player types in a chat command (e.g. /command)
 *
 * @param {Player} player the player
 * @param {string} command the command
 */
Events.onChatCommand = (player, command) => {
  let args = command.split(" ");

  // Let's check if this crazy thing ever happens.
  if (args.length === 0) {
    throw "This should NEVER happen.";
  }
  let commandName = args.splice(0, 1)[0];

  for (const command of commands) {
    if (command[0].toLowerCase() === commandName.toLowerCase()) {
      //console.log("[CMD] " + player.name + ": /" + commandName);
      command[1](player, args);
      
      return true;
    }
  }
  player.SendChatMessage("Unknown command.", new RGB(255, 59, 59));
};

/**
 * Called when a new Player was created (after he connected)
 *
 * @param {Player} player the new player
 */
Events.onPlayerCreated = player => {
  

  /*pAdmin[player.name]     = 0;
  pLogged[player.name]    = false;
  pFaction[player.name]   = 0;
  pMoney[player.name]     = 0;*/
  pLogged[player.name]    = false;
  ConfirmReg[player.name] = false;

  PlayerInfo[player.name] = {
    id: 0,
    adminlvl: 0,
    faction: 0,
    factionrank: 0,
    phone: 0,
    licenses: {
      car: false,
      boat: false,
      truck: false,
      pilot_helicopter: false,
      pilot_plane: false
    },
  };

  /*PlayerInventory[player.name] = {
    objects: {},
    objectsQuantity: {},
    weight: 0,
    maxWeight: 64

  };*/

  console.log("Player " + player.name + " has successfully joined the server.");

  // Set world for the player
  let now = new Date();
  player.world.SetTime(now.getHours(), now.getMinutes(), now.getSeconds());
  player.world.timeScale = gm.config.world.timeScale;
  player.world.weather = gm.config.world.defaultWeather;

  for (let ipl of gm.config.world.IPLs) {
    player.world.RequestIPL(ipl);
  }
  for (let interior of gm.config.world.interiors) {
    player.world.EnableInterior(interior);
    if (!gm.config.world.capInteriors) {
      player.world.UnCapInterior(interior);
    }
  }

  player.SendChatMessage("Welcome to my Server!", new RGB(0, 255, 0));
  player.SendChatMessage("<em>Type /help to see a list of all commands</em>");

  // REG SYSTEM - Check if player is registered.

    let connection = gm.utility.dbConnect();

    /*connection.connect(function(err){
      
      if(!err) {
          console.log("Database is connected ... \n\n");  
      } else {
          console.log("Error connecting database ... \n\n");  
      }

    });*/

    connection.connect();

    let playername = connection.escape(player.name);
    connection.query("SELECT name FROM users WHERE name = " + playername, function(err, results) {
        
        let numRows = results.length;

        if(numRows >= 1) {
          player.SendChatMessage("Use /login [password] to login");
          Registered[player.name] = true;

        } else {
          player.SendChatMessage("You wasn't registered, use /register [Password] to register");
          Registered[player.name] = false;
        }
    });
    connection.end();
    console.log("Players connected: " + g_players.length);
  // --
};

/**
 * Called when a Player dies
 *
 * @param {Player} player the player that is no more :'(
 * @param {integer} reason the reason (hash)
 */
Events.onPlayerDeath = (player, reason, killer) => {
  let message = "~r~" + player.name + "~s~ ";
  if (typeof killer !== "undefined") {
    if (killer === player) {
      message += "killed himself.";
    } else {
      if(typeof killer.name !== "undefined") {
        message += "has been killed by ~r~" + killer.name + "~s~.";
      } else {
        message += "has been run over by a vehicle (probably).";
      }
    }
  } else {
    message += "died.";
  }
  for (let tempPlayer of g_players) {
    tempPlayer.graphics.ui.DisplayMessage(message);
  }
};

/**
 * Called when a Player shot
 *
 * @param {Player} player the shooting player
 * @param {integer} weaponType the weapon he used to shoot
 * @param {Vector3f} aimPos aim position
 */
Events.onPlayerShot = player => {
  player.graphics.ui.DisplayMessage("~r~SHOTS FIRED");
};

/**
 * Called when a Player is leaving the Server
 *
 * @param {Player} player the leaving player
 */
Events.onPlayerDestroyed = player => {
  console.log("Player " + player.name + " is leaving the server.");
};

/**
 * Called when you want
 * this shit uploads all player variables to the DB
 * This event wasn't a GTA:MP native event
*/

Events.onPlayerUpdate = (player, callback, info) => {
  //let showInfo = info || true;
  info = typeof info !== 'undefined' ? info : true;
  let connection = gm.utility.dbConnect();
  
  let jsonString = JSON.stringify(PlayerInfo[player.name].licenses);

  connection.connect();

  let SQLQuery = "UPDATE users SET" +
  " adminlvl=" + PlayerInfo[player.name].adminlvl +
  " ,faction=" + PlayerInfo[player.name].faction +
  " ,licenses='" + jsonString + "'" +
  " ,phone=" + PlayerInfo[player.name].phone +
  " WHERE id = " + PlayerInfo[player.name].id;

  connection.query(SQLQuery, function(err) {
    if(err) {
      gm.utility.print("An error ocurred trying to upload the info of " + player.name);
      gm.utility.print("QUERY: " + SQLQuery);
      gm.utility.print("[ERROR]: " + err);
      callback(false);
      //player.SendChatMessage(gm.utility.timestamp() + " An error ocurred trying to upload your player info, please contact and administrator");
    } else {
      if(info) { gm.utility.print("player data of " + player.name + " has been updated " + info); }
      callback(true);
    }
  });

  connection.end();

};

Events.updateAllPlayers = () => {
  let loggedPlayers = 0;
  if(g_players.length >= 1) 
  {
     console.log("Uploading all players info...");
    for (let player of g_players) 
    {
      if(pLogged[player.name]) 
      {
        Events.onPlayerUpdate(player,function(){},false);
        loggedPlayers++;
      }
    }

    console.log("info of all players (" + loggedPlayers + ") has been uploaded");

  }
};

Events.onPlayerLogin = (player, dbData) => {

  //console.log("dbData: \n" + JSON.stringify(dbData));

  gm.utility.print("Player " + player.name + " logged in");

  /*
    ----- Check if licenses are ok -----
  */


  let parsedLicenses;

  if(dbData.licenses.length == 0) {
    parsedLicenses = PlayerInfo[player.name].licenses
  } else {
    parsedLicenses = JSON.parse(dbData.licenses);
  }

  let parsedLength = Object.keys(parsedLicenses).length;
  let licensesLength = Object.keys(PlayerInfo[player.name].licenses).length;

  if(parsedLength < licensesLength) {
    
    let howMuch = licensesLength - parsedLength;
    let keys = Object.keys(PlayerInfo[player.name].licenses);

    for(let i = howMuch; i <  licensesLength; i++) {
      parsedLicenses[keys[i]] = false;
    }
  }

  // ---- 

  /*if(dbLicenseslength == lengthLicenses) {
    parsedLicenses = JSON.parse(dbData.licenses);
  } else {
    parsedLicenses = PlayerInfo[player.name].licenses;
  }*/

  //let parsedLicenses = JSON.parse(dbData.licenses);

  // Put values to the player

  PlayerInfo[player.name] = {
    id: dbData.id,
    adminlvl: dbData.adminlvl,
    faction: dbData.faction,
    factionrank: dbData.factionrank,
    phone: dbData.phone,
    licenses: parsedLicenses /*{
      car: false,
      boat: false,
      truck: false,
      pilot_helicopter: false,
      pilot_plane: false
    },*/
  };

  pLogged[player.name] = true;
};

Events.OnVehicleSpawn = (vehicle) => {

  //console.log("car spawned");

};

