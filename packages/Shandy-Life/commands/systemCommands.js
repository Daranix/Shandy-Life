"use strict";

module.exports = function(register) {

register("register", function(player, password) {
  //let password = args.join(" ");

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

register("login", function(player, password) {

  if(!Registered[player.name]) {
    return player.SendChatMessage("You wasn't not registered, please first /register [password]");
  } else {

    //let password = arguments.join(" ");

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

// PHONE SYSTEM COMMANDS

register("call", function(player, string_number) {

  if(PlayerInfo[player.name].phone == 0) {
    return player.SendChatMessage("You don't have a phone!");
  }

  if(pInCall[player.name]) {

    if(pInCallNumber[player.name] != 911)
    {
        for(let called of gtamp.players)
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


  let number = parseInt(string_number);

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


register("hangon", function(player) {

  for(let caller of gtamp.players)
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

// GROUP SYSTEM COMMANDS

register("group", function(player) {

  let option = arguments[1];

  switch(option) {
    case 'create': // Group creation
    {
      let gname = arguments[2];

      if(typeof gname === 'undefined') {
        return player.SendChatMessage("/group create [group name]");
      }

      if(PlayerInfo[player.name].groupid >= 1) return player.SendChatMessage("You was already in a group");

      let group = new gm.rpsys.Group(gname);
      group.create(player);
      break;
    }

    case 'invite': { // Invite / invitations


      if(typeof arguments[2] === 'undefined') return player.SendChatMessage("/group invite [player id or name] | accept/refuse");

      // Accept

      if(arguments[2] == 'accept') {

        if(typeof GroupInvite[player.name] === 'undefined' || GroupInvite[player.name] == '') return player.SendChatMessage("You don't have a invitations to accept");

        //let grid = GroupInvite[player.name];

        gm.rpsys.Group.addmember(player, GroupInvite[player.name]);

        GroupInvite[player.name] = '';
        //player.SendChatMessage("New member to de group: " + player.name);
        gm.rpsys.groupMessage(PlayerInfo[player.name].groupid, "New member to the group: " + player.name, new RGB(255,255,255));
        return player.SendChatMessage("Welcome to the group: " + gm.rpsys.Group.findNameById(PlayerInfo[player.name].groupid));

      }

      // Refuse

      if(arguments[2] == 'refuse') {

        if(typeof GroupInvite[player.name] === 'undefined' || GroupInvite[player.name] == '') return player.SendChatMessage("You don't have a invitations to delince");

        GroupInvite[player.name] = '';
        return player.SendChatMessage("You delinced the invitation to the group: " + GroupInfo[GroupInvite[player.name]].name)
      }

      if(PlayerInfo[player.name].groupid == 0) {
        return player.SendChatMessage("You dont have a group!");
      }

      // Invite player

      let gid = gm.rpsys.Group.findById(PlayerInfo[player.name].groupid);

      let index = GroupInfo[gid].members.indexOf(player.name); //GroupInfo[gid].membersrank.indexOf(GroupInfo[gid].members);
      let memberrank = GroupInfo[gid].membersrank[index];

      if(memberrank < 3) {
        return player.SendChatMessage("You dont have permission to invite people to the group");
      }

      let targets = gm.utility.getPlayer(arguments[2], true);

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

      let groupName = gm.rpsys.Group.findNameById(PlayerInfo[player.name].groupid);

      player.SendChatMessage("You leaved from the group: " + groupName);
      // Send group message
      let groupIndex = gm.rpsys.Group.findById(PlayerInfo[player.name].groupid);

      gm.rpsys.Group.removemember(player);//, groupIndex);
      break;

    }
    case 'kick': {
      if(PlayerInfo[player.name].groupid == 0 ) return player.SendChatMessage("You don't have a group!");

      let indexGroup = gm.rpsys.Group.findById(PlayerInfo[player.name].groupid);

      let indexRank = GroupInfo[indexGroup].members.indexOf(player.name);

      if(GroupInfo[indexGroup].membersrank[indexRank] < 4) return player.SendChatMessage("You don't have permission to do that!");

      if(typeof arguments[2] === 'undefined') return player.SendChatMessage("/group kick [player id or name]");

      let targets = gm.utility.getPlayer(arguments[2], true);

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

        gm.rpsys.Group.removemember(targets[0]);

        player.SendChatMessage("You kicked: " + targets[0].name + " from the group");
        targets[0].SendChatMessage("You was kicked from the group " + GroupInfo[indexGroup].name + " by " + player.name);
        break;
    }

    case 'promote': {

      if(PlayerInfo[player.name].groupid == 0) return player.SendChatMessage("You aren't in a group");

      let indexGroup = gm.rpsys.Group.findById(PlayerInfo[player.name].groupid);

      let indexRank = GroupInfo[indexGroup].members.indexOf(player.name);

      if(GroupInfo[indexGroup].membersrank[indexRank] != 7) return player.SendChatMessage("You don't have permission to do that!");

      if(typeof arguments[2] === 'undefined') return player.SendChatMessage("/group promote [player id or name] [rank]");

      let targets = gm.utility.getPlayer(arguments[2], true);

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

        let rank = parseInt(arguments[3]);

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

      let gid = gm.rpsys.Group.findById(PlayerInfo[player.name].groupid);
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

// SHOP SYSTEM COMMAND

register("shop", function(player) {

  let sphere;

  for(let i = 0; i < g_shops; i++) {

  sphere = new gm.utility.sphere(ShopInfo[i].position.x, ShopInfo[i].position.y, ShopInfo[i].position.z);

  if(sphere.inRangeOfPoint(player.position)) {

      //if(typeof arguments[1] === 'undefined') return player.SendChatMessage("Use: /shop (buy/sell/show)");
      console.log(arguments[1]);
      let option = "show";
      if(typeof arguments[1] != 'undefined') { option = arguments[1].toLowerCase(); }

      switch(option) {

        case 'buy': {

          if(ShopInfo[i].type == 'dealer') return player.SendChatMessage("You can't buy nothing here");

          let product = arguments[2];
          let quantity = parseInt(arguments[3]);

          if(typeof product === 'undefined' || quantity <= 0 || typeof quantity === 'undefined' || isNaN(quantity)) return player.SendChatMessage("To buy use: /shop buy [item number or name] [quantity]");

          if(isNaN(parseInt(product))) {
            //if(isNaN(quantity)) return player.SendChatMessage("quantity must be a number");

            gm.rpsys.Shop.buy(player, product, quantity)

          } else {
            if(isNaN(quantity)) return player.SendChatMessage("quantity must be a number");

            let itemIndex = parseInt(product);

            if(typeof ShopInfo[i].items[itemIndex] === 'undefined') return player.SendChatMessage("Item number not valid");

            gm.rpsys.Shop.buy(player, ShopInfo[i].items[itemIndex], quantity);

          }
          break;
        }

        case 'sell': {

          let product = arguments[2];
          let quantity = parseInt(arguments[3]);

          if(typeof product === 'undefined' || quantity <= 0 || typeof quantity === 'undefined' || isNaN(quantity)) return player.SendChatMessage("To sell use: /shop sell [item number or name] [quantity]");

          if(isNaN(parseInt(product))) {
            gm.rpsys.Shop.sell(player, product, quantity);
          } else {
            let sellItem = [];

            for(let c = 0; c < PlayerInventory[player.name].objects; c++) {
              if(gm.utility.isInArray(PlayerInventory[player.name].objects[c], ShopInfo[i].items)) {
                sellItem.push(PlayerInventory[player.name].objects[c]);
              }
            }

              let indexItem = parseInt(product);

              if(ShopInfo[i].type == 'dealer') {
                gm.rpsys.Shop.sell(player, sellItem[indexItem], quantity);
              } else {
                gm.rpsys.Shop.sell(player, ShopInfo[i].items[indexItem], quantity);
              }

            }
            break;
          }

        case 'show':
        default: {

          if(ShopInfo[i].type == 'dealer') {
            player.SendChatMessage(" You can sell the next things here: (use /shop sell [item number or name] [quantity]");
            let count = 0;
            for(let c = 0; c < PlayerInventory[player.name].objects; c++) {
              if(gm.utility.isInArray(PlayerInventory[player.name].objects[c], ShopInfo[i].items)) {
                player.SendChatMessage(count + ": " + PlayerInventory[player.name].objects[c]);
                count++;
              }
            }

          } else {
            player.SendChatMessage("Items of the shop (use: /shop sell | buy [item number or name] [quantity]")
            for(let c = 0; c < ShopInfo[i].items.length; c++) {
              player.SendChatMessage(c + ": " + ShopInfo[i].items[c]);
            }

          }
          break;
        }

      } // options switch end
      return true;
    } // position Check end
  } // for end

  return player.SendChatMessage("You aren't in a shop");

});

// FARM COMMAD

register("farm", (player) => {
  gm.rpsys.farm.pick(player);
});

// HOUSE COMMAND

register("house", (player, args) => {
  let option = arguments[1];

  switch(option) {
    case 'enter': gm.rpsys.house.enter(player); break;
    case 'buy': gm.rpsys.house.buy(player); break;
    case 'sell': gm.rpsys.house.sell(player); break;
    case 'enter': gm.rpsys.house.enter(player); break;
    default: player.SendChatMessage("use: /house (enter/buy/sell)"); break;
  }
});

// HOUSE COMMAND

}; // End of systemCommands