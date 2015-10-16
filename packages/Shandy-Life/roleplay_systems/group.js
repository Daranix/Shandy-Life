/**

	  _|_|_|  _|                                  _|                _|        _|      _|_|            
	_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
	  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
	      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
	_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
	                                                        _|                                        
	                                                    _|_| 
 ********************************************
 * @author Daranix							*
 * @Contributions myami
 * @Description: Shandy-Life group system.  *
 ********************************************

*/

"use strict";

class Group {

	constructor(gname) {
		this.name = gname;
	}

	static Update(indexGroup) {

		console.log("Uploading info of group in index: " + indexGroup);

		let connection = gm.utility.dbConnect();

		connection.connect();

		//let groupname = connection.escape(GroupInfo[gid].name); // Not Gname is this.name
		let members = connection.escape(GroupInfo[indexGroup].members.toString());
		let membersrank = connection.escape(GroupInfo[indexGroup].membersrank.toString());

		let SQLQuery = "UPDATE groups SET members = " + members + ", membersrank = " + membersrank +" WHERE id = " + GroupInfo[indexGroup].id;

		connection.query(SQLQuery, function(err) {
			if(err) {
			  console.log("[GROUP ERROR]: " + err);
			  console.log("[GROUP QUERY]: " + SQLQuery);
			} 
		});

		connection.end();
	}

	static addmember(player, gid) 
	{
		GroupInfo[gid].members.push(player.name);
		GroupInfo[gid].membersrank.push(1);
		player.info.groupid = GroupInfo[gid].id;
		Group.Update(gid);
		gm.events.onPlayerUpdate(player);

	 /*for(let i = 1; i <= g_groups; i++)
	  {
	    if(GroupInfo[i].id == gid)
	    {
	    	console.log("Adding the member");
			GroupInfo[i].members.push(player.name);
			GroupInfo[i].membersrank.push(1);
			player.info.groupid = GroupInfo[i].id;



			// HERE THE UPDATE FOR THE GROUP TO UPDATE THE INFO OF THE NEW MEMBER

			Utility.Group.Update(GroupInfo[i].id);
			
	      break;
	    }
	  }	*/
	}

	static removemember(player) {
		let indexGroup = Group.findById(player.info.groupid);
		console.log("Indexgroup:" + indexGroup);
		let index = GroupInfo[indexGroup].members.indexOf(player.name);

		GroupInfo[indexGroup].members[index] = "PLAYER_DELETED_HERE";
		console.log("Player deleted on index: " + index);


		let reorder = [];
		let reorderRanks = [];

		for(let i = 0; i <= GroupInfo[indexGroup].members.length; i++) 
		{
			if(GroupInfo[indexGroup].members[i] == "PLAYER_DELETED_HERE") 
			{
				//console.log("DELETING INDEX: " + i);
				GroupInfo[indexGroup].members.splice(i, 1);
				GroupInfo[indexGroup].membersrank.splice(i, 1);
			} /*else {
				console.log("player deleted");
			}*/
		}

		console.log("MEMBERS length = " + GroupInfo[indexGroup].members.length);
		console.log("MEMBERS JSON STRING: " + JSON.stringify(GroupInfo[indexGroup].members));
		console.log("MEMBERS JSON STRING: " + JSON.stringify(GroupInfo[indexGroup].membersrank));

		if(GroupInfo[indexGroup].members.length == 0) {

			let connection = gm.utility.dbConnect();

			connection.connect();

			let SQLQuery = "DELETE FROM groups WHERE id = " + GroupInfo[indexGroup].id;

			connection.query(SQLQuery, function(err) {
				if(err) {
					console.log("[GROUP ERROR]: An error ocurred trying to delete group ID = " + GroupInfo[indexGroup].id);
					console.log("[QUERY]: " + SQLQuery);
					console.log("[GROUP ERROR]: " + err)
				} else {
					gm.utility.print(" [GROUP DELETED] ID: " + GroupInfo[indexGroup].id);
				}
			});

			connection.end();
		} else {

			if(GroupInfo[indexGroup].membersrank[0] < 7 ) {
				GroupInfo[indexGroup].membersrank[0] = 7;
			}
			Group.Update(indexGroup);
		}

		player.info.groupid = 0;
		gm.events.onPlayerUpdate(player);
		return true;
	}

	static findNameById(id)
	{
		for(let i = 1; i <= g_groups; i++) 
		{
			if(GroupInfo[i].id == id) {
				return GroupInfo[i].name;
				break;
			}
			//return false;
		}
		return false;
	}

	static findById(id) 
	{
		console.log("Groups: " + g_groups);
		for(let i = 1; i <= g_groups; i++) 
		{
			//console.log("CHECKING BY INDEX: " + i);
			//console.log("CHECKING GROUP ID: " + GroupInfo[i].id);
			if(GroupInfo[i].id == id) {
				//console.log("Returning: " + i);
				return i;
				break;
			}
			//return false;
		}
		return false;
	}

}

// Define a prototype to create de group

Group.prototype.create = function(player)
{

	 g_groups += 1; // Beacuse the default value for player.info.groupid its 0 and global.groups starts in 0

	 GroupInfo[g_groups] = {
	  id: 0,
	  name: this.name,
	  members: [player.name],
	  membersrank: [7]
	 };

	 //player.info.groupid = g_groups;

	// HERE WAS THE CONNECTION MYSQL to PUT INTO THE TABLE "GROUPS" THE INFO OF THE GROUP.
	// u dont need to use JSON u can just GroupInfo[groups].members.toString();

	let connection = gm.utility.dbConnect();

	connection.connect();

	let groupname = connection.escape(this.name); // Not Gname is this.name
	let members = connection.escape(GroupInfo[g_groups].members.toString());
	let membersrank = connection.escape(GroupInfo[g_groups].membersrank.toString());

	let SQLQuery = "INSERT INTO groups (name, members, membersrank) VALUES (" + groupname + "," + members + ", " + membersrank + ");";

	connection.query(SQLQuery, function(err) {
		if(err) {
		  player.SendChatMessage("[ERROR] Problem in the group creation");
		  console.log("[GROUP ERROR]: " + err);
		  console.log("[GROUP QUERY]: " + SQLQuery);
		} else {
			player.SendChatMessage("The group " + groupname + " has been created");
		}
	});

	SQLQuery = "SELECT * FROM `groups` ORDER BY `groups`.`id` DESC";

	connection.query(SQLQuery, function(err, result) {
		if(err) return console.log("ERROR: " + err)
		GroupInfo[g_groups].id = result[0].id;
		player.SendChatMessage("GROUP ID: " + GroupInfo[g_groups].id);
		player.info.groupid = result[0].id;
		gm.events.onPlayerUpdate(player);
		//console.log("GROUPID CHANGED FOR PLAYER = ")
	});

	connection.end();

	
}

module.exports = Group;