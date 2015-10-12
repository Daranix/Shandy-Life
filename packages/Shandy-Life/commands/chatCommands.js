"use strict";

module.exports = function(register) {


	register("me", function(player) {
	  let text = player.name + ": " + gm.utility.getAllArgs(arguments);

	  gm.utility.proximityMessage = (radi, player, text, opt_color);
	});

};