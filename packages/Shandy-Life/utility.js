/*
 
  _|_|_|  _|                                  _|                _|        _|      _|_|            
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
                                                        _|                                        
                                                    _|_| 
 ********************************************************************
 * @overview GTA:Multiplayer | Shandy Life | Roleplay: Utility file *
 * @author "Daranix"											    *
 ********************************************************************
 */
"use strict";

let Utility = module.exports;
Utility.hashes = require('./hashes/hashes');
Utility.interiors = require('./interiors');

/**
 * Broadcasts a Message to all Players.
 *
 * @param {string} message the message to broadcast.
 * @param {RGB=} [opt_color] color of the message
 */
Utility.broadcastMessage = (message, opt_color) => {
  //for (let player of gtamp.players) {
  for(let i = 0; i < gtamp.players.length; i++) {
      gtamp.players[i].SendChatMessage(message, opt_color);
  }
};

/**
 * Returns the player from his id or (part of his) Name
 *
 * @param  {string/number} idOrName Networkid or name of the player (or some digits of the name)
 * @param  {boolean=} [allowDuplicates=false] False: If multiple players have the same Name only the first one found is returned.
 *                                            True: Returns an array with all duplicate players with the name
 * @param  {boolean=} [caseSensitive=false] True if case sensitive, false if not
 * @return {Player} An array with the players found with the id or the name,
 *                  only contains the first one found if allowDuplicates was false, empty array if no player was found
 */
 
Utility.getPlayer = function(idOrName, opt_allowDuplicates, opt_caseSensitive) {
    let allowDuplicates = opt_allowDuplicates || false;
    let caseSensitive = opt_caseSensitive || false;
    let id = parseInt(idOrName);
    let fnCheck;

    if (isNaN(id)) {
      if(caseSensitive === false) {
        idOrName = idOrName.toLowerCase();
      }

      // define fnCheck to check the players name
      fnCheck = target => {
        let targetName;
        if(caseSensitive === false) {
          //ignore capital letters
          targetName = target.name.toLowerCase();
        }
        else {
          // do not ignore capital letters
          targetName = target.name;
        }
        if (targetName.indexOf(idOrName) === 0) {
          return true;
        }
        return false;
      };
    }
    else {
      fnCheck = target => target.client.networkId === id;
    }

    let playerArray = [];
    for (let i = 0; i < gtamp.players.length; i++) {
      const tempPlayer = gtamp.players[i];
      if (fnCheck(tempPlayer)) {
        playerArray.push(tempPlayer);
        if(allowDuplicates === false) {
          // exit the loop, because we just return the first player found
          break;
        }
      }
    }
    return playerArray;
  };

// ---------- CUSTOM RP FUNCTIONS ------------ //

Utility.GotMoney = (player, needmoney, callback) => {
	
	let money = GetPlayerMoney(player);

	let result = money - needmoney;

	if(result < 0) {
		callback(Math.abs(result));
		return false;
	} else {
		callback(0);
		return true;
	}
}

