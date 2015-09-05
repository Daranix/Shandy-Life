/*
 
  _|_|_|  _|                                  _|                _|        _|      _|_|            
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
                                                        _|                                        
                                                    _|_| 
 *****************************************************************
 * @overview GTA:Multiplayer Shandy Life - Roleplay: commands    *
 * @author "Daranix" & Jan "Waffle" C.                           *
 *****************************************************************
 */

"use strict";

let commands = module.exports = new Map();
let DEBUG_STATUS = true;
let red = new RGB(255, 59, 59);

// Messages

let ERR_NO_ACCESS = "You don't have access to that command";

commands.set("help", (player) => {
  player.SendChatMessage("List of commands: ");
  let i = 1;
  commands.forEach((_, key) => {
    player.SendChatMessage(" /" + key);
  });
});

commands.set("broadcast", (player, args) => {

  if(PlayerInfo[player.name].adminlvl < 1) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  gm.utility.broadcastMessage("[ADMIN] " + player.name + ": " + args.join(" "));

});

commands.set("goto", (player, args) => {

  if(PlayerInfo[player.name].adminlvl < 1) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (args.length === 0) {
  	return player.SendChatMessage("USAGE: /goto [id or name]", red);
  }

  let targets = gm.utility.getPlayer(args[0], true);

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

commands.set("weather", (player, args) => {

  if(PlayerInfo[player.name].adminlvl < 2) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (args.length < 1 || isNaN(args[0])) {
    return player.SendChatMessage("USAGE: /weather [id]", new RGB(255, 255, 0));
  }
  let v = parseInt(args[0]);
  if (v < 1 || v > 12) {
    v = 1;
  }
  gm.config.weather = v;
  gm.utility.broadcastMessage(player.name + " changed the weather to " + v);
  for (let p of g_players) {
    p.world.weatherPersistNow = v;
  }
});

commands.set('giveMoney', (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl <= 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (args.length < 1) {
    return player.SendChatMessage("USAGE: /giveMoney [id or name] ([money])");
  }

  let money = parseInt(args[1]);

  if(isNaN(money)) {
    return player.SendChatMessage("Money must be a number!");
  }

  let targets = gm.utility.getPlayer(args[0], true)

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

/*commands.set("money", (player, args) => {
  //let whatmoney = gm.utility.GetPlayerMoney(player);
  let whatmoney = player.stats.GetStatInt("SP0_TOTAL_CASH");
  player.SendChatMessage("Tienes :" + whatmoney + "$");
});*/

commands.set("register", (player, args) => {
  let password = args.join(" ");

  if(pLogged[player.name]) {
    return player.SendChatMessage("You was already registered");
  }

  let connection = gm.utility.dbConnect();
  
  connection.connect();

  connection.query("SELECT name FROM users WHERE name = " + connection.escape(player.name), function(err, results) {
    
    let numRows = results.length;

    if(numRows >= 1) {
      connection.end();
      return player.SendChatMessage("You was already registered sign in with: /login [Password]");
    }
  });
  
  if(ConfirmReg[player.name]) 
  {
    if(ConfirmPwd[player.name] == password) 
    {
      let salt = gm.config.mysql.salt;
      password = password + salt;

      let pwdhash = connection.escape(gm.md5(password));

      /*var sha1 = require('./node_modules/sha1');

      let pwdhash = connection.escape(sha1(password));*/

      console.log(pwdhash);
      let playername = connection.escape(player.name);
      console.log("Hash created: " + pwdhash);
      let SQLQuery = "INSERT INTO users (name, password) VALUES (" + playername + "," + pwdhash + ");";
      connection.query(SQLQuery, function(err) {
        
        if(!err) {
            console.log("user "+ player.name + " registered sucesfull \n\n");
            player.SendChatMessage("You was been registered sucesfull");
            connection.query("SELECT id FROM users WHERE name = " + playername, function(err2, results)
              {

                PlayerInfo[player.name].id = results[0].id;
                /*PlayerInfo[player.name] = {
                  id: results[0].id,
                  adminlvl: 0,
                  faction: 0,
                  factionrank: 0,
                  licenses: {
                    car: false,
                    boat: false,
                    truck: false,
                    pilot_helicopter: false,
                    pilot_plane: false
                  },
                };*/

                gm.events.onPlayerUpdate(player, function() {});
                pLogged[player.name]  = true;

              });
            connection.end();
        } else {
            console.log("Ha ocurrido un error al registrar al jugador \n\n");
            console.log("Error: " + err)
            player.SendChatMessage("Error when trying to register you, try again");
        }

      });


    } else {
      player.SendChatMessage("Password doesn't match, please try again");
      ConfirmPwd[player.name] = "";
      ConfirmReg[player.name] = false;
    }
    
  } else {  
    ConfirmPwd[player.name] = password;
    ConfirmReg[player.name] = true;
    player.SendChatMessage("To confirm the password write again /register [password]");
  }

});

commands.set("login", (player, args) => {
  
  if(!Registered[player.name]) {
    return player.SendChatMessage("You wasn't not registered, please first /register [password]");
  } else {
    
    let password = args.join(" ");

    let connection = gm.utility.dbConnect();
    connection.connect();
    password = password + gm.config.mysql.salt;
    let pwdhash = connection.escape(gm.md5(password));
    /*var sha1 = require('./node_modules/sha1');
    let pwdhash = connection.escape(sha1(password));*/
    let playername = connection.escape(player.name);
    console.log(playername);
    let SQLQuery = "SELECT * FROM users WHERE name = " + playername + " AND password = " + pwdhash;
    console.log(SQLQuery);

    connection.query(SQLQuery, function(err, results) {
      
      let num_rows = results.length;

      if(num_rows >= 1) {
        
        if(results[0].banned) {
          player.Kick("You was banned from the server");
        }

        gm.events.onPlayerLogin(player, results[0]);

        player.SendChatMessage("Loggin sucesfully");

      } else {
        player.SendChatMessage("Incorrect password, please try again.")
      }

    });

    connection.end();

  }
});

commands.set("hash", (player, args) => {
  let text = args.join(" ");
  let hashtext = gm.md5(text);
  player.SendChatMessage(hashtext);
});

commands.set("stats", (player) => {

  let stringJSON = JSON.stringify(PlayerInfo[player.name]);

  player.SendChatMessage(stringJSON);
});

commands.set("kick", (player, args) => {
  

  if(PlayerInfo[player.name].adminlvl < 1) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (args.length === 0) {
    return player.SendChatMessage("USAGE: /kick [id or name] [Reason]", red);
  }

  let targets = gm.utility.getPlayer(args[0], true);

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

  let reason = args[1];
  gm.utility.broadcastMessage("[ADMIN] " + targets[0].name + " was kicked from the server by " + player.name + " reason: " + reason);
  targets[0].Kick("[ADMIN] " + targets[0].name + "kicked by " + player.name + " reason: " + reason);

});

commands.set("ban", (player, args) => {
  
  if (args.length === 0) {
    return player.SendChatMessage("USAGE: /ban [id or name] [Reason]", red);
  }

  if(PlayerInfo[player.name].adminlvl < 1) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  let targets = gm.utility.getPlayer(args[0], true);

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

  if(!pLogged[targets[0].name]) {
    return player.SendChatMessage("Este usuario no esta logeado");
  }

  let reason = args[1];
  gm.utility.broadcastMessage("[ADMIN] " + targets[0].name + " was banned from the server by " + player.name + " reason: " + reason);
  gm.utility.ban(targets[0]);
  targets[0].Kick("[ADMIN] You were banned from the server by " + player.name + " reason: " + reason);

});

commands.set("promoteadmin", (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (args.length === 0) {
    return player.SendChatMessage("USAGE: /promoteadmin [id or name] [adminlvl]", red);
  }

  let adminlvl = parseInt(args[1]);

  if(isNaN(adminlvl)) {
    player.SendChatMessage("Admin Level must be a number")
  }

  let targets = gm.utility.getPlayer(args[0], false);

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

  if(!pLogged[targets[0].name]) {
    return player.SendChatMessage("This user was not logged");
  }


  PlayerInfo[targets[0].name].adminlvl = adminlvl;

  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to admin level: " + adminlvl);
      targets[0].SendChatMessage("[ADMIN] You was promoted to admin level " + adminlvl + " by " + player.name);
    } else {
     player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name); 
    }
  });

});

