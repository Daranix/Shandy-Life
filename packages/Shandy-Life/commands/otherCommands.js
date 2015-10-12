"use strict";

module.exports = function(register) {

	register("stats", (player) => {

	  let stringJSON = JSON.stringify(PlayerInfo[player.name]);

	  player.SendChatMessage(stringJSON);
	});

	register("licenses", (player) => {

	  let licens = PlayerInfo[player.name].licenses;
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
	  console.log(Object.keys(PlayerInfo[player.name].licenses));
	  arrayLicenses = Object.keys(PlayerInfo[player.name].licenses);

	  let lcount = arrayLicenses.length;

	  console.log("Licenses count: " + lcount);*/

	});

	register("inventory", (player) => {

	  let itemCount = PlayerInventory[player.name].objects.length;

	  player.SendChatMessage("Player inventory: " + "( " + itemCount + " ) Weight: (" + PlayerInventory[player.name].weight + "/" + PlayerInventory[player.name].maxWeight + ")");
	  for(let i = 0; i < itemCount; i++) {
	    let itemWeight = gm.rpsys.Item.findByName(gm.items, PlayerInventory[player.name].objects[i]);
	    player.SendChatMessage(" Item: " + PlayerInventory[player.name].objects[i] + " quantity: " + PlayerInventory[player.name].objectsQuantity[i] + " weight: " + (itemWeight.w * PlayerInventory[player.name].objectsQuantity[i]));
	  }

	  //console.log(Object.keys(PlayerInventory[player.name].objects))
	});

	register("disconnect", (player) => {
	  player.Kick("Normal quit");
	});

	
};