/*

  _|_|_|  _|                                  _|                _|        _|      _|_|
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|
                                                        _|
                                                    _|_|
 ********************************************************************************
 * @overview GTA:Multiplayer | Shandy Life | Roleplay: Systems definitions file *
 * @author: Daranix							    								                            *
 ********************************************************************************
 */

"use strict";

let systems = module.exports;

systems.farm = require('./farm');
systems.Shop = require('./shop');
systems.Item = require('./item');
systems.Group = require('./group');
systems.house = require('./house');

// ---------------- Load SHOPS -------------- //

systems.LoadShops = () => {

	let shopSpawns = [
		{ position: new Vector3f(3360.19, -4849.67, 111.8), items: ["apple", "orange", "kebab", "cocacola", "bannana", "rat", "lemon juice"] },
		{ position: new Vector3f(-90.0, -2365.8, 14.3), items: ["shears", "wives", "explosive charge", "flanges keys"] }
	];

	console.log("Loading shops...");

	let shop;
	for(let i = 0; i < shopSpawns.length; i++) 
	{
		let shopData = shopSpawns[i];
		shop = new gm.rpsys.Shop(shopData.position, shopData.items);
		shop.create();
	}

	console.log("Loaded " + g_shops + " shop(s)");
}

// ----------------- Load GROUPS ------------- //

systems.LoadGroups = (dbconnection) => {
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
		   //console.log("ROW: " + cr + " index: " + cr+1 + " ID: " + result[cr].id + "NAME: " + result[cr].name);

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

// ------------ Load Farm points ------------ //

systems.LoadFarms = () => {

	let FarmSpawn = [
		{ position: new Vector3f(3360.19, -4849.67, 111.8), items: ["coal", "diamond"], quantity: [2, 1], probability: [95, 5] }, // Coal farm with probability of pick a diamond n.n
	];

	console.log("Loading farm points ... ");
	
	let farm, farmData;
	for(let i = 0; i < FarmSpawn.length; i++)
	{
		farmData = FarmSpawn[i];
		farm = new gm.rpsys.farm(farmData.position, farmData.items, farmData.quantity, farmData.probability);
		farm.create();
	}

	console.log("Loaded " + g_farmpoints + " farm point(s)");
}

// ----------- Load Houses --------------- //

systems.LoadHouses = (dbconnection) => {

	console.log("Loading houses...")

	let connection = dbconnection;
	let house, data, position;
	
	let SQLQuery = "SELECT * FROM houses";

	connection.query(SQLQuery, function(err, result) {
		if(err) {
			gm.utility.print("[HOUSE ERROR] Error loading a house");
			gm.utility.print("[HOUSE ERROR] QUERY: " + SQLQuery);
			gm.utility.print("[HOUSE ERROR] ERR: " + err);
		} else {
			let num_rows = result.length;
			let rowIndex = 0;
			while(num_rows > rowIndex) {
				data = result[rowIndex];
				position = new Vector3f(data.x, data.y, data.z);
				house = new gm.rpsys.house(data.id, position, data.interior, data.price, data.owner)
				house.create();
				rowIndex++;
			}
			console.log("Loaded " + g_houses + " house(s)");
		}
	});
}