Utility.sleep = (time, callback) => {
	var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

Utility.getAllArgs = function(args) {
	
	let fullText = args[1];

	for(let i = 2; i < args.length; i++) {
		fullText += " " + args[i];
	}

	return fullText;
}

Utility.RandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

Utility.GetDistanceBetweenPoints = function(v1, v2) {
  const dx = Math.abs(v1.x - v2.x);
  const dy = Math.abs(v1.y - v2.y);
  const dz = Math.abs(v1.z - v2.z);
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
}

Utility.GetPlayerDistanceToPoint = function(player, vector) {
  return Utility.GetDistanceBetweenPoints(player.position, vector);
}

Utility.GetVehicleDistanceToPoint = function(vehicle, vector) {
  return Utility.GetDistanceBetweenPoints(vehicle.position, vector);
}

Utility.GetPlayerDistanceToVehicle = function(player, vehicle) {
  return Utility.GetDistanceBetweenPoints(player.position, vehicle.position);
}

Utility.GetPlayerDistanceToPlayer = function(player1, player2) {
  return Utility.GetDistanceBetweenPoints(player1.position, player2.position);
}

Utility.PlayerToPoint = (range, player, x, y, z) => {

    let sphere = new Utility.sphere(x, y, z, range)

    return sphere.inRangeOfPoint(player.position);
};

Utility.GetPlayerMoney = (player) => {
	return player.stats.GetStatInt("SP0_TOTAL_CASH");
	// Or player.stats.money must work ^^
};

Utility.SetPlayerMoney = (player, money) => {
	return player.stats.SetStatInt("SP0_TOTAL_CASH", money);
	// Or player.stats.money must work ^^
};

Utility.GivePlayerMoney = (player, money) => {
	let fmoney = Utility.GetPlayerMoney(player) + (money);
	player.stats.SetStatInt(player, fmoney);
	// Or player.stats.money must work ^^
};

Utility.dbConnect = () => {
  gm.utility.print("Server wants to connect");
	return gm.mysql.createConnection({
        host     : gm.config.mysql.host,
        user     : gm.config.mysql.user,
        password : gm.config.mysql.password,
        database : gm.config.mysql.database
    });
};

Utility.ban = (player) => {
	
	let connection = Utility.dbConnect(); /*gm.mysql.createConnection({
        host     : gm.config.mysql.host,
        user     : gm.config.mysql.user,
        password : gm.config.mysql.password,
        database : gm.config.mysql.database
    });*/

	connection.connect();

	let SQLQuery = "UPDATE users SET banned = 1 WHERE id = " + player.info.id;
	gm.utility.print(player.name + "has been banned");
	connection.query(SQLQuery);

	connection.end();

};

Utility.unban = (player) => {
	
	let connection = Utility.dbConnect(); /*gm.mysql.createConnection({
        host     : gm.config.mysql.host,
        user     : gm.config.mysql.user,
        password : gm.config.mysql.password,
        database : gm.config.mysql.database
    });*/

	connection.connect();

	let SQLQuery = "UPDATE users SET banned = 0 WHERE id = " + player.info.id;
	gm.utility.print(player.name + "has been unbanned");
	connection.query(SQLQuery);

	connection.end();

};

/**
 * Broadcasts a Message to all Players in faction ID.
 * @param {int} id of faction players to send the message
 * @param {string} message the message to broadcast.
 * @param {RGB=} [opt_color] color of the message
 */

Utility.groupMessage = function(gid, message, opt_color) {
  //for (let player of gtamp.players) {
  for(let i = 0; i < gtamp.players.length; i++) {

  	if(gtamp.players[i].info.groupid == gid) {
    	gtamp.players[i].SendChatMessage(message, opt_color);
	 }
  }
};

Utility.factionMessage = function(faction, message, opt_color) {
  //for (let player of gtamp.players) {
  for(let i = 0; i < gtamp.players.length; i++) {

    if(gtamp.players[i].info.faction == faction) {
      gtamp.players[i].SendChatMessage(message, opt_color);
   }
  }
};

Utility.adminMessage = function(message, opt_color) {
  for(let i = 0; i < gtamp.players.length; i++) {
  	if(gtamp.players[i].info.adminlvl >= 1) {
    	gtamp.players[i].SendChatMessage(message, opt_color);
	 }
  }
};

Utility.proximityMessage = function(radi, sender, message, opt_color) {
	//for(let receptor of gtamp.players) {
  for(let i = 0; i < gtamp.players.length; i++) {
    let receiver = gtamp.players[i];
		if(Utility.PlayerToPoint(radi, receiver, sender.position.x, sender.position.y, sender.position.z) && receiver.dimension == sender.dimension) {
			receiver.SendChatMessage(message, opt_color);
		}
	}
};

Utility.seconds = (seconds) => {
	return seconds * 1000;
};

Utility.minutes = (minutes) => {
	return Utility.seconds(60) * minutes;
};

Utility.timestamp = () => {
	let d = new Date();
	let year = d.getFullYear();
	let month = d.getMonth();
	let day = d.getDate();
	let hour = d.getHours();
	let min = d.getMinutes();
	let secs = d.getSeconds();
	let time = "(" + day + "-" + month + "-" + year + " || " + hour + ":" + min + ":" + secs + ")";
	return time;
};

Utility.isInArray = (value, array) => {
  //return array.indexOf(value) > -1;

  let result = array.indexOf(value);

  if(result >= 0) return true;
  else return false;

};

Utility.print = (msg) => {
  let fmsg = Utility.timestamp() + " " + msg;
  console.log(fmsg);
  /*let f = gm.fs("./logs/general.txt");
  f.write(fmsg+ "\n");
  f.end();*/
};

// -------- Phone system ------------- //

Utility.generatePhoneNumber = () => {

	let number 	= 0;
	let numRows = 0;

	let connection = Utility.dbConnect();

	connection.connect();

	do {

		number = Math.floor(100000000 + Math.random() * 900000000);
	    connection.query("SELECT phone FROM users WHERE phone = " + number, function(err, results) {
	        numRows = results.length;
	    });

	} while (numRows >= 1);

	connection.end();
	return number;
};

//let timerRing, gtimerRing;

Utility.CallNumber = (caller, number) => {

	let result = false;
	
	for (let called of gtamp.players) 
	{
		if(called.info.phone == number) 
		{
    		called.SendChatMessage("Your phone is ringing (hang on with: /hangon)", new RGB(255,0,0));
    		Utility.proximityMessage(100.0, caller, called.name + "'s phone is ringing");

    		TimerRing[called.name] = setInterval(function() {
    			called.SendChatMessage("Your phone is ringing", new RGB(255,0,0));
    			Utility.proximityMessage(100.0, called, called.name + "'s phone is ringing");
    		}, Utility.seconds(10));

    		gTimerRing[called.name] = setTimeout(function() { Utility.phoneRing(called, caller); }, Utility.minutes(1));
    		result = true;
    		break;
    	}
  	}

  return result;
};

Utility.phoneRing = (called, caller) => {
	called.SendChatMessage("You have not answered the call");
	caller.SendChatMessage("Your call has not been answered");
	/*pInCall[caller.name] = false;
	pInCallNumber[caller.name] = 0;
	pInCall[called.name] = false,
	pInCallNumber[called.name] = 0;*/
  caller.inCall = false;
  caller.inCallNumber = 0;
  called.inCall = false;
  called.inCallNumber = 0;
	clearInterval(TimerRing[called.name]);
	clearTimeout(gTimerRing[called.name]);

};

Utility.phoneTalkTo = (caller, message, opt_color) => {
	
	for(let called of gtamp.players) 
	{
		//if(called.info.phone == pInCallNumber[caller.name] && pInCall[called.name] == true && pInCallNumber[called.name] == PlayerInfo[caller.name].phone)
    if(called.info.phone == caller.inCallNumber && called.inCall == true && called.inCallNumber == caller.info.phone)
		{
			called.SendChatMessage(message, opt_color);
		}
	}
};

// ---------------------------------- //

Utility.sphere = class Sphere { // By Tirus

    constructor(x, y, z, opt_radius) {
	    this.x = x;
	    this.y = y;
	    this.z = z;
	    this.radius = opt_radius || 1;
    }

};

Utility.sphere.prototype.inRangeOfPoint = function(position) { // By Tirus

	//console.log(position.x);
	return (Math.pow((position.x - this.x), 2) +
            Math.pow((position.y - this.y), 2) +
            Math.pow((position.z - this.z), 2) < Math.pow(this.radius, 2));
}

// ------------  Vehicle spawn -----------//

Utility.spawnVehicle = function(model, x, y, z, rotation, col1, col2) {

	let exrotation = rotation || 0;
  let excolor1 = col1 || new RGBA(gm.utility.RandomInt(0, 255), gm.utility.RandomInt(0,255), gm.utility.RandomInt(0,255), 255);
  let excolor2 = col2 || new RGBA(gm.utility.RandomInt(0, 255), gm.utility.RandomInt(0,255), gm.utility.RandomInt(0,255), 255);

	//console.log(model);
	let fmodel;
	if(typeof model === "string") {
		fmodel = Utility.hashes.findByName(gm.utility.hashes.vehicles, model);
	} else {
		fmodel = Utility.hashes.vehicles[model];
	}

	//console.log(fmodel)
	  const vehicle = new Vehicle(model.h, new Vector3f(x, y, z));
  	vehicle.rotation.z = exrotation;

    vehicle.primaryRGBAColor   = excolor1;
    vehicle.secondaryRGBAColor = excolor2;

  	gm.events.OnVehicleSpawn(vehicle);
  	return vehicle;
}

Utility.LoadVehicles = (dbconnection) => {

  let connection = dbconnection;

  let SQLQuery = "SELECT * FROM cars";

  connection.query(SQLQuery, function(err, result) {
  console.log("Loading vehicles...");
    if(err) {
      gm.utility.print("An error ocurred trying to load a vehicle");
      gm.utility.print("QUERY: " + SQLQuery);
      gm.utility.print("[ERROR]: " + err);
    } else {
    	let num_rows = result.length;
    	let cr = 0;

    	while(num_rows > cr) {
    		const v = Utility.spawnVehicle(result[cr].modelid, result[cr].posx, result[cr].posy, result[cr].posz);
        VehInfo[v.networkId] = {
          id: result[cr].carid,
          owner: result[cr].ownerid,
          locked: true
        }
    		cr++;
    	}

      //console.log()

    	console.log("Spawned " + cr + " car(s)")
    }

  });


}