commands.set("promotefaction", (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  if (args.length === 0) {
    return player.SendChatMessage("USAGE: /promotefaction [id or name] [factionid]", red);
  }

  let factionid = parseInt(args[1]);

  if(isNaN(factionid)) {
    player.SendChatMessage("Faction ID must be a number")
  }

  let targets = gm.utility.getPlayer(args[0], true);

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

  if(!pLogged[targets[0].name]) {
    return player.SendChatMessage("This user was not logged");
  }


  PlayerInfo[targets[0].name].faction = factionid;

  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to faction id: " + factionid);
      targets[0].SendChatMessage("[ADMIN] You was promoted to faction: " + FactionName[factionid] + " by " + player.name);
    } else {
      player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name);
    }
  });

});

commands.set("f", (player,args) => {
  let message = "(( " + player.name + ": " + args.join(" ") + " ))";
  if(PlayerInfo[player.name].faction >= 1) {
    gm.utility.factionMessage(PlayerInfo[player.name].faction, message, new RGB(255,255,0));
  } else {
    return player.SendChatMessage("You don't have a faction");
  }
});

commands.set("a", (player,args) => {
  let message = "(( [ADMIN] " + player.name + ": " + args.join(" ") + " ))";

  gm.utility.adminMessage(message, new RGB(255,158,61));
});

