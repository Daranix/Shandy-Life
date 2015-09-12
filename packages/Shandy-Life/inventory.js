/**

  _|_|_|  _|                                  _|                _|        _|      _|_|            
_|        _|_|_|      _|_|_|  _|_|_|      _|_|_|  _|    _|      _|              _|        _|_|    
  _|_|    _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|  _|_|_|_|  _|_|_|_|  
      _|  _|    _|  _|    _|  _|    _|  _|    _|  _|    _|      _|        _|    _|      _|        
_|_|_|    _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|      _|_|_|_|  _|    _|        _|_|_|  
                                                        _|                                        
                                                    _|_| 

 * @author Daranix
 * @Description: Shandy-Life inventory definitions
 * @n: name of the item
 * @w: weight of the item
 * Note: Sell price is the half of @p
 */
"use strict";

module.exports = [
	// --------- Drugs --------- //
	{n:'plant cocaine', 	w: 2},
	{n:'marijuana plant', 	w: 2},
	{n:'chemical products', w: 2},
	{n:'cocaine', 			w: 8},
	{n:'marijuana (weed)', 	w: 8},
	{n:'lsd', 				w: 10},
	// --------- Beverages ------- //
	{n:'orange juice', 		w: 2},
	{n:'lemon juice', 		w: 2},
	{n:'cocacola', 			w: 2},
	{n:'bottle of water', 	w: 2},
	//{n:'alcohol', w:4},
	{n:'vodka', 			w: 4},
	{n:'whisky', 			w: 4},
	// -------- Foods -------- //
	{n:'kebab', 			w: 1},
	{n:'pork meat', 		w: 3},
	{n:'chicken meat', 		w: 3},
	{n:'omelette', 			w: 4},
	{n:'rat', 				w: 1}, // Yes its food xD
	{n:'apple', 			w: 1},
	{n:'bannana', 			w: 1},
	{n:'orange', 			w: 1},
	// ------ Other items ------- //
	{n:'wives', 			w: 10},
	{n:'flanges', 			w: 1},
	{n:'shears', 			w: 4},
	{n:'explosive charge', 	w: 40},
	//{n:'yo-yo', w:1},
	//{n:'portatil', w:14},
	{n:'flanges keys', 		w: 2},
	// ----- Minerals --------- //
	{n: 'diamond', 			w: 2},
	{n: 'coal', 			w: 2},
	{n: 'gold',				w: 2},
	{n: 'ruby',				w: 2}
];
