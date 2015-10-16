"use strict";

module.exports = function(register) {


	register("me", function(player) { // HERE
	  let text = "* " + player.name + " " + gm.utility.getAllArgs(arguments) + " *";

	  gm.utility.proximityMessage(100.0, player, text, new RGB(255,255,255));
	});

	register("b", function(player) {

		let text = "(( " + player.name + ": " + gm.utility.getAllArgs(arguments) + " ))";

	  gm.utility.proximityMessage(100.0, player, text, new RGB(255,255,255));
	});

};