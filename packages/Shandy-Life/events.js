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
 * @author "Daranix"                                             *
 *****************************************************************
*/

"use strict";

/**
 * @namespace
 */

let Events    = module.exports;

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

    if(player.inCall) {
      //if(pInCallNumber[player.name] == 911) {
      if(player.inCallNumber == 911) {
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
    let args = command.match(/('(\\'|[^'])*'|"(\\"|[^"])*"|\/(\\\/|[^\/])*\/|(\\ |[^ ])+|[\w-]+)/g) || [];
    for(var i=1;i<args.length;i++)
    {
      if( args[i].substr(0, 1) === '"' || args[i].substr(0,1) === "'" ) {
        args[i] = JSON.parse(args[i]);
      }
    }

    // Let's check if this crazy thing ever happens.
    if (args.length === 0) {
      throw "This should NEVER happen.";
    }
    let commandName = args.splice(0, 1)[0];

    if (!gm.commandManager.handle(player, commandName, args)) {
      player.SendChatMessage("Unknown command.", new RGB(255, 59, 59));
    }
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
  //pLogged[player.name]    = false;
  //ConfirmReg[player.name] = false;

  player.logged      = false;
  player.ConfirmReg  = false;
  player.registered  = false;
  

  /*PlayerInfo[player.name] = {
    id: 0,
    adminlvl: 0,
    faction: 0,
    factionrank: 0,
    phone: 0,
    groupid: 0,
    licenses: {
      car: false,
      boat: false,
      truck: false,
      pilot_helicopter: false,
      pilot_plane: false
    },
  };*/

  player.info = {
    id: 0,
    adminlvl: 0,
    faction: 0,
    factionrank: 0,
    phone: 0,
    groupid: 0,
    licenses: {
      car: false,
      boat: false,
      truck: false,
      pilot_helicopter: false,
      pilot_plane: false
    },
  };

  /*PlayerInventory[player.name] = {
    objects: [],
    objectsQuantity: [],
    weight: 0,
    maxWeight: 64
  };*/

 player.inventory = {
    objects: [],
    objectsQuantity: [],
    weight: 0,
    maxWeight: 64
  };

  console.log("Player " + player.name + " has successfully joined the server.");

  // Set world for the player
  let now = new Date();
  player.world.SetTime(now.getHours(), now.getMinutes(), now.getSeconds());
  player.world.timeScale = gm.config.world.timeScale;
  player.world.weather = gm.config.world.defaultWeather;

  /*for (let ipl of gm.config.world.IPLs) {
    player.world.RequestIPL(ipl);
  }
  for (let interior of gm.config.world.interiors) {
    player.world.EnableInterior(interior);
    if (!gm.config.world.capInteriors) {
      player.world.UnCapInterior(interior);
    }
  }*/

  for(let i = 0; i < gm.config.world.IPLs.length; i++) {
    player.world.RequestIPL(gm.config.world.IPLs[i]);
  }

  for(let i = 0; i < gm.config.world.interiors.length; i++) {
    player.world.EnableInterior(gm.config.interiors[i]);
    if(!gm.config.world.capInteriors) {
      player.world.UnCapInterior(gm.config.world.interiors[i]);
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
          //Registered[player.name] = true;
          player.registered = true;

        } else {
          player.SendChatMessage("You wasn't registered, use /register [Password] to register");
          //Registered[player.name] = false;
          player.registered = false;
        }
    });
    connection.end();
    console.log("Players connected: " + gtamp.players.length);
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
  for (let tempPlayer of gtamp.players) {
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
  //if(pLogged[player.name]) { Events.onPlayerUpdate(player); }
  if(player.logged) { Events.onPlayerUpdate(player); }
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
  
  //let jsonString = JSON.stringify(PlayerInfo[player.name].licenses);
  let jsonString = JSON.stringify(player.info.licenses);

  connection.connect();

  /*let SQLQuery = "UPDATE users SET" +
  " adminlvl=" + PlayerInfo[player.name].adminlvl +
  " ,faction=" + PlayerInfo[player.name].faction +
  " ,licenses='" + jsonString + "'" +
  " ,phone=" + PlayerInfo[player.name].phone +
  " ,groupid=" + PlayerInfo[player.name].groupid +
  " WHERE id = " + PlayerInfo[player.name].id;*/

  let SQLQuery = "UPDATE users SET" +
  " adminlvl=" + player.info.adminlvl +
  " ,faction=" + player.info.faction +
  " ,licenses='" + jsonString + "'" +
  " ,phone=" + player.info.phone +
  " ,groupid=" + player.info.groupid +
  " WHERE id = " + player.info.id;


  connection.query(SQLQuery, function(err) {
    if(err) {
      gm.utility.print("An error ocurred trying to upload the info of " + player.name);
      gm.utility.print("QUERY: " + SQLQuery);
      gm.utility.print("[ERROR]: " + err);
      if(callback) callback(false);
      //player.SendChatMessage(gm.utility.timestamp() + " An error ocurred trying to upload your player info, please contact and administrator");
    } else {
      if(info) { gm.utility.print("player data of " + player.name + " has been updated."); }
      if(callback) callback(true);
    }
  });

  connection.end();

};

Events.updateAllPlayers = () => {
  let loggedPlayers = 0;
  if(gtamp.players.length >= 1) 
  {
    let connection = gm.utility.dbConnect();
    connection.connect();

    console.log("Uploading all players info...");
    for(let i = 0; i < gtamp.players.length; i++) 
    {
      let player = gtamp.players[i];
      if(player.logged) 
      {
        //Events.onPlayerUpdate(player,function(){},false);
        let jsonString = JSON.stringify(player.info.licenses);
        let SQLQuery = "UPDATE users SET" +
        " adminlvl=" + player.info.adminlvl +
        " ,faction=" + player.info.faction +
        " ,licenses='" + jsonString + "'" +
        " ,phone=" + player.info.phone +
        " ,groupid=" + player.info.groupid +
        " ,posx=" + player.position.x +
        " ,posy=" + player.position.y +
        " ,posz=" + player.position.z +
        " WHERE id = " + player.info.id;

        connection.query(SQLQuery, function(err) {
          if(err) {
            gm.utility.print("An error ocurred trying to upload the info of " + player.name);
            gm.utility.print("QUERY: " + SQLQuery);
            gm.utility.print("[ERROR]: " + err);
            //player.SendChatMessage(gm.utility.timestamp() + " An error ocurred trying to upload your player info, please contact and administrator");
          }
        });

        loggedPlayers++;
      }
    }
    connection.end();
    console.log("info of all players (" + loggedPlayers + ") has been updated");
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
    parsedLicenses = player.info.licenses
  } else {
    parsedLicenses = JSON.parse(dbData.licenses);
  }

  let parsedLength = Object.keys(parsedLicenses).length;
  let licensesLength = Object.keys(player.info.licenses).length;

  if(parsedLength < licensesLength) {
    
    let howMuch = licensesLength - parsedLength;
    let keys = Object.keys(player.info.licenses);

    for(let i = howMuch; i <  licensesLength; i++) {
      parsedLicenses[keys[i]] = false;
    }
  }

  // ---- 

  // Put values to the player

 /* PlayerInfo[player.name] = {
    id: dbData.id,
    adminlvl: dbData.adminlvl,
    faction: dbData.faction,
    factionrank: dbData.factionrank,
    phone: dbData.phone,
    groupid: dbData.groupid,
    licenses: parsedLicenses /*{
      car: false,
      boat: false,
      truck: false,
      pilot_helicopter: false,
      pilot_plane: false
    },*/
  //};

  player.info = {
    id: dbData.id,
    adminlvl: dbData.adminlvl,
    faction: dbData.faction,
    factionrank: dbData.factionrank,
    phone: dbData.phone,
    groupid: dbData.groupid,
    licenses: parsedLicenses /*{
      car: false,
      boat: false,
      truck: false,
      pilot_helicopter: false,
      pilot_plane: false
    },*/
  };

  //pLogged[player.name] = true;
  player.logged = true;
};

Events.OnVehicleSpawn = (vehicle) => {

  //console.log("car spawned");

};

