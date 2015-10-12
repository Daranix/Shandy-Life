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
  for (let player of gtamp.players) {
    player.SendChatMessage(message, opt_color);
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
	
	let fullText = "";

	for(let i = 1; i < args.length; i++) {
		fullText += args[i] + " ";
	}

	return fullText;
}

Utility.RandomInt = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

Utility.GetDistanceBetweenPoints = (x1, y1, z1, x2, y2, z2) => {
	return parseFloat(parseFloat(Math.sqrt(Math.pow(Math.abs(x1 - x2),2)), Math.sqrt(Math.pow(Math.abs(y1 - y2), 2))), Math.sqrt(Math.pow(Math.abs(z1 - z2),2)))
};

Utility.GetPlayerDistanceToPoint = (player, x, y, z) => {
	return Utility.GetDistanceBetweenPoints(player.position.x, player.position.y, player.position.z, x, y, z);
};

Utility.GetVehicleDistanceToPoint = (vehicle, x, y, z) => {
	return Utility.GetDistanceBetweenPoints(vehicle.position.x, vehicle.position.y, vehicle.position.z, x, y, z);
}

Utility.GetPlayerDistanceToVehicle = (player, vehicle) => {
	return Utility.GetDistanceBetweenPoints(player.position.x, player.position.y, player.position.z, vehicle.position.x, vehicle.position.y, vehicle.position.z);
}

Utility.GetPlayerDistanceToPlayer = (player1, player2) => {
	return Utility.GetDistanceBetweenPoints(player1.position.x, player1.position.y, player1.position.z, player2.position.x, player2.position.y, player2.position.z);
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
	let fmoney = GetPlayerMoney(player) + (money);
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

	let SQLQuery = "UPDATE users SET banned = 1 WHERE id = " + PlayerInfo[player.name].id;
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

	let SQLQuery = "UPDATE users SET banned = 0 WHERE id = " + PlayerInfo[player.name].id;
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

Utility.groupMessage = (gid, message, opt_color) => {
  for (let player of gtamp.players) {
  	if(PlayerInfo[player.name].groupid == gid) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.factionMessage = (faction, message, opt_color) => {
  for (let player of gtamp.players) {
  	if(PlayerInfo[player.name].faction == faction) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.adminMessage = (message, opt_color) => {
  for (let player of gtamp.players) {
  	if(PlayerInfo[player.name].adminlvl >= 1) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.proximityMessage = (radi, sender, message, opt_color) => {
	for(let receptor of gtamp.players) {
		if(Utility.PlayerToPoint(radi, receptor, sender.position.x, sender.position.y, sender.position.z)) {
			receptor.SendChatMessage(message, opt_color);
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
		if(PlayerInfo[called.name].phone == number) 
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
	pInCall[caller.name] = false;
	pInCallNumber[caller.name] = 0;
	pInCall[called.name] = false,
	pInCallNumber[called.name] = 0;
	clearInterval(TimerRing[called.name]);
	clearTimeout(gTimerRing[called.name]);

};

Utility.phoneTalkTo = (caller, message, opt_color) => {
	
	for(let called of gtamp.players) 
	{
		if(PlayerInfo[called.name].phone == pInCallNumber[caller.name] && pInCall[called.name] == true && pInCallNumber[called.name] == PlayerInfo[caller.name].phone) 
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

	console.log(position.x);
	return (Math.pow((position.x - this.x), 2) +
            Math.pow((position.y - this.y), 2) +
            Math.pow((position.z - this.z), 2) < Math.pow(this.radius, 2));
}

// ------------  Vehicle spawn -----------//

Utility.VehicleSpawn = function(model, x, y, z, rotation, col1, col2) {

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
    		Utility.VehicleSpawn(result[cr].modelid, result[cr].posx, result[cr].posy, result[cr].posz);
    		cr++;
    	}

    	console.log("Spawned " + cr + " car(s)")

    }

  });


}