commands.set("update", (player) => {
  gm.events.updateAllPlayers();
  console.log("Updated info of all players");
});

commands.set("licenses", (player) => {

  let licens = PlayerInfo[player.name].licenses;
  let i = 0;
  player.SendChatMessage("Licenses: ");
  for(let type in licens) {

    if(licens.hasOwnProperty(type))
        //console.info(type + ": " + licens[type]); // value
        //console.info(prop); // key name
        if(licens[type] == true) {
          player.SendChatMessage(" " + LicenseName[i]);
        }
    i++;
  }

/*  let arrayLicenses = [];
  //arrayLicenses.keys(jsonString);
  console.log(Object.keys(PlayerInfo[player.name].licenses));
  arrayLicenses = Object.keys(PlayerInfo[player.name].licenses);

  let lcount = arrayLicenses.length;

  console.log("Licenses count: " + lcount);*/

});

commands.set("giveLicense", (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  let giveLicens = args[1];

  let valLicenses = [];
  let nameLicenses = "";

  valLicenses = Object.keys(PlayerInfo[player.name].licenses);

  for(let i in valLicenses) {
    //console.log(valLicenses[i]);
    nameLicenses += valLicenses[i] + ", ";
  }


  if(giveLicens == null || giveLicens == "" || !gm.utility.isInArray(giveLicens, valLicenses)) {
    player.SendChatMessage("Parameters: " + args[0] + " " + args[1]);
    return player.SendChatMessage("/giveLicense [ID or name] [license: (" + nameLicenses + ")]");
  }

  let targets = gm.utility.getPlayer(args[0], true);

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

  if(!pLogged[targets[0].name]) {
    return player.SendChatMessage("This user was not logged in");
  }

  // ---

  PlayerInfo[targets[0].name].licenses[giveLicens] = true;

  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You given " + giveLicens + " to : " + targets[0].name);
      targets[0].SendChatMessage("[ADMIN] You recieved license: " + giveLicens + " by " + player.name);
    } else {
      player.SendChatMessage("[ERROR] An error ocurred trying to upload " + targets[0].name + "info");
    }
  });


  



});

