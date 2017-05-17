var util = require('util');
var fs = require('fs');
var functions = require('../functions');

module.exports = {
    GameData: GameData
};

var $GameData = GameData.prototype;
$GameData.loadData = GameData$loadData;
$GameData.initPetTypes = GameData$initPetTypes;

function GameData(bot) {
	this._bot = bot;

	this.items = new Object();

	this.skills = new Object();

	this.chars = new Object();

	this.gates = new Object();

	this.petTypes = {
		grabPets: 			[],
		grabPetItems: 		[],
		attackPets: 		[],
		attackPetItems: 	[],
	};

	this.loadData();
	this.initPetTypes();
}

function GameData$loadData() {
	var lines, line, lineItems;

	// load itemdata
	/*
	lines = fs.readFileSync('./gamedata/data/itemdata.txt').toString().split('\n');

	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if(!line.startsWith('//')) {
			lineItems = line.split(',');
			this.items.id.push(parseInt(lineItems[0]));
			this.items.type.push(lineItems[1] || 'ITEM_UNKNOWN');
			this.items.name.push(lineItems[2] || 0);
			this.items.level.push(lineItems[3] || 0);
			this.items.maxStack.push(lineItems[4] || 1);
			this.items.durability.push(lineItems[5] || 0);
		}
	};
	*/
	// load itemdata
	lines = fs.readFileSync('./gamedata/data/itemdata.txt').toString().split('\n');

	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if(!line.startsWith('//')) {
			var tempObj, id;
			tempObj = new Object();
			lineItems = line.split(',');

			id = parseInt(lineItems[0]);
			tempObj.id = id;
			tempObj.type = lineItems[1] || 'ITEM_UNKNOWN';
			tempObj.name = lineItems[2] || 0;
			tempObj.level = lineItems[3] || 0;
			tempObj.maxStack = lineItems[4] || 1;
			tempObj.durability = lineItems[5] || 0;
			this.items[id] = tempObj;
		}
	};

	// load skilldata
	lines = fs.readFileSync('./gamedata/data/skilldata.txt').toString().split('\n');

	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if(!line.startsWith('//')) {
			var tempObj, id;
			tempObj = new Object();
			lineItems = line.split(',');

			id = parseInt(lineItems[0]);
			tempObj.id = id;
			tempObj.type = lineItems[1] || 'SKILL_UNKNOWN';
			tempObj.name = lineItems[2] || 0;
			tempObj.castTime = lineItems[3] || 0;
			tempObj.coolDown = lineItems[4] || 1;
			tempObj.reqMP = lineItems[5] || 0;
			this.skills[id] = tempObj;
		}
	};

	// load chardata
	lines = fs.readFileSync('./gamedata/data/chardata.txt').toString().split('\n');

	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if(!line.startsWith('//')) {
			var tempObj, id;
			tempObj = new Object();
			lineItems = line.split(',');

			id = parseInt(lineItems[0]);
			tempObj.id = id;
			tempObj.type = lineItems[1] || 'CHAR_UNKNOWN';
			tempObj.name = lineItems[2] || 0;
			tempObj.level = lineItems[3] || 0;
			tempObj.hp = lineItems[4] || 0;
			this.chars[id] = tempObj;
		}
	};

	// load teleportbuilding
	lines = fs.readFileSync('./gamedata/data/teleportbuilding.txt').toString().split('\n');

	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if(!line.startsWith('//')) {
			var tempObj, id;
			tempObj = new Object();
			lineItems = line.split(',');

			id = parseInt(lineItems[0]);
			tempObj.id = id;
			tempObj.type = lineItems[1] || 'STORE_UNKNOWN_GATE';
			tempObj.name = lineItems[2] || 0;
			tempObj.level = lineItems[3] || 0;
			tempObj.hp = lineItems[4] || 0;
			this.gates[id] = tempObj;
		}
	};
}

function GameData$initPetTypes(){
	//attack pets
	this.petTypes.attackPets.push('COS_P_BEAR');
	this.petTypes.attackPets.push('COS_P_FOX');
	this.petTypes.attackPets.push('COS_P_PENGUIN');
	this.petTypes.attackPets.push('COS_P_WOLF_WHITE_SMALL');
	this.petTypes.attackPets.push('COS_P_WOLF_WHITE');
	this.petTypes.attackPets.push('COS_P_WOLF');
	this.petTypes.attackPets.push('COS_P_JINN');
	this.petTypes.attackPets.push('COS_P_KANGAROO');
	this.petTypes.attackPets.push('COS_P_RAVEN');

	//attack pet items
	this.petTypes.attackPetItems.push('ITEM_COS_P_BEAR_SCROLL');
	this.petTypes.attackPetItems.push('ITEM_COS_P_FOX_SCROLL');
	this.petTypes.attackPetItems.push('ITEM_COS_P_PENGUIN_SCROLL');
	this.petTypes.attackPetItems.push('ITEM_COS_P_FLUTE_WHITE_SMALL');
	this.petTypes.attackPetItems.push('ITEM_COS_P_FLUTE_WHITE');
	this.petTypes.attackPetItems.push('ITEM_COS_P_FLUTE');
	this.petTypes.attackPetItems.push('ITEM_COS_P_FLUTE_SILK');
	this.petTypes.attackPetItems.push('ITEM_COS_P_JINN_SCROLL');
	this.petTypes.attackPetItems.push('ITEM_COS_P_KANGAROO_SCROLL');
	this.petTypes.attackPetItems.push('ITEM_COS_P_RAVEN_SCROLL');

	//grab pets
	this.petTypes.grabPets.push('COS_P_SPOT_RABBIT');
	this.petTypes.grabPets.push('COS_P_RABBIT');
	this.petTypes.grabPets.push('COS_P_GGLIDER');
	this.petTypes.grabPets.push('COS_P_MYOWON');
	this.petTypes.grabPets.push('COS_P_SEOWON');
	this.petTypes.grabPets.push('COS_P_RACCOONDOG');
	this.petTypes.grabPets.push('COS_P_CAT');
	this.petTypes.grabPets.push('COS_P_BROWNIE');
	this.petTypes.grabPets.push('COS_P_PINKPIG');
	this.petTypes.grabPets.push('COS_P_GOLDPIG');
	this.petTypes.grabPets.push('COS_P_WINTER_SNOWMAN');

	//grab pet items
	this.petTypes.grabPetItems.push('ITEM_COS_P_SPOT_RABBIT_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_RABBIT_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_RABBIT_SCROLL_SILK');
	this.petTypes.grabPetItems.push('ITEM_COS_P_GGLIDER_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_MYOWON_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_SEOWON_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_RACCOONDOG_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_CAT_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_BROWNIE_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_PINKPIG_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_EVENT_COS_P_PINKPIG_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_GOLDPIG_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_GOLDPIG_SCROLL_SILK');
	this.petTypes.grabPetItems.push('ITEM_EVENT_COS_P_GOLDPIG_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_COS_P_WINTER_SNOWMAN_SCROLL');
	this.petTypes.grabPetItems.push('ITEM_EVENT_COS_P_WINTER_SNOWMAN_SCROLL');
}

