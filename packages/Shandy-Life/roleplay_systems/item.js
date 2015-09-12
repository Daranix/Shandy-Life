/**

	  _|_|_|  _|                                  _|                _|        _|      _|_|            
	_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
	  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
	      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
	_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
	                                                        _|                                        
	                                                    _|_| 
 ********************************************
 * @author Daranix							*
 * @Description: Shandy-Life items system.  *
 ********************************************

*/

"use strict";

class Item {

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



Item.prototype.give = function(player) {

	let obj = Item.findByName(gm.items, this.item);

	let totalWeight = (obj.w * this.quantity) + PlayerInventory[player.name].weight;

	if(PlayerInventory[player.name].maxWeight < totalWeight) {
		return player.SendChatMessage("You don't have enought space");
	}

	if(gm.utility.isInArray(this.item, PlayerInventory[player.name].objects)) {

		let index = PlayerInventory[player.name].objects.indexOf(this.item);
		PlayerInventory[player.name].objectsQuantity[index] += this.quantity;

	} else {

		PlayerInventory[player.name].objects.push(this.item);
		PlayerInventory[player.name].objectsQuantity.push(this.quantity);

	}

	PlayerInventory[player.name].weight += obj.w * this.quantity;

}

Item.prototype.remove = function(player) {


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
			PlayerInventory[player.name].weight 		 = 0;
		} else {
			PlayerInventory[player.name].objects 		 = [reorder];
			PlayerInventory[player.name].objectsQuantity = [reorderQuantity];
			PlayerInventory[player.name].weight 		-= obj.w * this.quantity;		
		}


		//player.SendChatMessage("REORDER: " + reorder[0] +  " quantity: " + reorderQuantity[0] + " length: " + reorder.length);

	} else {
		PlayerInventory[player.name].objectsQuantity[index] = result;
	}

}

module.exports = Item;