commands.set("removeLicense", (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl < 3) {
    return player.SendChatMessage(ERR_NO_ACCESS);
  }

  let giveLicens = args[1];

  let valLicenses = [];
  let nameLicenses = "";

  valLicenses = Object.keys(PlayerInfo[player.name].licenses);

  for(let i in valLicenses) {
    nameLicenses += valLicenses[i] + ", ";
  }


  if(giveLicens == null || giveLicens == "" || !gm.utility.isInArray(giveLicens, valLicenses)) {
    player.SendChatMessage("Parameters: " + args[0] + " " + args[1]);
    return player.SendChatMessage("/giveLicense [ID or name] [license: (" + nameLicenses + ")]");
  }

  let targets = gm.utility.getPlayer(args[0], true);

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

  if(!pLogged[targets[0].name]) {
    return player.SendChatMessage("This user was not logged in");
  }

  // ---

  PlayerInfo[targets[0].name].licenses[giveLicens] = false;
  gm.events.onPlayerUpdate(targets[0], function(result) {
    if(result) {
      player.SendChatMessage("[ADMIN] You remove " + giveLicens + " to : " + targets[0].name);
      targets[0].SendChatMessage("[ADMIN] Your license: " + giveLicens + " was removed by " + player.name);
    } else {
      player.SendChatMessage("[ERROR] An error ocurred trying to upload " + targets[0].name + "info");
    }
  });

  

});

/*commands.set("try", (player, args) => {

});

commands.set("me", (player, args) => {

});

commands.set("report", (player, args) => {

});

commands.set("w", (player, args) => {

});*/

commands.set("me", (player, args) => {
  let text = player.name + ": " + args.join(" ");

  gm.utility.proximityMessage = (radi, player, text, opt_color);
});

commands.set("call", (player, args) => {
  
  if(PlayerInfo[player.name].phone == 0) {
    return player.SendChatMessage("You don't have a phone!");
  }

  if(pInCall[player.name]) {

    if(pInCallNumber[player.name] != 911) 
    {
        for(let called of g_players) 
        {
          if(pInCall[called.name] == true && pInCallNumber[called.name] == PlayerInfo[player.name].phone)
          {
            pInCall[called.name] = false;
            pInCallNumber[called.name] = 0;
            called.SendChatMessage("The call has been hung");
            break;
          }
        }
    }
    pInCall[player.name] = false;
    pInCallNumber[player.name] = 0;
    return player.SendChatMessage("The call has been hung");
  }


  let number = parseInt(args.join(" "));

  if(isNaN(number) || number == 0) {
    return player.SendChatMessage("This number is not valid");
  }

  if(number == 911) {

    player.SendChatMessage("Hi, this is the police department of Los Santos");
    player.SendChatMessage("How may I help you?");
    pInCall[player.name] = true;
    pInCallNumber[player.name] = 911;

  } else {

    // Check if is a valid telephone number and if the player with that number is connected (for)

    if(gm.utility.CallNumber(player, number)) {
      pInCall[player.name] = true;
      pInCallNumber[player.name] = number;

    } else {
      player.SendChatMessage("The phone you called doesn't exist or is turned off.");
    }

  }

  if(pInCall[player.name]) {
    return player.SendChatMessage("When you want to hang out write again /call");
  }

});


commands.set("hangon", (player) => {
  
  for(let caller of g_players) 
  {
    if(pInCall[caller.name] == true && pInCallNumber[caller.name] == PlayerInfo[player.name].phone) 
    {
      pInCall[player.name] = true;
      pInCallNumber[player.name] = PlayerInfo[caller.name].phone;
      caller.SendChatMessage("the call has been answered");
      player.SendChatMessage("You hang on the call");
      clearInterval(TimerRing[player.name]);
      clearTimeout(gTimerRing[player.name]);
      break;
    }
  }
});


