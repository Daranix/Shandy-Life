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

	let totalWeight = (obj.w * this.quantity) + player.inventory.weight;

	if(player.inventory.maxWeight < totalWeight) {
		return player.SendChatMessage("You don't have enought space");
	}

	if(gm.utility.isInArray(this.item, player.inventory.objects)) {

		let index = player.inventory.objects.indexOf(this.item);
		player.inventory.objectsQuantity[index] += this.quantity;

	} else {

		player.inventory.objects.push(this.item);
		player.inventory.objectsQuantity.push(this.quantity);

	}

	player.inventory.weight += obj.w * this.quantity;

}

Item.prototype.remove = function(player) {


	let index = player.inventory.objects.indexOf(this.item);
	//player.SendChatMessage("index: " + index);
	if(index < 0) index = 0; //player.SendChatMessage("index changed to 0");

	let result = player.inventory.objectsQuantity[index] - this.quantity;
	//player.SendChatMessage("result: " + result);

	//console.log(Object.keys(player.inventory.objects));


	if(result <= 0) {

		/* // If the lower value must be 1
			let howMuch = this.quantity + (player.inventory.objectsQuantity[index] - this.quantity);

			player.inventory.objectsQuantity -= howMuch;
		*/
		
		player.inventory.objects[index] 		= "NOITEM";
		player.inventory.objectsQuantity[index] = 0;

		// Reorder array: delete items with value 0

		let reorder = [];
		let reorderQuantity = [];
		
		let objectsLength = player.inventory.objects.length;

		for(let i = 0; i < objectsLength; i++) {
			if(player.inventory.objects[i] != "NOITEM") {
				reorder.push(player.inventory.objects[i]);
				reorderQuantity.push(player.inventory.objectsQuantity[i]);
			}
		}

		if(reorder.length == 0) { //&& isNaN(player.inventory.objectsQuantity)) {
			player.inventory.objects 		 = [];
			player.inventory.objectsQuantity = [];
			player.inventory.weight 		 = 0;
		} else {
			player.inventory.objects 		 = [reorder];
			player.inventory.objectsQuantity = [reorderQuantity];
			player.inventory.weight 		-= obj.w * this.quantity;		
		}


		//player.SendChatMessage("REORDER: " + reorder[0] +  " quantity: " + reorderQuantity[0] + " length: " + reorder.length);

	} else {
		player.inventory.objectsQuantity[index] = result;
	}

}

module.exports = Item;