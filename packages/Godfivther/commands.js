/*
 
  _|_|_|  _|                                  _|                _|        _|      _|_|            
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
                                                        _|                                        
                                                    _|_| 
 *****************************************************************
 * @overview GTA:Multiplayer Godfivther - Roleplay: commands     *
 * @author "Daranix" & Jan "Waffle" C.                           *
 *****************************************************************
 */
"use strict";
let commands = module.exports = new Map();

let red = new RGB(255, 59, 59);

commands.set("help", (player) => {
  player.SendChatMessage("List of commands: ");
  let i = 1;
  commands.forEach((_, key) => {
    player.SendChatMessage(" /" + key);
  });
});

commands.set("broadcast", (player, args) => {

  if(PlayerInfo[player.name].adminlvl < 1) {
    return player.SendChatMessage("You don't have access to that command");
  }

  gm.utility.broadcastMessage("[ADMIN] " + player.name + ": " + args.join(" "));

});

commands.set("goto", (player, args) => {

  if(PlayerInfo[player.name].adminlvl < 1) {
    return player.SendChatMessage("You don't have access to that command");
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
    return player.SendChatMessage("You don't have access to that command");
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

commands.set("myname", (player, args) => {
  player.SendChatMessage("Tu nombre es: " + player.name);
});

/*commands.set("money", (player, args) => {
  //let whatmoney = gm.utility.GetPlayerMoney(player);
  let whatmoney = player.stats.GetStatInt("SP0_TOTAL_CASH");
  player.SendChatMessage("Tienes :" + whatmoney + "$");
});*/

commands.set("mypos", (player, args) => {
  let pposx = player.position.x;
  let pposy = player.position.y;
  let pposz = player.position.z;
  let postotp = new Vector3f(3360.19, -4849.67, 111.8)
  player.SendChatMessage("Position: " + player.position.x);
  player.position = postotp;
  player.SendChatMessage("Position: " + player.position.x);
});

commands.set("checknear", (player, args) => {
  if(gm.utility.PlayerToPoint(1.0, player, 3360.19, -4849.67, 111.8)) {
      player.SendChatMessage("TRUE");
  } else {
      player.SendChatMessage("FALSE");
  }
});

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

                gm.events.onPlayerUpdate(player);
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
    return player.SendChatMessage("You don't have access to that command");
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
    return player.SendChatMessage("You don't have access to that command");
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
    return player.SendChatMessage("You don't have access to that command");
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

  if(gm.events.onPlayerUpdate(targets[0])) {
    player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to admin level: " + adminlvl);
    targets[0].SendChatMessage("[ADMIN] You was promoted to admin level " + adminlvl + " by " + player.name);
  } else {
    player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name)
  }

});

commands.set("promotefaction", (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl < 3) {
    return player.SendChatMessage("You don't have access to that command");
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

  if(gm.events.onPlayerUpdate(targets[0])) {
    player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to faction id: " + factionid);
    targets[0].SendChatMessage("[ADMIN] You was promoted to faction: " + FactionName[factionid] + " by " + player.name);
  } else {
    player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name);
  }

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
    return player.SendChatMessage("You don't have access to this command");
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

  gm.events.onPlayerUpdate(targets[0]);

  player.SendChatMessage("[ADMIN] You given " + giveLicens + " to : " + targets[0].name);
  return targets[0].SendChatMessage("[ADMIN] You recieved license: " + giveLicens + " by " + player.name);



});

commands.set("removeLicense", (player, args) => {
  
  if(PlayerInfo[player.name].adminlvl < 3) {
    return player.SendChatMessage("You don't have access to this command");
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
  gm.events.onPlayerUpdate(targets[0]);

  player.SendChatMessage("[ADMIN] You remove " + giveLicens + " to : " + targets[0].name);
  return targets[0].SendChatMessage("[ADMIN] Your license: " + giveLicens + " was removed by " + player.name);

});

/*commands.set("try", (player, args) => {

});

commands.set("me", (player, args) => {

});

commands.set("report", (player, args) => {

});

commands.set("w", (player, args) => {

});*/

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
      break;
    }
  }
});

commands.set("jsontest", (player) => {

  let jsonString = JSON.stringify(PlayerInfo[player.name].licenses);


  console.log(jsonString);

});

commands.set("disconnect", (player) => {
  player.Kick("Normal quit");
});

commands.set("givePhone", (player) => {
  let phonenumber = gm.utility.generatePhoneNumber();
  //let phonenumber = 999999999;
  PlayerInfo[player.name].phone = phonenumber;
  player.SendChatMessage(PlayerInfo[player.name].phone.toString());
});