commands.set("group", (player, args) => {
  
  let option = args[0];

  switch(option) {
    case 'create': // Group creation
    {
      let gname = args[1];

      if(typeof gname === 'undefined') {
        return player.SendChatMessage("/group create [group name]");
      }

      if(PlayerInfo[player.name].groupid >= 1) return player.SendChatMessage("You was already in a group");

      let group = new gm.utility.Group(gname);
      group.create(player);
      break;
    }

    case 'invite': { // Invite / invitations


      if(typeof args[1] === 'undefined') return player.SendChatMessage("/group invite [player id or name] | accept/refuse");

      // Accept

      if(args[1] == 'accept') {

        if(typeof GroupInvite[player.name] === 'undefined' || GroupInvite[player.name] == '') return player.SendChatMessage("You don't have a invitations to accept");

        //let grid = GroupInvite[player.name];

        gm.utility.Group.addmember(player, GroupInvite[player.name]);

        GroupInvite[player.name] = '';
        //player.SendChatMessage("New member to de group: " + player.name);
        gm.utility.groupMessage(PlayerInfo[player.name].groupid, "New member to the group: " + player.name, new RGB(255,255,255));
        return player.SendChatMessage("Welcome to the group: " + gm.utility.Group.findNameById(PlayerInfo[player.name].groupid));

      }

      // Refuse

      if(args[1] == 'refuse') {

         if(typeof GroupInvite[player.name] === 'undefined' || GroupInvite[player.name] == '') return player.SendChatMessage("You don't have a invitations to delince");

        GroupInvite[player.name] = '';
        return player.SendChatMessage("You delinced the invitation to the group: " + GroupInfo[GroupInvite[player.name]].name)
      }

      if(PlayerInfo[player.name].groupid == 0) {
        return player.SendChatMessage("You dont have a group!");
      }

      // Invite player

      let gid = gm.utility.Group.findById(PlayerInfo[player.name].groupid);

      let index = GroupInfo[gid].members.indexOf(player.name); //GroupInfo[gid].membersrank.indexOf(GroupInfo[gid].members);
      let memberrank = GroupInfo[gid].membersrank[index];

      if(memberrank < 3) {
        return player.SendChatMessage("You dont have permission to invite people to the group");
      }

      let targets = gm.utility.getPlayer(args[1], true);

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

      if(PlayerInfo[targets[0].name].groupid >= 1) return player.SendChatMessage("This player was already in a group");
      //let group = new gm.utility.Group(GroupInfo[gid].name);
      //let igid = PlayerInfo[player.name].groupid; //GroupInfo[PlayerInfo[player.name].groupid].id;

      GroupInvite[targets[0].name] = gid;

      targets[0].SendChatMessage("You recieved a invitation to the group " + GroupInfo[gid].name + " from " + player.name);
      targets[0].SendChatMessage("You can accept/delince the invitation using: /group invite (accept/refuse)");
      break;

    }

    case 'leave': {
      
      if(PlayerInfo[player.name].groupid == 0) return player.SendChatMessage("You dont have a group!");
      
      let groupName = gm.utility.Group.findNameById(PlayerInfo[player.name].groupid);

      player.SendChatMessage("You leaved from the group: " + groupName);
      // Send group message
      let groupIndex = gm.utility.Group.findById(PlayerInfo[player.name].groupid);

      gm.utility.Group.removemember(player);//, groupIndex);
      break;

    }
    case 'kick': {
      if(PlayerInfo[player.name].groupid == 0 ) return player.SendChatMessage("You don't have a group!");

      let indexGroup = gm.utility.Group.findById(PlayerInfo[player.name].groupid);

      let indexRank = GroupInfo[indexGroup].members.indexOf(player.name);

      if(GroupInfo[indexGroup].membersrank[indexRank] < 4) return player.SendChatMessage("You don't have permission to do that!");

      if(typeof args[1] === 'undefined') return player.SendChatMessage("/group kick [player id or name]");

      let targets = gm.utility.getPlayer(args[1], true);

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

        if(PlayerInfo[player.name].groupid != PlayerInfo[targets[0].name].groupid) return player.SendChatMessage("This player wasn't in your group");

        gm.utility.Group.removemember(targets[0]);

        player.SendChatMessage("You kicked: " + targets[0].name + " from the group");
        targets[0].SendChatMessage("You was kicked from the group " + GroupInfo[indexGroup].name + " by " + player.name);
        break;
    }

    case 'promote': {
      
      if(PlayerInfo[player.name].groupid == 0) return player.SendChatMessage("You aren't in a group");

      let indexGroup = gm.utility.Group.findById(PlayerInfo[player.name].groupid);

      let indexRank = GroupInfo[indexGroup].members.indexOf(player.name);

      if(GroupInfo[indexGroup].membersrank[indexRank] != 7) return player.SendChatMessage("You don't have permission to do that!");

      if(typeof args[1] === 'undefined') return player.SendChatMessage("/group promote [player id or name] [rank]");

      let targets = gm.utility.getPlayer(args[1], true);

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

        let rank = parseInt(args[2]);

        if(rank < 1 || rank > 6) return player.SendChatMessage("Rank must be between 1 and 6")

        let promoteIndex = GroupInfo[indexGroup].members.indexOf(targets[0].name);

        GroupInfo[indexGroup].membersrank[promoteIndex] = rank;

        player.SendChatMessage("You promoted " + targets[0].name + " to rank " + rank);
        targets[0].SendChatMessage("You was promoted to rank " + rank + " by " + player.name);

    }

    case 'show': {
      // Show info group (members & ranks)
      if(PlayerInfo[player.name].groupid == 0) {
        return player.SendChatMessage("You aren't in a group");
      }

      let gid = gm.utility.Group.findById(PlayerInfo[player.name].groupid);
      if(!gid) { 
        player.SendChatMessage("Groups: " + g_groups)
        return player.SendChatMessage("Error when trying to get group info");
      }
      player.SendChatMessage("Group ID: " + gid);

      player.SendChatMessage("Group " + GroupInfo[gid].name  + " member list:")
      for(let i = 0; i < GroupInfo[gid].members.length; i++) {
        player.SendChatMessage("Name: " + GroupInfo[gid].members[i] + " rank: " + GroupInfo[gid].membersrank[i]);
      }
      break;
    }
    default: {
      player.SendChatMessage("You selected a invalid option");
      return player.SendChatMessage("/group (create/invite/leave/kick/show)")
    }
  }
});

