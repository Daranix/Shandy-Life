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
    IPLs: ['shr_int', 'FIBlobby', 'bh1_47_joshhse_firevfx', 'jewel2fake', 'RC12B_HospitalInterior'],
    interiors: [],
    capInteriors: true
  },
  
  mysql: {
    host     : '192.168.0.200',
    user     : 'root',
    password : 'root',
    database : 'roleplay',
    salt     : 'QrTxL'
  }


};
