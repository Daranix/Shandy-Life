/*

  ,ad8888ba,   ,ad8888ba,   88b           d88 88b           d88        db        888b      88 88888888ba,    ad88888ba
 d8"'    `"8b d8"'    `"8b  888b         d888 888b         d888       d88b       8888b     88 88      `"8b  d8"     "8b
d8'          d8'        `8b 88`8b       d8'88 88`8b       d8'88      d8'`8b      88 `8b    88 88        `8b Y8,
88           88          88 88 `8b     d8' 88 88 `8b     d8' 88     d8'  `8b     88  `8b   88 88         88 `Y8aaaaa,
88           88          88 88  `8b   d8'  88 88  `8b   d8'  88    d8YaaaaY8b    88   `8b  88 88         88   `"""""8b,
Y8,          Y8,        ,8P 88   `8b d8'   88 88   `8b d8'   88   d8""""""""8b   88    `8b 88 88         8P         `8b
 Y8a.    .a8P Y8a.    .a8P  88    `888'    88 88    `888'    88  d8'        `8b  88     `8888 88      .a8P  Y8a     a8P
  `"Y8888Y"'   `"Y8888Y"'   88     `8'     88 88     `8'     88 d8'          `8b 88      `888 88888888Y"'    "Y88888P"



                  88888888888 ,ad8888ba,   88888888ba     888888888888 88888888888 ad88888ba 888888888888
                  88         d8"'    `"8b  88      "8b         88      88         d8"     "8b     88
                  88        d8'        `8b 88      ,8P         88      88         Y8,             88
                  88aaaaa   88          88 88aaaaaa8P'         88      88aaaaa    `Y8aaaaa,       88
                  88"""""   88          88 88""""88'           88      88"""""      `"""""8b,     88
                  88        Y8,        ,8P 88    `8b           88      88                 `8b     88
                  88         Y8a.    .a8P  88     `8b          88      88         Y8a     a8P     88
                  88          `"Y8888Y"'   88      `8b         88      88888888888 "Y88888P"      88

Shandy-Life test commands.

All of this commands are for debuging purposes.

*/

"use strict";