commands.set("shop", (player, args) => {
  let product = args[0];
  let quantity = parseInt(args[1]) || 1;

  for(let i = 0; i < g_shops; i++) {

    let sphere = new gm.utility.sphere(ShopInfo[i].position.x, ShopInfo[i].position.y, ShopInfo[i].position.z);
    if(sphere.inRangeOfPoint(player.position)) {
      if(product == null) {
        player.SendChatMessage("Shop items:");
        for(let c = 0; c < ShopInfo[i].items.length; c++) {
          player.SendChatMessage(c + ": " + ShopInfo[i].items[c])
        }
        break;
      } else {
        if(isNaN(quantity)) return player.SendChatMessage("invalid quantity");
        gm.utility.Shop.buy(player, product, quantity);
      }
      return true;
      break;
    }
    return player.SendChatMessage("No shop here");
  }

  /*if(product == null) {
    return false;
  }*/
});

commands.set("disconnect", (player) => {
  player.Kick("Normal quit");
});


/*
                                                                                                                         
  ,ad8888ba,   ,ad8888ba,   88b           d88 88b           d88        db        888b      88 88888888ba,    ad88888ba   
 d8"'    `"8b d8"'    `"8b  888b         d888 888b         d888       d88b       8888b     88 88      `"8b  d8"     "8b  
d8'          d8'        `8b 88`8b       d8'88 88`8b       d8'88      d8'`8b      88 `8b    88 88        `8b Y8,          
88           88          88 88 `8b     d8' 88 88 `8b     d8' 88     d8'  `8b     88  `8b   88 88         88 `Y8aaaaa,    
88           88          88 88  `8b   d8'  88 88  `8b   d8'  88    d8YaaaaY8b    88   `8b  88 88         88   `"""""8b,  
Y8,          Y8,        ,8P 88   `8b d8'   88 88   `8b d8'   88   d8""""""""8b   88    `8b 88 88         8P         `8b  
 Y8a.    .a8P Y8a.    .a8P  88    `888'    88 88    `888'    88  d8'        `8b  88     `8888 88      .a8P  Y8a     a8P  
  `"Y8888Y"'   `"Y8888Y"'   88     `8'     88 88     `8'     88 d8'          `8b 88      `888 88888888Y"'    "Y88888P"   
                                                                                                                         
                                                                                                                         
                                                                                                           
                  88888888888 ,ad8888ba,   88888888ba     888888888888 88888888888 ad88888ba 888888888888  
                  88         d8"'    `"8b  88      "8b         88      88         d8"     "8b     88       
                  88        d8'        `8b 88      ,8P         88      88         Y8,             88       
                  88aaaaa   88          88 88aaaaaa8P'         88      88aaaaa    `Y8aaaaa,       88       
                  88"""""   88          88 88""""88'           88      88"""""      `"""""8b,     88       
                  88        Y8,        ,8P 88    `8b           88      88                 `8b     88       
                  88         Y8a.    .a8P  88     `8b          88      88         Y8a     a8P     88       
                  88          `"Y8888Y"'   88      `8b         88      88888888888 "Y88888P"      88       
                                                                                                           
Shandy-Life test commands.

All of this commands are for debuging purposes.

*/

