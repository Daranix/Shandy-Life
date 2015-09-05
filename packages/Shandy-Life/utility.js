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
 * @author "Daranix" & Jan "Waffle" C.							    *
 ********************************************************************
 */
"use strict";

let Utility = module.exports;
Utility.hashes = require('./hashes/hashes');

/**
 * Broadcasts a Message to all Players.
 *
 * @param {string} message the message to broadcast.
 * @param {RGB=} [opt_color] color of the message
 */
Utility.broadcastMessage = (message, opt_color) => {
  for (let player of g_players) {
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
 
Utility.getPlayer = (idOrName, opt_allowDuplicates, opt_caseSensitive) => {
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
	for (let tempPlayer of g_players) {
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

Utility.PlayerToPoint = (range, player, x, y, z) => {

    let sphere = new Utility.sphere(x, y, z, range)

    return sphere.inRangeOfPoint(player.position);
};

Utility.GetPlayerMoney = (player) => {
	return player.stats.GetStatInt("SP0_TOTAL_CASH");
};

Utility.SetPlayerMoney = (player, money) => {
	return player.stats.SetStatInt("SP0_TOTAL_CASH", money);
};

Utility.GivePlayerMoney = (player, money) => {
	let fmoney = GetPlayerMoney(player) + (money);
	player.stats.SetStatInt(player, fmoney);
};

Utility.dbConnect = () => {
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
	printf(player.name + "has been banned");
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
	printf(player.name + "has been unbanned");
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
  for (let player of g_players) {
  	if(PlayerInfo[player.name].groupid == gid) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.factionMessage = (faction, message, opt_color) => {
  for (let player of g_players) {
  	if(PlayerInfo[player.name].faction == faction) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.adminMessage = (message, opt_color) => {
  for (let player of g_players) {
  	if(PlayerInfo[player.name].adminlvl >= 1) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.proximityMessage = (radi, sender, message, opt_color) => {
	for(let receptor of g_players) {
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
	
	for (let called of g_players) 
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
	
	for(let called of g_players) 
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

	return (Math.pow((position.x - this.x), 2) +
            Math.pow((position.y - this.y), 2) +
            Math.pow((position.z - this.z), 2) < Math.pow(this.radius, 2));
}

// ------------  Vehicle spawn -----------//

Utility.VehicleSpawn = function(model, x, y, z, rotation) { // Unused param rotation
	console.log(model);
	let fmodel;
	if(typeof model === "string") {
		fmodel = Utility.hashes.findByName(gm.utility.hashes.vehicles, model);
	} else {
		fmodel = Utility.hashes.vehicles[model];
	}

	//console.log(fmodel)
	const vehicle = new Vehicle(new Vector3f(x, y, z), fmodel.h);
  	vehicle.rotation.z = rotation;

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

// -------- Virtual inventory system  ---------- //

Utility.Item = class Item {

    constructor(item, quantity) {
	    this.item = item;
	    this.quantity = quantity;
    }

    static findByName(target, name) {
    	
	for (let obj of target) {
  		if (typeof obj.n === "undefined") { //|| typeof obj.h === "undefined") {
    	continue;
  	}
      if (obj.n === name) {
        return obj;
      }
	}
    return;
  }



};

Utility.Item.prototype.give = function(player) {

	let obj = Utility.Item.findByName(gm.items, this.item);

	let totalWeight = (obj.w * this.quantity) + PlayerInventory[player.name].weight;

	if(PlayerInventory[player.name].maxWeight < totalWeight) {
		return player.SendChatMessage("You don't have enought space");
	}

	if(Utility.isInArray(this.item, PlayerInventory[player.name].objects)) {

		let index = PlayerInventory[player.name].objects.indexOf(this.item);
		PlayerInventory[player.name].objectsQuantity[index] += this.quantity;

	} else {

		PlayerInventory[player.name].objects.push(this.item);
		PlayerInventory[player.name].objectsQuantity.push(this.quantity);

	}

	PlayerInventory[player.name].weight += obj.w * this.quantity;

}

Utility.Item.prototype.remove = function(player) {


	let index = PlayerInventory[player.name].objects.indexOf(this.item);
	//player.SendChatMessage("index: " + index);
	if(index < 0) index = 0; //player.SendChatMessage("index changed to 0");

	let result = PlayerInventory[player.name].objectsQuantity[index] - this.quantity;
	//player.SendChatMessage("result: " + result);

	//console.log(Object.keys(PlayerInventory[player.name].objects));


	if(result <= 0) {

		/* // If the lower value must be 1
			let howMuch = this.quantity + (PlayerInventory[player.name].objectsQuantity[index] - this.quantity);

			PlayerInventory[player.name].objectsQuantity -= howMuch;
		*/
		
		PlayerInventory[player.name].objects[index] 		= "NOITEM";
		PlayerInventory[player.name].objectsQuantity[index] = 0;

		// Reorder array: delete items with value 0

		let reorder = [];
		let reorderQuantity = [];
		
		let objectsLength = PlayerInventory[player.name].objects.length;

		for(let i = 0; i < objectsLength; i++) {
			if(PlayerInventory[player.name].objects[i] != "NOITEM") {
				reorder.push(PlayerInventory[player.name].objects[i]);
				reorderQuantity.push(PlayerInventory[player.name].objectsQuantity[i]);
			}
		}

		if(reorder.length == 0) { //&& isNaN(PlayerInventory[player.name].objectsQuantity)) {
			PlayerInventory[player.name].objects 		 = [];
			PlayerInventory[player.name].objectsQuantity = [];
		} else {
			PlayerInventory[player.name].objects 		 = [reorder];
			PlayerInventory[player.name].objectsQuantity = [reorderQuantity];		
		}


		//player.SendChatMessage("REORDER: " + reorder[0] +  " quantity: " + reorderQuantity[0] + " length: " + reorder.length);

	} else {
		PlayerInventory[player.name].objectsQuantity[index] = result;
	}

}

// --------- Shop creator ---------------- //

Utility.Shop = class Shop {

	constructor(position, items) {
		this.position 	= position;
		this.items 		= items;//items.split(",");
	}

	static buy(player, item, quantity) 
	{
		for(let i = 0; i < ShopInfo.length; i++) 
		{	
			let sphere = new Utility.sphere(ShopInfo[i].position.x, ShopInfo[i].position.y, ShopInfo[i].position.z, 2.0)

    		if(sphere.inRangeOfPoint(player.position)) 
    		{

    			//player.SendChatMessage("Shop items:");

    			if(isNaN(parseInt(item))) 
    			{

	    			for(let c = 0; c < ShopInfo[i].items.length; c++) {
	    				//player.SendChatMessage(" " + c + ": " + ShopInfo[i].items[c]);

	    				if(ShopInfo[i].items[c] == item) {

	    					let giveItem = new Utility.Item(item, quantity);
	    					// Here add the shit of the price
	    					giveItem.give(player);

	    					return true;
	    					break;
	    				}

	    			}

	    			return player.SendChatMessage("This item wasn't in this shop");

    			} else {

    				let itemVal = parseInt(item);

    				if(typeof ShopInfo[i].items[itemVal] === "undefined") {
    					return player.SendChatMessage("That number is not valid");
    				}

    				//let giveItem = new Item(ShopInfo[i].items[itemVal], quantity);
    				let itemString = ShopInfo[i].items[itemVal];
    				//player.SendChatMessage(itemString)
    				let giveItem = new Utility.Item(itemString, quantity);
    				// Here add the shit of the price
    				giveItem.give(player);
    				return true;
    			}
    			
    			break;
    		}
		}
		return false;
	}

}

Utility.Shop.prototype.create = function() {
	
	ShopInfo[g_shops] = {
		items: this.items,
		position: this.position
	};

	g_shops += 1;

}

Utility.LoadShops = () => {
	
	console.log("Loading shops...");
	let shop, position, items;

	// 1 - 
	items = ["apple", "orange", "kebab", "cocacola", "bannana", "rat", "lemon juice"];
	position = new Vector3f(3360.19, -4849.67, 111.8);
	shop = new Utility.Shop(position, items)
	shop.create();

	// 2 - 
	items = ["shears", "wives", "explosive charge", "flanges keys"];
	position = new Vector3f(-90.0, -2365.8, 14.3);
	shop = new Utility.Shop(position, items)
	shop.create();

	console.log("Loaded " + g_shops + " shop(s)");
}

// ----- Group system 0.1 ---------- //
// Contributions: myami

Utility.Group = class Group {

	constructor(gname) {
		this.name = gname;
	}

	static Update(indexGroup) {

		console.log("Uploading info of group in index: " + indexGroup);

		let connection = Utility.dbConnect();

		connection.connect();

		//let groupname = connection.escape(GroupInfo[gid].name); // Not Gname is this.name
		let members = connection.escape(GroupInfo[indexGroup].members.toString());
		let membersrank = connection.escape(GroupInfo[indexGroup].membersrank.toString());

		let SQLQuery = "UPDATE groups SET members = " + members + ", membersrank = " + membersrank +" WHERE id = " + GroupInfo[indexGroup].id;

		connection.query(SQLQuery, function(err) {
			if(err) {
			  console.log("[GROUP ERROR]: " + err);
			  console.log("[GROUP QUERY]: " + SQLQuery);
			} 
		});

		connection.end();
	}

	static addmember(player, gid) 
	{
		GroupInfo[gid].members.push(player.name);
		GroupInfo[gid].membersrank.push(1);
		PlayerInfo[player.name].groupid = GroupInfo[gid].id;
		Utility.Group.Update(gid);
		gm.events.onPlayerUpdate(player);

	 /*for(let i = 1; i <= g_groups; i++)
	  {
	    if(GroupInfo[i].id == gid)
	    {
	    	console.log("Adding the member");
			GroupInfo[i].members.push(player.name);
			GroupInfo[i].membersrank.push(1);
			PlayerInfo[player.name].groupid = GroupInfo[i].id;



			// HERE THE UPDATE FOR THE GROUP TO UPDATE THE INFO OF THE NEW MEMBER

			Utility.Group.Update(GroupInfo[i].id);
			
	      break;
	    }
	  }	*/
	}

	static removemember(player) {
		let indexGroup = Utility.Group.findById(PlayerInfo[player.name].groupid);
		console.log("Indexgroup:" + indexGroup);
		let index = GroupInfo[indexGroup].members.indexOf(player.name);
		//let membersLength = GroupInfo[indexGroup].members.length;

		GroupInfo[indexGroup].members[index] = "PLAYER_DELETED_HERE";
		console.log("Player deleted on index: " + index);


		let reorder = [];
		let reorderRanks = [];

		for(let i = 0; i <= GroupInfo[indexGroup].members.length; i++) 
		{
			if(GroupInfo[indexGroup].members[i] == "PLAYER_DELETED_HERE") 
			{
				/*reorder.push(GroupInfo[indexGroup].members[i]);
				reorderRanks.push(GroupInfo[indexGroup].membersrank[i]);*/
				//console.log("DELETING INDEX: " + i);
				GroupInfo[indexGroup].members.splice(i, 1);
				GroupInfo[indexGroup].membersrank.splice(i, 1);
				//i--;
			} /*else {
				console.log("player deleted");
			}*/
		}

		/*GroupInfo[indexGroup].members = [];
		GroupInfo[indexGroup].membersrank = [];

		if(reorder == null) {
			GroupInfo[indexGroup].members = [];
			GroupInfo[indexGroup].membersrank = [];
		} else {
			GroupInfo[indexGroup].members = reorder;
			GroupInfo[indexGroup].membersrank = reorderRanks;
		}*/


		console.log("MEMBERS length = " + GroupInfo[indexGroup].members.length);
		console.log("MEMBERS JSON STRING: " + JSON.stringify(GroupInfo[indexGroup].members));
		console.log("MEMBERS JSON STRING: " + JSON.stringify(GroupInfo[indexGroup].membersrank));

		if(GroupInfo[indexGroup].members.length == 0) {

			let connection = Utility.dbConnect();

			connection.connect();

			let SQLQuery = "DELETE FROM groups WHERE id = " + GroupInfo[indexGroup].id;

			connection.query(SQLQuery, function(err) {
				if(err) {
					console.log("[GROUP ERROR]: An error ocurred trying to delete group ID = " + GroupInfo[indexGroup].id);
					console.log("[QUERY]: " + SQLQuery);
					console.log("[GROUP ERROR]: " + err)
				} else {
					gm.utility.print(" [GROUP DELETED] ID: " + GroupInfo[indexGroup].id);
				}
			});

			connection.end();
		} else {

			if(GroupInfo[indexGroup].membersrank[0] < 7 ) {
				GroupInfo[indexGroup].membersrank[0] = 7;
			}
			gm.utility.Group.Update(indexGroup);
		}

		PlayerInfo[player.name].groupid = 0;
		gm.events.onPlayerUpdate(player);
		return true;
	}

	static findNameById(id)
	{
		for(let i = 1; i <= g_groups; i++) 
		{
			if(GroupInfo[i].id == id) {
				return GroupInfo[i].name;
				break;
			}
			//return false;
		}
		return false;
	}

	static findById(id) 
	{
		console.log("Groups: " + g_groups);
		for(let i = 1; i <= g_groups; i++) 
		{
			//console.log("CHECKING BY INDEX: " + i);
			//console.log("CHECKING GROUP ID: " + GroupInfo[i].id);
			if(GroupInfo[i].id == id) {
				//console.log("Returning: " + i);
				return i;
				break;
			}
			//return false;
		}
		return false;
	}

}


var xgroups = Utility.Group;

// Define a prototype to create de group

xgroups.prototype.create = function(player)
{

	 g_groups += 1; // Beacuse the default value for PlayerInfo[player.name].groupid its 0 and global.groups starts in 0

	 GroupInfo[g_groups] = {
	  id: 0,
	  name: this.name,
	  members: [player.name],
	  membersrank: [7]
	 };

	 //PlayerInfo[player.name].groupid = g_groups;

	// HERE WAS THE CONNECTION MYSQL to PUT INTO THE TABLE "GROUPS" THE INFO OF THE GROUP.
	// u dont need to use JSON u can just GroupInfo[groups].members.toString();

	let connection = Utility.dbConnect();

	connection.connect();

	let groupname = connection.escape(this.name); // Not Gname is this.name
	let members = connection.escape(GroupInfo[g_groups].members.toString());
	let membersrank = connection.escape(GroupInfo[g_groups].membersrank.toString());

	let SQLQuery = "INSERT INTO groups (name, members, membersrank) VALUES (" + groupname + "," + members + ", " + membersrank + ");";

	connection.query(SQLQuery, function(err) {
		if(err) {
		  player.SendChatMessage("[ERROR] Problem in the group creation");
		  console.log("[GROUP ERROR]: " + err);
		  console.log("[GROUP QUERY]: " + SQLQuery);
		} else {
			player.SendChatMessage("The group " + groupname + " has been created");
		}
	});

	SQLQuery = "SELECT * FROM `groups` ORDER BY `groups`.`id` DESC";

	connection.query(SQLQuery, function(err, result) {
		if(err) return console.log("ERROR: " + err)
		GroupInfo[g_groups].id = result[0].id;
		player.SendChatMessage("GROUP ID: " + GroupInfo[g_groups].id);
		PlayerInfo[player.name].groupid = result[0].id;
	});

	connection.end();

	gm.events.onPlayerUpdate(player);
}

// Define prototype to add new members

/*xgroups.prototype.addmember = function(player,gid)
{
 for(let i = 1; i < g_groups; i++)
  {
    if(GroupInfo[i].id == gid)
    {
		GroupInfo[i].members.push(player.name);
		GroupInfo[i].membersrank.push(1);
		PlayerInfo[player.name].groupid = i;



		// HERE THE UPDATE FOR THE GROUP TO UPDATE THE INFO OF THE NEW MEMBER

		Utility.Group.Update(GroupInfo[i].id);
      	break;
    }
  }
}*/

// Load groups for main.js

Utility.LoadGroups = (dbconnection) => {
  // well db connection u can call it if u check in main.js for the MySQL connection but if u not... Utility.dbConnection()
  let connection = dbconnection; // put here Utility.dbConnection(); if u not check the mysql connection in main function

  let SQLQuery = "SELECT * FROM groups";

  connection.query(SQLQuery, function(err, result) {
  console.log("Loading groups...");

  if(err) {
    gm.utility.print("An error ocurred trying to load a group");
    gm.utility.print("[QUERY]: " + SQLQuery);
    gm.utility.print("[ERROR]: " + err);
  }
  else
  {
		let num_rows = result.length;
		let cr = 0;

		// parsing the elements of the array
		// Split reference: http://www.w3schools.com/jsref/jsref_split.asp
		let parseMembers, parseMembersRank;

		while(num_rows > cr)
		{
		   console.log("ROW: " + cr + " index: " + cr+1 + " ID: " + result[cr].id + "NAME: " + result[cr].name);

		   parseMembers = result[cr].members.split(",");
		   parseMembersRank = result[cr].membersrank.split(",");

		  GroupInfo[cr+1] = {
		   id: result[cr].id,
		   name: result[cr].name,
		   members: parseMembers,
		   membersrank: parseMembersRank
		  };
		  cr++;
		}
		g_groups = cr;
		console.log("Loaded " + g_groups + " group(s)")
    }
  });
}