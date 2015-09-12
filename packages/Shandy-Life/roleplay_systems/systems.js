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

/*module.exports = class systems {

	let farm = require('./farm');
	let Shop = require('./shop');
	let Item = require('./item');



}*/

// ---------------- Load SHOPS -------------- //

systems.LoadShops = () => {

	console.log("Loading shops...");
	let shop, position, items;

	// 1 -
	items = ["apple", "orange", "kebab", "cocacola", "bannana", "rat", "lemon juice"];
	position = new Vector3f(3360.19, -4849.67, 111.8);
	shop = new gm.rpsys.Shop(position, items)
	shop.create();

	// 2 -
	items = ["shears", "wives", "explosive charge", "flanges keys"];
	position = new Vector3f(-90.0, -2365.8, 14.3);
	shop = new gm.rpsys.Shop(position, items)
	shop.create();

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

// ------------ Load Farm points ------------ //

systems.LoadFarms = () => {

  let items, position, farm;
  console.log("Loading farm points ... ");

	// Diamonds farm
	items = ["diamond"];
	position = new Vector3f(3360.19, -4849.67, 111.8);
	farm = new gm.rpsys.farm(position, items, 1)
	farm.create();

  console.log("Loaded " + g_farmpoints + " farm point(s)");
}
