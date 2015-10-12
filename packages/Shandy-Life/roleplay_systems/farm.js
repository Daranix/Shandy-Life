
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
 * @version: 1.0
*/

"use strict";

class farm {

	constructor(position, items, quantity, probabilities) {
		this.position 	   = position;
		this.items	  	   = items;
		this.quantity 	   = quantity;
		this.probabilities = probabilities;
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

		let farmIndex = farm.inFarmPoint(player);

		console.log("INDEX: " + farmIndex);

		if(farmIndex >= 0) {
			//console.log("INDEX: " + farmIndex);

			let indexItem;

			if(FarmPoint[farmIndex].items.length >= 1) {
				/*let random = gm.utility.RandomInt(0, FarmPoint[farmIndex].items.length);
				indexItem = random;*/
				indexItem = farm.chance(FarmPoint[farmIndex].probabilities)
			} else {
				indexItem = 0;
			}

			let item = new gm.rpsys.Item(FarmPoint[farmIndex].items[indexItem], FarmPoint[farmIndex].quantity[indexItem]);
			player.SendChatMessage("Farming ...");
			
			// Here was a animation.

			//player.SendChatMessage("MS: " + gm.utility.seconds(2));

			setTimeout(function() {
				player.SendChatMessage("You farm " + FarmPoint[farmIndex].quantity[indexItem] + " " + FarmPoint[farmIndex].items[indexItem]);
				item.give(player);
				// Here was the end of the animation
			}, gm.utility.seconds(2));
		} else if(farmIndex == -1) return player.SendChatMessage("No was nothing here to farm");
	} // End of pick

	static chance(chances)
	{
	    let ar = [];
	    let i,sum = 0;

	    for (i=0 ; i<chances.length-1; i++)
	    {
	      sum += (chances[i] / 100.0);
	      ar[i] = sum;
	    }

	    let r = Math.random(); // returns [0,1]

	    for (i=0 ; i<ar.length && r>=ar[i] ; i++) ;

	    return i;
	} // End of chance function
}

farm.prototype.create = function() {

	FarmPoint[g_farmpoints] = {
		position: this.position,
		items: this.items,
		quantity: this.quantity,
		probabilities: this.probabilities
	};

	g_farmpoints += 1;
}

module.exports = farm;