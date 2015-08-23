/**
 * @overview GTA:Multiplayer Default Package: Config File
 * @author Jan "Waffle" C.
 * @copyright (c) GTA:Multiplayer [gta-mp.net]
 * @license https://master.gta-mp.net/LICENSE
 */
"use strict";

function interior() {
  return {

  }
}

module.exports = {
  badWords: ["fuck", "shit", "BitEmE"],
  world: {
    weather: 1,
    windLevel: 0.0,
    rainLevel: 0.0,
    snowLevel: 0.0,
    timeScale: 1.0,
    IPLs: ['shr_int'],
    interiors: [],
    capInteriors: true
  },
  
  mysql: {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'roleplay',
    salt     : 'QrTxL'
  }


};
