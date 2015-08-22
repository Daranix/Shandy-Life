/**
 * @overview GTA:Multiplayer Default Package: Hashes
 * @author Jan "Waffle" C.
 * @copyright (c) GTA:Multiplayer [gta-mp.net]
 * @license https://master.gta-mp.net/LICENSE
 */
"use strict";

let peds = require('./peds');
let weapons = require('./weapons');

class Hashes {
  /**
   * Returns all Ped hashes (and their names, see peds.js)
   *
   * @returns {Array} array of all ped models
   */
  static get peds() {
    return peds;
  }
  /**
   * Returns all Weapon hashes (and their names, see weapons.js)
   *
   * @returns {Array} array of all ped models
   */
  static get weapons() {
    return weapons;
  }

  /**
   * Finds a certain hash by its name
   *
   * @param {Array} target the array of hashes in which we will look
   * @param {string} name the name of the item
   * @returns {Object|undefined} hash/name object
   */
  static findByName(target, name) {
    for (let obj of target) {
      if (typeof obj.n === "undefined" || typeof obj.h === "undefined") {
        continue;
      }
      if (obj.n === name) {
        return obj;
      }
    }
    return;
  }

  /**
   * Finds a name in the given array of hashes.
   *
   * @param {Array} target the array of hashes in which we will look
   * @param {integer} hash hash representation
   * @returns {Object|undefined} hash/name object
   */
  static findByHash(target, hash) {
    for (let obj of target) {
      if (typeof obj.n === "undefined" || typeof obj.h === "undefined") {
        continue;
      }
      if (obj.n === hash) {
        return obj;
      }
    }
    return;
  }
}

module.exports = Hashes;
