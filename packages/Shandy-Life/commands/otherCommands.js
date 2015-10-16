"use strict";

module.exports = function(register) {

	register("stats", (player) => {

	  let stringJSON = JSON.stringify(player.info);

	  player.SendChatMessage(stringJSON);
	});

	register("licenses", (player) => {

	  let licens = player.info.licenses;
	  let i = 0;
	  player.SendChatMessage("Licenses: ");
	  for(let type in licens) {

	    if(licens.hasOwnProperty(type))
	        //console.info(type + ": " + licens[type]); // value
	        //console.info(prop); // key name
	        if(licens[type] == true) {
	          player.SendChatMessage(" " + LicenseName[i]);
	        }
	    i++;
	  }

	/*  let arrayLicenses = [];
	  //arrayLicenses.keys(jsonString);
	  console.log(Object.keys(player.info.licenses));
	  arrayLicenses = Object.keys(player.info.licenses);

	  let lcount = arrayLicenses.length;

	  console.log("Licenses count: " + lcount);*/

	});

	register("inventory", (player) => {

	  let itemCount = player.inventory.objects.length;

	  player.SendChatMessage("Player inventory: " + "( " + itemCount + " ) Weight: (" + player.inventory.weight + "/" + player.inventory.maxWeight + ")");
	  for(let i = 0; i < itemCount; i++) {
	    let itemWeight = gm.rpsys.Item.findByName(gm.items, player.inventory.objects[i]);
	    player.SendChatMessage(" + Item: " + player.inventory.objects[i] + " quantity: " + player.inventory.objectsQuantity[i] + " weight: " + (itemWeight.w * player.inventory.objectsQuantity[i]));
	  }

	  //console.log(Object.keys(player.info.objects))
	});

	register("disconnect", function(player) {
	  player.Kick("Normal quit");
	});

	
	// Vehicle lock

	register(["v"], function(player) {
		// let possibleVehs = [];
		for(let i = 0; i < gtamp.vehicles.length; i++) {
			let vehicle = gtamp.vehicles[i];
			let sphere = new gm.utility.sphere(vehicle.position.x, vehicle.position.y, vehicle.position.z, 30.0)
			if(sphere.inRangeOfPoint(player.position)) {
				if(VehInfo[vehicle.networkId].owner == player.info.id) {
					//player.SendChatMessage("Vehicle lock state = " + vehicle.doorLockState);
					if(vehicle.doorLockState) { 
						player.SendChatMessage("Your vehicle has been unlocked")
						vehicle.doorLockState = 0;

					} else {
						player.SendChatMessage("Your vehicle has been locked")
						vehicle.doorLockState = 1;
					}
					return true;
				}
			}
		}
		player.SendChatMessage("No was any of our cars here");
	});




};