commands.set("jsontest", (player) => {

  let jsonString = JSON.stringify(PlayerInfo[player.name].licenses);


  console.log(jsonString);

});

commands.set("givePhone", (player) => {
  let phonenumber = gm.utility.generatePhoneNumber();
  //let phonenumber = 999999999;
  PlayerInfo[player.name].phone = phonenumber;
  player.SendChatMessage(PlayerInfo[player.name].phone.toString());
});

commands.set("mypos2", (player, args) => {
  let pposx = player.position.x;
  let pposy = player.position.y;
  let pposz = player.position.z;
  let postotp = new Vector3f(3360.19, -4849.67, 111.8)
  player.SendChatMessage("Position: " + player.position.x);
  player.position = postotp;
  player.SendChatMessage("Position: " + player.position.x);
});

commands.set("checkpos", (player) => {

  if(gm.utility.PlayerToPoint(1.0, player, 3360.19, -4849.67, 111.8)) {
    player.SendChatMessage("YES");
  } else {
    player.SendChatMessage("NOPE");
  }
  
});

commands.set("checkpos2", (player) => {
  
  var sphere = new gm.utility.sphere(3360.19, -4849.67, 111.8, 10.0);


  if(sphere.inRangeOfPoint(player.position)) {
    player.SendChatMessage("TRUE");
  } else {
    player.SendChatMessage("FALSE");
  }

});

commands.set("myname", (player, args) => {
  player.SendChatMessage("Tu nombre es: " + player.name);
});


let spawnedVeh;
let VehInfo = [];
let veh;

commands.set("spawnveh", (player, args) => {

  let model = args.join(" ");
  
  if(model == null) {
    return player.SendChatMessage("Put a fucking model");
  }

  player.SendChatMessage("Model: " + model);

  let vehicle;
  if(isNaN(parseInt(model))) {
    vehicle = gm.utility.VehicleSpawn(model, 3360.19, -4849.67, 111.8)
  } else {
    vehicle = gm.utility.VehicleSpawn(parseInt(model), 3360.19, -4849.67, 111.8);
  }

  //console.log(Object.keys(vehicle));
  //console.log(Object.keys(player));



 /* VehInfo[vehicle] = {
    owner: player.name,
    vmodel: model
  }*/
  
  console.log("Veh networkId: " + vehicle.networkId);

  /*veh = vehicle;
  veh.push("owner", "vmodel");
  veh = {
    owner: player.name,
    vmodel: model
  }*/

  spawnedVeh = vehicle;
});

commands.set("getvehprop", (player,args) => {
  let sadsd = args.join(" ");

  console.log(spawnedVeh[sadsd]);


});

