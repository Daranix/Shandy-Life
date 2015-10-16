/**

	  _|_|_|  _|                                  _|                _|        _|      _|_|
	_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|
	  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|
	      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|
	_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|
	                                                        _|
	                                                    _|_|

 * @author Daranix
 * @Description: Shandy-Life house system.
 * WORK ON PROGRESS
*/
"use strict";


class house {

	constructor(id, position, interior, price, owner) {
		this.id 	  = id;
		this.position = position;
		this.interior = interior;
		this.owner 	  = owner;
		this.price	  = price;
	}

	static enter(player, msg)
	{
		msg = false || msg;
		let index = house.inHouseEntrace(player);

		if(index >= 0) {
			if(HouseInfo[index].owner == player.info.id || HouseInfo[index].locked == 0) {
				player.position = gm.utility.interiors[HouseInfo[index].interior].position;
			} else return player.SendChatMessage("This door is locked");
		} else if(index < 0 && !msg) return player.SendChatMessage("You aren't in a house entrance");
	}

	static inHouseEntrace(player)
	{
		for(let i = 0; i < g_houses; i++) {
			let sphere = new gm.utility.sphere(HouseInfo[i].position.x, HouseInfo[i].position.y, HouseInfo[i].position.z, 1.5);
			if(sphere.inRangeOfPoint(player.position)) {
				return i;
			}
		}
		return -1;
	}

	static sell(player) {
		let index = house.inHouseEntrace(player);

		if(index >= 0) {
			if(HouseInfo[index].owner == player.info.id) {
				HouseInfo[index].owner = 0;
				let sellprice = HouseInfo[index].price / 2;
				//gm.utility.GivePlayerMoney(player, sellprice);
				gm.rpsys.house.Update(index);
				player.SendChatMessage("You sell this house for " + sellprice + "$");
			} else return player.SendChatMessage("This is not your house");
		} else return player.SendChatMessage("No was any house here to sell")
	}

	static buy(player)
	{
		let index = house.inHouseEntrace(player);

		if(index >= 0) {
			/*if(!gm.utility.GotMoney(player, HouseInfo[index].price), function(needed) {
				player.SendChatMessage("You need " + needed + "$");
			}) return false;
			gm.utility.GivePlayerMoney( - HouseInfo[index].price);*/
			if(HouseInfo[index].owner == 0) {
				HouseInfo[index].owner = player.info.id;
				house.Update(index);
				player.SendChatMessage("You buy this house for " + HouseInfo[index].price + "$");
			} else return player.SendChatMessage("This house has already a owner");
		} else return player.SendChatMessage("No was a house here");
	}

	static Update(index) {
		let connection = gm.utility.dbConnect();

		let SQLQuery = "UPDATE houses SET owner = " + HouseInfo[index].owner + " WHERE id = " + HouseInfo[index].id;

		connection.query(SQLQuery, function(err) {
			if(err) {
				gm.utility.print("[HOUSES ERROR] An error ocurred trying to update house info id: " + houseid);
				gm.utility.print("[HOUSES ERROR] QUERY: " + SQLQuery);
				gm.utility.print("[HOUSES ERROR] ERROR: " + err);
			}
		});

		connection.end();
	}
}

house.prototype.create = function() {

	HouseInfo[g_houses] = {
		id: this.id,
		position: this.position,
		price: this.price,
		interior: this.interior,
		owner: this.owner,
		locked: 1
	};

	console.log("House created ID:" + this.id);
	g_houses++;
}

module.exports = house;