/*
 
  _|_|_|  _|                                  _|                _|        _|      _|_|            
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
                                                        _|                                        
                                                    _|_| 
 ********************************************************************
 * @overview GTA:Multiplayer | Shandy Life - Roleplay: config  file *
 * @author "Daranix" & Jan "Waffle" C.                              *
 ********************************************************************
*/

"use strict";

function interior() {
  return {

  }
}

module.exports = {
  badWords: ["fuck", "shit", "BitEmE"],
  badNames: ["PLAYER_DELETED_HERE"],
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
    host     : '127.0.0.1',
    user     : 'root',
    password : 'root',
    database : 'roleplay',
    salt     : 'QrTxL'
  }


};
