
/**

	  _|_|_|  _|                                  _|                _|        _|      _|_|
	_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|
	  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|
	      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|
	_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|
	                                                        _|
	                                                    _|_|

 * @author Daranix
 * @Description: Shandy-Life farming system.
 * NEED TO BE FINISHED
*/

"use strict";

class farm {

	constructor(position, items, quantity) {
		this.position = position;
		this.items	  = items;
		this.quantity = quantity;
	}

	static inFarmPoint(player) {
		for(let i = 0; i < g_farmpoints; i++) {
			let sphere = new gm.utility.sphere(FarmPoint[i].position.x, FarmPoint[i].position.y, FarmPoint[i].position.z, 10.0);
			if(sphere.inRangeOfPoint(player.position)) {
				return i;
			}
		}
		return -1;
	}

	static pick(player) {
		/*for(let i = 0; i < g_farmpoints; i++) {
			let sphere = new gm.utility.sphere(FarmPoint[i].position.x, FarmPoint[i].position.y, FarmPoint[i].position.z, 10.0)
			if(sphere.inRangeOfPoint(player.position)) {

			}
		}*/

		let farmIndex = farm.inFarmPoint(player);

		console.log("INDEX: " + farmIndex);

		if(farmIndex >= 0) {
			//console.log("INDEX: " + farmIndex);
			let item = new gm.rpsys.Item(FarmPoint[farmIndex].items, FarmPoint[farmIndex].quantity);
			player.SendChatMessage("Farming ...");
			
			// Here was a animation.

			setTimeout(function() {
				player.SendChatMessage("You farm " + FarmPoint[farmIndex].quantity + " " + FarmPoint[farmIndex].items);
				item.give(player);
			}, gm.utility.seconds(2));
		} else if(farmIndex == false) return player.SendChatMessage("No was nothing here to farm");

	} // End of pick
}

farm.prototype.create = function() {

	FarmPoint[g_farmpoints] = {
		position: this.position,
		items: this.items,
		quantity: this.quantity
	};

	g_farmpoints += 1;
}

module.exports = farm;