commands.set("scanvehicles", (player) => {
  for (let tempVeh of g_vehicles) {

    if(gm.utility.PlayerToPoint(10, player, tempVeh.position.x, tempVeh.position.y, tempVeh.position.z)) {
      player.SendChatMessage("Vehicle owner: " + vehicle.owner)
    }
  }
});

commands.set("playerprops", (player) => {

  var writeFile = require('./node_modules/write');
  let file = "./logs/PlayerProps.log";
  //player.SendChatMessage(Object.keys(player));
  var playerprops = Object.keys(player);
  var fplayerprops = playerprops//.replace(",","\n")
  //console.log("\n\n" + fplayerprops.replace(","," "));
  
  /*console.log("\n\n");
  console.log("Player Props:");
  console.log(playerprops);

  for(let props of Object.keys(player)) {
    console.log("Properties of: " + props)
    console.log(Object.keys(props))
    console.log("\n");
  }*/

  /*let msg = "";
  msg += "(NEWLINE)";
  msg += "Player Props:";
  msg += playerprops;

  for(let props of Object.keys(player)) {
    msg += "(NEWLINE)Properties of: " + props;
    msg += Object.keys(props);
  }

  writeFile(file, msg, function(err) {
    if (err) console.log(err);
    else console.log("PlayerProps has been writen");
  });*/


  console.log("player.client: " + player.client);
  console.log("player.networkId: " + player.networkId);
  console.log("player.model: " + player.model);
  console.log(Object.keys(player.SetPropIndex));


  //console.log(Object.keys(player.))
});

/*commands.set("shop", (player) => {

});*/

commands.set("additem", (player, args) => {

  let item = args[0];
  let quantity = parseInt(parseInt(args[1]));

  if(isNaN(quantity)) return player.SendChatMessage("Quantity must be a number");

  /*PlayerInventory[player.name].objects.push(item);
  PlayerInventory[player.name].objectsQuantity.push(quantity);
  */

  let objitem = new gm.utility.Item(item, quantity);

  objitem.give(player);

  player.SendChatMessage("Added Item: " + item + " quantity: " + quantity);

});

commands.set("removeitem", (player, args) => {

  let item = args[0];
  let quantity = parseInt(parseInt(args[1]));

  if(isNaN(quantity)) return player.SendChatMessage("Quantity must be a number");

  let objitem = new gm.utility.Item(item, quantity);
  objitem.remove(player);

  player.SendChatMessage("Removed Item: " + item + " quantity: " + quantity);

});

commands.set("inventory", (player) => {

  let itemCount = PlayerInventory[player.name].objects.length;

  player.SendChatMessage("Player inventory: " + "( " + itemCount + " ) Weight: (" + PlayerInventory[player.name].weight + "/" + PlayerInventory[player.name].maxWeight + ")");
  for(let i = 0; i < itemCount; i++) {
    let itemWeight = gm.utility.Item.findByName(gm.items, PlayerInventory[player.name].objects[i]);
    player.SendChatMessage(" Item: " + PlayerInventory[player.name].objects[i] + " quantity: " + PlayerInventory[player.name].objectsQuantity[i] + " weight: " + (itemWeight.w * PlayerInventory[player.name].objectsQuantity[i]));
  }

  //console.log(Object.keys(PlayerInventory[player.name].objects))

});



commands.set("split", (player) => {

  let someString = "a,b,c,d,e,f";

  let result = someString.split(",");

  for(let i = 0; i < result.length; i++) {
    player.SendChatMessage( i + ": " + result[i]);
  }
});



commands.set("showallgroups", (player,args) => {
  
  for(let i = 1; i <= g_groups; i++) {
    player.SendChatMessage("INDEX: " + i);
    player.SendChatMessage("ID: " + GroupInfo[i].id);
    player.SendChatMessage("Members: " + JSON.stringify(GroupInfo[i].members))
    player.SendChatMessage("Members: " + JSON.stringify(GroupInfo[i].membersrank))
  }
});