module.exports = function(register) {

	register("hash", function(player) {
	  //let text = args.join(" ");
	  //let text = gm.utility.getAllArgs(arguments);
	  let text = gm.utility.getAllArgs(arguments);
	  let hashtext = gm.md5(text);
	  player.SendChatMessage(hashtext);
	});

	register("update", function(player) {
	  gm.events.updateAllPlayers();
	  console.log("Updated info of all players");
	});

	register("jsontest", function(player) {

	  let jsonString = JSON.stringify(player.info.licenses);
	  //console.log(jsonString);
	  player.SendChatMessage(jsonString);

	});

	register("givePhone", function(player) {
	  let phonenumber = gm.utility.generatePhoneNumber();
	  //let phonenumber = 999999999;
	  player.info.phone = phonenumber;
	  player.SendChatMessage(player.info.phone.toString());
	});

	register("mypos2", function(player) {
	  let pposx = player.position.x;
	  let pposy = player.position.y;
	  let pposz = player.position.z;
	  let postotp = new Vector3f(3360.19, -4849.67, 111.8)
	  player.SendChatMessage("Position: " + player.position.x);
	  player.position = postotp;
	  player.SendChatMessage("Position: " + player.position.x);
	});

	register("getmypos", function(player) {
		player.SendChatMessage("Your pos is X: " + player.position.x + " Y: " + player.position.y + " Z: " + player.position.z);
	});

	register("checkpos", function(player) {

	  if(gm.utility.PlayerToPoint(1.0, player, 3360.19, -4849.67, 111.8)) {
	    player.SendChatMessage("YES");
	  } else {
	    player.SendChatMessage("NOPE");
	  }

	});

	register("checkpos2", function(player) {

	  var sphere = new gm.utility.sphere(3360.19, -4849.67, 111.8, 10.0);


	  if(sphere.inRangeOfPoint(player.position)) {
	    player.SendChatMessage("TRUE");
	  } else {
	    player.SendChatMessage("FALSE");
	  }

	});

	register("setpos", function(player, x, y ,z) {
	  let newpost = new Vector3f(parseFloat(x), parseFloat(y), parseFloat(z));

	  player.position = newpost;

	  player.SendChatMessage("Your position has been changed to X: " + x + " Y: " + y + " Z: " + z);
	});

	register("getdistance", function(player) {
	  let distance = gm.utility.GetPlayerDistanceToPoint(player, 3360.19, -4849.67, 111.8);
	  player.SendChatMessage("Distance to point is: " + distance);
	});

	register("myname", function(player) {
	  player.SendChatMessage("Your name is: " + player.name);
	});

	register("additem", function(player, item, string_quantity) {

	  if(arguments.length < 3) return player.SendChatMessage("Use: /additem [item] [quantity]");

	  //let item = args[0];
	  let quantity = parseInt(string_quantity);

	  if(isNaN(quantity)) return player.SendChatMessage("Quantity must be a number");

	  /*player.info.objects.push(item);
	  player.info.objectsQuantity.push(quantity);
	  */

	  let objitem = new gm.rpsys.Item(item, quantity);

	  objitem.give(player);

	  player.SendChatMessage("Added Item: " + item + " quantity: " + quantity);

	});

	register("removeitem", function(player, item, string_quantity) {

	  //let item = args[0];
	  //let quantity = parseInt(parseInt(args[1]));
	  let quantity = parseInt(string_quantity);

	  if(isNaN(quantity)) return player.SendChatMessage("Quantity must be a number");

	  let objitem = new gm.rpsys.Item(item, quantity);
	  objitem.remove(player);

	  player.SendChatMessage("Removed Item: " + item + " quantity: " + quantity);

	});

	register("checkchances", function(player) {
	  let chances = [99, 1];
	  let tryes = 0;
	  let index = 0;
	  

	  player.SendChatMessage("index: " + index);
	  while(FarmPoint[0].items[index] == "shit") {
	    index = gm.rpsys.farm.randexec(chances);
	    player.SendChatMessage("Item " + FarmPoint[0].items[index] + " quantity: " + FarmPoint[0].quantity[index])
	    tryes++;
	  }
	  player.SendChatMessage("Number of tries: " + tryes);
	  //return player.SendChatMessage("Item " + FarmPoint[0].items[index] + " quantity: " + FarmPoint[0].quantity[index])

	});

	register("clearInventory", function(player) {
	  player.info.items    = [];
	  player.info.quantity = [];
	});

	register("vehiclespawn", function(player, model) {
		/*if(isNaN(parseInt(model))) {
			gm.utility.VehicleSpawn(model, player.position.x, player.position.y, player.position.z, player.rotation.z);
		} else {
			gm.utility.VehicleSpawn(parseInt(model), player.position.x, player.position.y, player.position.z, player.rotation.z);
		}*/
		const vehicle = new Vehicle(0xB779A091, new Vector3f(player.position.x, player.position.y, player.position.z))
	});

	register("vehnear", function(player) {
		for(let i = 0; i < gtamp.vehicles.length; i++) {
			let veh = gtamp.vehicles[i];
			let sphere = new gm.utility.sphere(veh.position.x, veh.position.y, veh.position.z, 10.0)
			if(sphere.inRangeOfPoint(player.position)) {
				let jsonString = JSON.stringify(VehInfo[veh.networkId]);
				player.SendChatMessage("VehInfo: ");
				player.SendChatMessage(jsonString);
				return true;
			}
		}
		player.SendChatMessage("Was not vehicle near u");
	});

	register("vehpositions", function(player) {
		for(let i = 0; i < gtamp.vehicles.length; i++) {
			let veh = gtamp.vehicles[i];
			player.SendChatMessage("Veh NetID: " + veh.networkId + " X: " + veh.position.x + " Y: " + veh.position.y + " Z: " + veh.position.z);
		}
	});

	register("varsvalues", function(player) { 
		let jsonString = JSON.stringify(player);
		player.SendChatMessage(jsonString);
	});

};