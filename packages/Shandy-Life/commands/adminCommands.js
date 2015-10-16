"use strict";

module.exports = function(register) {

let ERR_NO_ACCESS = "You don't have access to that command!";
let red = new RGB(255,0,0);

  register("broadcast", function(player) {

    if(player.info.adminlvl < 1) {
      return player.SendChatMessage(ERR_NO_ACCESS);
    }

    gm.utility.broadcastMessage("[ADMIN] " + player.name + ": " + gm.utility.getAllArgs(arguments));

  });

  register("goto", function(player) {

    if(player.info.adminlvl < 1) {
      return player.SendChatMessage(ERR_NO_ACCESS);
    }

    if (arguments.length === 0) {
      return player.SendChatMessage("USAGE: /goto [id or name]", red);
    }

    let targets = gm.utility.getPlayer(arguments[1], true);

    if (targets.length === 0) {
      return player.SendChatMessage("Unknown Target.", red);
    }
    else if (targets.length > 1) {
      let msg = "found multiple targets: ";
      for (let p of targets) {
        msg += p.name + ", ";
      }
      msg = msg.slice(0, msg.length - 2);
      return player.SendChatMessage(msg, red);
    }

    player.position = targets[0].position;
    player.SendChatMessage("teleported to " + targets[0].name, new RGB(255, 255, 0));
    targets[0].SendChatMessage(player.name + " teleported to you.", new RGB(255, 255, 0));
  });

  register('giveMoney', function(player) {

    if(player.info.adminlvl <= 3) {
      return player.SendChatMessage(ERR_NO_ACCESS);
    }

    if (arguments.length < 2) {
      return player.SendChatMessage("USAGE: /giveMoney [id or name] ([money])");
    }

    let money = parseInt(arguments[2]);

    if(isNaN(money)) {
      return player.SendChatMessage("Money must be a number!");
    }

    let targets = gm.utility.getPlayer(arguments[1], true)

    if (targets.length === 0) {
      return player.SendChatMessage("Unknown Target.", new RGB(255, 0, 0));
    }
    else if (targets.length > 1) {
      let msg = "found multiple targets: ";
      for (let p of targets) {
        msg += p.name + ", ";
      }
      msg = msg.slice(0, msg.length - 2);
      return player.SendChatMessage(msg, new RGB(255, 0, 0));
    }


    gm.utility.GivePlayerMoney(targets[0], money);
    player.SendChatMessage("[ADMIN]" + money + "$ was given to " + targets[0].name, new RGB(255,0,0));
    targets[0].SendChatMessage("[ADMIN] u recieved " + money + "$ from " + player.name, new RGB(255,0,0));

  });

//

register("kick", function(player) {


  if(player.info.adminlvl < 1) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (arguments.length < 2) {
    return player.SendChatMessage("USAGE: /kick [id or name] [Reason]", red);
  }

  let targets = gm.utility.getPlayer(arguments[1], true);

  if (targets.length === 0) {
    return player.SendChatMessage("Unknown Target.", red);
  }
  else if (targets.length > 1) {
    let msg = "found multiple targets: ";
    for (let p of targets) {
      msg += p.name + ", ";
    }
    msg = msg.slice(0, msg.length - 2);
    return player.SendChatMessage(msg, red);
  }

  let reason = arguments[2];
  gm.utility.broadcastMessage("[ADMIN] " + targets[0].name + " was kicked from the server by " + player.name + " reason: " + reason);
  targets[0].Kick("[ADMIN] " + targets[0].name + "kicked by " + player.name + " reason: " + reason);

});

register("ban", function(player) {

  if (arguments.length < 3) {
    return player.SendChatMessage("USAGE: /ban [id or name] [Reason]", red);
  }

  if(player.info.adminlvl < 1) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  let targets = gm.utility.getPlayer(arguments[1], true);

  if (targets.length === 0) {
    return player.SendChatMessage("Unknown Target.", red);
  }
  else if (targets.length > 1) {
    let msg = "found multiple targets: ";
    for (let p of targets) {
      msg += p.name + ", ";
    }
    msg = msg.slice(0, msg.length - 2);
    return player.SendChatMessage(msg, red);
  }

  if(!targets[0].logged) {
    return player.SendChatMessage("Este usuario no esta logeado");
  }

  let reason = arguments[2];
  gm.utility.broadcastMessage("[ADMIN] " + targets[0].name + " was banned from the server by " + player.name + " reason: " + reason);
  gm.utility.ban(targets[0]);
  targets[0].Kick("[ADMIN] You were banned from the server by " + player.name + " reason: " + reason);

});

register("promoteadmin", function(player) {

  if(player.info.adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (arguments.length < 3) {
    return player.SendChatMessage("USAGE: /promoteadmin [id or name] [adminlvl]", red);
  }

  let adminlvl = parseInt(arguments[2]);

  if(isNaN(adminlvl)) {
    player.SendChatMessage("Admin Level must be a number")
  }

  let targets = gm.utility.getPlayer(arguments[1], false);

  if (targets.length === 0) {
    return player.SendChatMessage("Unknown Target.", red);
  }
  else if (targets.length > 1) {
    let msg = "found multiple targets: ";
    for (let p of targets) {
      msg += p.name + ", ";
    }
    msg = msg.slice(0, msg.length - 2);
    return player.SendChatMessage(msg, red);
  }

  if(!targets[0].logged) {
    return player.SendChatMessage("This user was not logged");
  }


  targets[0].info.adminlvl = adminlvl;

  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to admin level: " + adminlvl);
      targets[0].SendChatMessage("[ADMIN] You was promoted to admin level " + adminlvl + " by " + player.name);
    } else {
     player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name);
    }
  });

});

