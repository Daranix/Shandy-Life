/**
 * @overview GTA:Multiplayer Default Package: Commands
 * @author Jan "Waffle" C. edit: Daranix
 * @copyright (c) GTA:Multiplayer [gta-mp.net]
 * @license https://master.gta-mp.net/LICENSE
 */
"use strict";
let commands = module.exports = new Map();

let red = new RGB(255, 59, 59);
commands.set("help", (player) => {
  let str = "List of available commands:<br /><table><thead><tr>";
  let i = 1;
  commands.forEach((_, key) => {
    str += "<td>/" + key + "</td>";
    if (i % 3 === 0) {
      str += "</tr><tr>";
    }
    i++;
  });
  str = str.substr(0, str.length - 3) + "/table>";
  player.SendChatMessage(str);
});

commands.set("broadcast", (player, args) => {
  //gm.utility.broadcastMessage("((BROADCAST)) " + player.name + ": " + args.join(" "));
  if(pAdmin[player.name] < 1) {
    return player.SendChatMessage("You don't have access to that command");
  }

  gm.utility.broadcastMessage("[ADMIN] " + player.name + ": " + args.join(" "));

});

commands.set("goto", (player, args) => {

  if(pAdmin[player.name] < 1) {
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
  
  if(pAdmin[player.name] <= 3) {
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
  //let ppos  = pposx + ", " + pposy + ", " + pposz;
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
  //gm.utility.broadcastMessage("((BROADCAST)) " + player.name + ": " + args.join(" "));

  if(pLogged[player.name]) {
    return player.SendChatMessage("You was already registered");
  }

  let connection = gm.utility.dbConnect();
  
  connection.connect();

  connection.query("SELECT name FROM users WHERE name = '" + player.name + "'", function(err, results) {
    
    let numRows = results.length;

    if(numRows >= 1) {
      connection.end();
      return player.SendChatMessage("You was already registered sign in with: /login [Password]");
    }
  });

  //let confirreg; // Variable que se asigna al jugador para que confirme la pwd
  
  if(ConfirmReg[player.name]) 
  {
    if(ConfirmPwd[player.name] == password) 
    {
      let salt = gm.config.mysql.salt;
      password = connection.escape(password) + salt;
      let pwdhash = gm.md5(password); //cryptomd5.createHash('md5').update(password).digest('hex');
      console.log("Hash created: " + pwdhash);
      let SQLQuery = "INSERT INTO users (name, password) VALUES ('" + player.name+ "','" + pwdhash + "');";
      connection.query(SQLQuery, function(err) {
        
        if(!err) {
            console.log("user "+ player.name + " registered sucesfull \n\n");
            player.SendChatMessage("You was been registered sucesfull");
            connection.query("SELECT id FROM users WHERE name = '" + player.name + "'", function(err2, results)
              {
                pId[player.name]      = results[0].id;
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
    password = connection.escape(password) + gm.config.mysql.salt;
    let pwdhash = gm.md5(password);
    let SQLQuery = "SELECT * FROM users WHERE name = '" + player.name + "' AND password = '" + pwdhash + "'";
    console.log(SQLQuery);

    connection.query(SQLQuery, function(err, results) {
      let num_rows = results.length;

      if(num_rows >= 1) {
        //let someValue = rows[0];//rows[0].data.toString();
        
        if(results[0].banned) {
          player.Kick("You was banned from the server");
        }

        pId[player.name]      = results[0].id;
        pAdmin[player.name]   = results[0].adminlvl;
        pFaction[player.name] = results[0].faction;

        console.log(results[0]);
        pLogged[player.name] = true;
        return player.SendChatMessage("ID: " + pId[player.name] + "\nAdminLvl: " + pAdmin[player.name]);
      } else {
        player.SendChatMessage("Incorrect password, please try again.")
      }

    });

    connection.end();

  }
});

commands.set("hash", (player, args) => {
  let text = args.join(" ");
  let hashtext = gm.md5(text); //gm.crypto.createHash('md5').update(text).digest('hex');
  player.SendChatMessage(hashtext);
});

commands.set("stats", (player) => {
  return player.SendChatMessage("ID: " + pId[player.name] + "\nAdminLevel: " + pAdmin[player.name]);
});

commands.set("kick", (player, args) => {
  

  if(pAdmin[player.name] < 1) {
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
  targets[0].Kick("[ADMIN] You were kicked from the Server by " + player.name + " reason: " + reason);

});

commands.set("ban", (player, args) => {
  
  if (args.length === 0) {
    return player.SendChatMessage("USAGE: /ban [id or name] [Reason]", red);
  }

  if(pAdmin[player.name] < 1) {
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
  
  if(pAdmin[player.name] < 3) {
    return player.SendChatMessage("You don't have access to that command");
  }

  if (args.length === 0) {
    return player.SendChatMessage("USAGE: /promoteadmin [id or name] [adminlvl]", red);
  }

  let adminlvl = parseInt(args[1]);

  if(isNaN(adminlvl)) {
    player.SendChatMessage("Admin Level must be a number")
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


  pAdmin[targets[0].name] = adminlvl;

  if(!gm.events.onPlayerUpdate(player)) {
    player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to admin level: " + adminlvl);
    targets[0].SendChatMessage("[ADMIN] You was promoted to admin level " + adminlvl + " by " + player.name);
  } else {
    player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name)
  }

});

commands.set("promotefaction", (player, args) => {
  
  if(pAdmin[player.name] < 3) {
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


  pFaction[targets[0].name] = factionid;

  if(!gm.events.onPlayerUpdate(player)) {
    player.SendChatMessage("[ADMIN] You promoted " + targets[0].name + " to faction id: " + factionid);
    targets[0].SendChatMessage("[ADMIN] You was promoted to faction: " + FactionName[factionid] + " by " + player.name);
  } else {
    player.SendChatMessage("[ERROR] An error ocurred when trying to upload player info of " + targets[0].name);
  }

});

commands.set("f", (player,args) => {
  let message = "(( " + player.name + ": " + args.join(" ") + " ))";
  if(pFaction[player.name] >= 1) {
    gm.utility.factionMessage(pFaction[player.name], message, new RGB(255,255,0));
  } else {
    return player.SendChatMessage("You don't have a faction");
  }
});

/*commands.set("update", (player) => {
  gm.events.updateAllPlayers();
  console.log("Updated info of all players");
});

commands.set("intervaltest", (player) => {

  let n = 0;

  setInterval(function() {
    
    console.log(n);
    n++;  
  }, gm.utility.seconds(3));
});

commands.set("jsontest", (player) => {
  
  //player.SendChatMessage(license[player.name].car);
  //license[player.name]["cars"];

});

commands.set("giveLicense", (player, args) => {
  
  let lname = args.join(" ");
  pLiceses[player.name][lname] = true;

  gm.utility.onPlayerUpdate(player);

});*/