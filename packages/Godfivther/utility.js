/**
 * @overview GTA:Multiplayer Godfivther - Roleplay: Utility file
 * @author "Daranix" & Jan "Waffle" C.
 * @copyright (c) GTA:Multiplayer [gta-mp.net]
 * @license https://master.gta-mp.net/LICENSE
 */
"use strict";

let Utility = module.exports;
Utility.hashes = require('./hashes/hashes');

/**
 * Broadcasts a Message to all Players.
 *
 * @param {string} message the message to broadcast.
 * @param {RGB=} [opt_color] color of the message
 */
Utility.broadcastMessage = (faction, message, opt_color) => {
  for (let player of g_players) {
    player.SendChatMessage(message, opt_color);
  }
};

/**
 * Returns the player from his id or (part of his) Name
 *
 * @param  {string/number} idOrName Networkid or name of the player (or some digits of the name)
 * @param  {boolean=} [allowDuplicates=false] False: If multiple players have the same Name only the first one found is returned.
 *                                            True: Returns an array with all duplicate players with the name
 * @param  {boolean=} [caseSensitive=false] True if case sensitive, false if not
 * @return {Player} An array with the players found with the id or the name,
 *                  only contains the first one found if allowDuplicates was false, empty array if no player was found
 */
 
Utility.getPlayer = (idOrName, opt_allowDuplicates, opt_caseSensitive) => {
  let allowDuplicates = opt_allowDuplicates || false;
  let caseSensitive = opt_caseSensitive || false;
	let id = parseInt(idOrName);
	let fnCheck;

	if (isNaN(id)) {
		if(caseSensitive === false) {
			idOrName = idOrName.toLowerCase();
		}

		// define fnCheck to check the players name
		fnCheck = target => {
			let targetName;
			if(caseSensitive === false) {
				//ignore capital letters
				targetName = target.name.toLowerCase();
			}
      else {
				// do not ignore capital letters
				targetName = target.name;
			}
			if (targetName.indexOf(idOrName) === 0) {
				return true;
			}
			return false;
		};
	}
  else {
		fnCheck = target => target.client.networkId === id;
	}

	let playerArray = [];
	for (let tempPlayer of g_players) {
		if (fnCheck(tempPlayer)) {
			playerArray.push(tempPlayer);
			if(allowDuplicates === false) {
				// exit the loop, because we just return the first player found
				break;
			}
		}
	}
	return playerArray;
};

//CUSTOM RP FUNCTIONS

Utility.PlayerToPoint = (radi, player, x, y, z) => {
	let oldposx = player.position.x;
	let oldposy = player.position.y;
	let oldposz = player.position.z;
	//let tempposx, tempposy, tempposz;
	let tempposx = (oldposx - x);
	let tempposy = (oldposy - y);
	let tempposz = (oldposz - z);
	if (((tempposx < radi) && (tempposx > -radi)) && ((tempposy < radi) && (tempposy > -radi)) && ((tempposz < radi) && (tempposz > -radi)))
   	{
    	return 1;
   	}
	return 0;
};

Utility.GetPlayerMoney = (player) => {
	return player.stats.GetStatInt("SP0_TOTAL_CASH");
};

Utility.SetPlayerMoney = (player, money) => {
	return player.stats.SetStatInt("SP0_TOTAL_CASH", money);
};

Utility.GivePlayerMoney = (player, money) => {
	let fmoney = GetPlayerMoney(player) + (money);
	player.stats.SetStatInt(player, fmoney);
};

Utility.dbConnect = () => {
	return gm.mysql.createConnection({
        host     : gm.config.mysql.host,
        user     : gm.config.mysql.user,
        password : gm.config.mysql.password,
        database : gm.config.mysql.database
    });
};

Utility.ban = (player) => {
	
	let connection = Utility.dbConnect(); /*gm.mysql.createConnection({
        host     : gm.config.mysql.host,
        user     : gm.config.mysql.user,
        password : gm.config.mysql.password,
        database : gm.config.mysql.database
    });*/

	connection.connect();

	let SQLQuery = "UPDATE users SET banned = 1 WHERE id = " + PlayerInfo[player.name].id;
	printf(player.name + "has been banned");
	connection.query(SQLQuery);

	connection.end();

};

Utility.unban = (player) => {
	
	let connection = Utility.dbConnect(); /*gm.mysql.createConnection({
        host     : gm.config.mysql.host,
        user     : gm.config.mysql.user,
        password : gm.config.mysql.password,
        database : gm.config.mysql.database
    });*/

	connection.connect();

	let SQLQuery = "UPDATE users SET banned = 0 WHERE id = " + PlayerInfo[player.name].id;
	printf(player.name + "has been unbanned");
	connection.query(SQLQuery);

	connection.end();

};

/**
 * Broadcasts a Message to all Players in faction ID.
 * @param {int} id of faction players to send the message
 * @param {string} message the message to broadcast.
 * @param {RGB=} [opt_color] color of the message
 */

Utility.factionMessage = (faction, message, opt_color) => {
  for (let player of g_players) {
  	if(PlayerInfo[player.name].faction == faction) {
    	player.SendChatMessage(message, opt_color);
	}
  }
};

Utility.proximityMessage = (radi, sender, message, opt_color) => {
	for(let receptor of g_players) {
		if(Utility.PlayerToPoint(radi, receptor, sender.position.x, sender.position.y, sender.position.z)) {
			receptor.SendChatMessage(message, opt_color);
		}
	}
};

Utility.seconds = (seconds) => {
	return seconds * 1000;
};

Utility.minutes = (minutes) => {
	return Utility.seconds(60) * minutes;
};

Utility.timestamp = () => {
	let d = new Date();
	let year = d.getFullYear();
	let month = d.getMonth();
	let day = d.getDate();
	let hour = d.getHours();
	let min = d.getMinutes();
	let secs = d.getSeconds();
	let time = "(" + day + "-" + month + "-" + year + " || " + hour + ":" + min + ":" + secs + ")";
	return time;
};

Utility.isInArray = (value, array) => {
  //return array.indexOf(value) > -1;

  let result = array.indexOf(value);

  if(result >= 0) return true;
  else return false;

};