register("promotefaction", function(player) {

  if(player.info.adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (arguments.length < 3) {
    return player.SendChatMessage("USAGE: /promotefaction [id or name] [factionid]", red);
  }

  let factionid = parseInt(arguments[2]);

  if(isNaN(factionid)) {
    player.SendChatMessage("Faction ID must be a number")
  }

  let targets = gm.utility.getPlayer(arguments[1], true);

  if (targets.length === 0) {
    return player.SendChatMessage("Unknown Target.", red);
  }
  else if (targets.length > 1) {
    let msg = "found multiple targets: ";
    for (let p of targets) {
      msg += p.name + ", ";
    }
    msg = msg.slice(0, msg.length - 2);
    return player.SendChatMessage(msg, red);
  }

  if(!targets[0].logged) {
    return player.SendChatMessage("This user was not logged");
  }


  targets[0].info.faction = factionid;

  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to faction id: " + factionid);
      targets[0].SendChatMessage("[ADMIN] You was promoted to faction: " + FactionName[factionid] + " by " + player.name);
    } else {
      player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name);
    }
  });

});

register(["a", "admin"], function(player) {

  let message = "(( [ADMIN] " + player.name + ": " + gm.utility.getAllArgs(arguments) + " ))";

  gm.utility.adminMessage(message, new RGB(255,158,61));
});

register("giveLicense", function(player) {

  if(player.info.adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  let valLicenses = [];
  let nameLicenses = "";

  valLicenses = Object.keys(player.info.licenses);

  for(let i in valLicenses) {
    //console.log(valLicenses[i]);
    nameLicenses += valLicenses[i] + ", ";
  }

  if(arguments.length < 3) {
    return player.SendChatMessage("/giveLicense [ID or name] [license: (" + nameLicenses + ")]");
  }

  let giveLicens = arguments[2];

  if(giveLicens == null || giveLicens == "" || !gm.utility.isInArray(giveLicens, valLicenses)) {
    player.SendChatMessage("Parameters: " + arguments[1] + " " + arguments[2]);
    return player.SendChatMessage("/giveLicense [ID or name] [license: (" + nameLicenses + ")]");
  }

  let targets = gm.utility.getPlayer(arguments[1], true);

  if (targets.length === 0) {
    return player.SendChatMessage("Unknown Target.", red);
  }
  else if (targets.length > 1) {
    let msg = "found multiple targets: ";
    for (let p of targets) {
      msg += p.name + ", ";
    }
    msg = msg.slice(0, msg.length - 2);
    return player.SendChatMessage(msg, red);
  }

  if(!targets[0].logged) {
    return player.SendChatMessage("This user was not logged in");
  }

  // ---

  targets[0].info.licenses[giveLicens] = true;

  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You given " + giveLicens + " to : " + targets[0].name);
      targets[0].SendChatMessage("[ADMIN] You recieved license: " + giveLicens + " by " + player.name);
    } else {
      player.SendChatMessage("[ERROR] An error ocurred trying to upload " + targets[0].name + "info");
    }
  });

});

register("removeLicense", function(player) {

  if(player.info.adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  let giveLicens = arguments[2];

  let valLicenses = [];
  let nameLicenses = "";

  valLicenses = Object.keys(player.info.licenses);

  for(let i in valLicenses) {
    nameLicenses += valLicenses[i] + ", ";
  }


  if(giveLicens == null || giveLicens == "" || !gm.utility.isInArray(giveLicens, valLicenses)) {
    player.SendChatMessage("Parameters: " + arguments[1] + " " + arguments[2]);
    return player.SendChatMessage("/giveLicense [ID or name] [license: (" + nameLicenses + ")]");
  }

  let targets = gm.utility.getPlayer(arguments[1], true);

  if (targets.length === 0) {
    return player.SendChatMessage("Unknown Target.", red);
  }
  else if (targets.length > 1) {
    let msg = "found multiple targets: ";
    for (let p of targets) {
      msg += p.name + ", ";
    }
    msg = msg.slice(0, msg.length - 2);
    return player.SendChatMessage(msg, red);
  }

  if(!targets[0].logged) {
    return player.SendChatMessage("This user was not logged in");
  }

  // ---

  targets[0].info.licenses[giveLicens] = false;
  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You remove " + giveLicens + " to : " + targets[0].name);
      targets[0].SendChatMessage("[ADMIN] Your license: " + giveLicens + " was removed by " + player.name);
    } else {
      player.SendChatMessage("[ERROR] An error ocurred trying to upload " + targets[0].name + "info");
    }
  });
});

};