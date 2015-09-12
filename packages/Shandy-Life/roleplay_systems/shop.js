/**

	  _|_|_|  _|                                  _|                _|        _|      _|_|            
	_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
	  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
	      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
	_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
	                                                        _|                                        
	                                                    _|_| 
 **********************************************
 * @author Daranix							  *
 * @Description: Shandy-Life farming system.  *
 **********************************************

*/

"use strict";

//let system = module.exports;

//var ShopSys;

class Shop {

	constructor(position, items, type) {
		this.position 	= position;
		this.items 		= items;//items.split(",");
		this.type 		= type || 'normal';
	}

	static buy(player, item, quantity) 
	{
		for(let i = 0; i < ShopInfo.length; i++) 
		{	
			let sphere = new gm.utility.sphere(ShopInfo[i].position.x, ShopInfo[i].position.y, ShopInfo[i].position.z, 2.0)

    		if(sphere.inRangeOfPoint(player.position)) 
    		{

    			//player.SendChatMessage("Shop items:");

    			if(isNaN(parseInt(item))) 
    			{

	    			for(let c = 0; c < ShopInfo[i].items.length; c++) {
	    				//player.SendChatMessage(" " + c + ": " + ShopInfo[i].items[c]);

	    				if(ShopInfo[i].items[c] == item) {

	    					let giveItem = new gm.rpsys.Item(item, quantity);
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
    				let giveItem = new gm.rpsys.Item(itemString, quantity);
    				// Here add the shit of the price
    				giveItem.give(player);
    				return true;
    			}
    			
    			break;
    		}
		}
		return false;
	}

	static sell(player, item, quantity) 
	{
		for(let i = 0; i < ShopInfo.length; i++) 
		{	
			let sphere = new gm.utility.sphere(ShopInfo[i].position.x, ShopInfo[i].position.y, ShopInfo[i].position.z, 2.0)

    		if(sphere.inRangeOfPoint(player.position)) 
    		{

    			//player.SendChatMessage("Shop items:");

    			if(isNaN(parseInt(item))) 
    			{

	    			for(let c = 0; c < ShopInfo[i].items.length; c++) {
	    				//player.SendChatMessage(" " + c + ": " + ShopInfo[i].items[c]);

	    				if(ShopInfo[i].items[c] == item) {

	    					if(!gm.utility.isInArray(item, PlayerInventory[player.name].objects)) return player.SendChatMessage("You don't have that item!");

	    					let sell_item = new gm.rpsys.Item(item, quantity);
	    					// Here add the shit of the price
	    					sell_item.remove(player);

	    					return true;
	    					break;
	    				}

	    			}

	    			return player.SendChatMessage("You can't sell this item here.");

    			} else {

    				// Here must change if is a dealer.

    				let itemVal = parseInt(item);

    				if(typeof ShopInfo[i].items[itemVal] === "undefined") {
    					return player.SendChatMessage("That number is not valid");
    				}

    				//let giveItem = new Item(ShopInfo[i].items[itemVal], quantity);
    				let itemString = ShopInfo[i].items[itemVal];
    				if(!gm.utility.isInArray(itemString, PlayerInventory[player.name].objects)) return player.SendChatMessage("You don't have that item!");
    				//player.SendChatMessage(itemString)
    				let removeItem = new gm.rpsys.Item(itemString, quantity);
    				// Here add the shit of the price
    				removeItem.remove(player);
    				return true;
    			}
    			
    			break;
    		}
		}
		return false;
	}

}

Shop.prototype.create = function() {
	
	ShopInfo[g_shops] = {
		items: this.items,
		position: this.position,
		type: this.type
	};

	g_shops += 1;

}

/*module.exports.LoadShops = () => {
	
	console.log("Loading shops...");
	let shop, position, items;

	// 1 - 
	items = ["apple", "orange", "kebab", "cocacola", "bannana", "rat", "lemon juice"];
	position = new Vector3f(3360.19, -4849.67, 111.8);
	shop = new system.Shop(position, items)
	shop.create();

	// 2 - 
	items = ["shears", "wives", "explosive charge", "flanges keys"];
	position = new Vector3f(-90.0, -2365.8, 14.3);
	shop = new system.Shop(position, items)
	shop.create();

	console.log("Loaded " + g_shops + " shop(s)");
}*/

module.exports = Shop;