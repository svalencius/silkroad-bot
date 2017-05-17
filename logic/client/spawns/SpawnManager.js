var util = require('util');
var fs = require('fs');
var hexdump = require('hexdump-nodejs');
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    SpawnManager: SpawnManager
};

var $SpawnManager = SpawnManager.prototype;
$SpawnManager.parseGroupSpawn = SpawnManager$parseGroupSpawn;
$SpawnManager.spawn = SpawnManager$spawn;
$SpawnManager.despawn = SpawnManager$despawn;

function SpawnManager(bot) {
	this._bot = bot;
	this.characters = new Object();
	this.gates = new Object();
	this.pets = new Object();
	this.NPCs = new Object();
	this.monsters = new Object();
	this.others = new Object();
	this.items = new Object();
}

function SpawnManager$parseGroupSpawn(packet, action, count) {
	//var action, count;
	//
	//count = 1;
	//action = 1;
	//if(packet.opcode == this._bot.opcodes.SERVER.GROUPSPAWN_DATA) {
	//	action = this._bot.groupSpawn.action;
	//	count = this._bot.groupSpawn.count;
	//}

	if(action == 1) {
		for (var i = 0; i < count; i++) {
			this.spawn(packet);
		};
	} else {
		for (var i = 0; i < count; i++) {
			this.despawn(packet);
		};
	}

}

function SpawnManager$spawn(packet) {
	//try {

		var model, charData, itemData;

		model = packet.readDWord();
		charData = this._bot.gameData.chars[model];
		gateData = this._bot.gameData.gates[model];
		itemData = this._bot.gameData.items[model];

		if(charData !== undefined) {
			var type;
			type = charData.type;
			if(type.contains('CHAR_')) {
				this._bot.spawnParser.parseChar(packet, model);
			} 
			//else if(type.contains('_GATE')) {
			//	this._bot.spawnParser.parseGate(packet, model);
			//} 
			else if(type.contains('COS_')) {
				this._bot.spawnParser.parsePet(packet, model);
			} 
			else if(type.contains('NPC_')) {
				this._bot.spawnParser.parseNPC(packet, model);
			}
			else if(type.contains('MOB_')) {
				this._bot.spawnParser.parseMonster(packet, model);
			} 
			else {
				this._bot.spawnParser.parseOther(packet, model);
			}
		} else if (gateData !== undefined) {
			this._bot.spawnParser.parseGate(packet, model);
		} else if (itemData !== undefined) {
			this._bot.spawnParser.parseItem(packet, model);
		} else {
			console.log('Unknown item in SpawnManager$spawn. (model: ' + model + ')');
			//console.log(packet.buffer);
			fs.writeFile('log/packet-' + model + '-' + process.hrtime() + '.txt', hexdump(packet.buffer));
		}

		console.log('Characters: ', Object.keys(this.characters).length);
		console.log('Gates: ', Object.keys(this.gates).length);
		console.log('Monsters: ', Object.keys(this.monsters).length);
		console.log('Pets: ', Object.keys(this.pets).length);
		console.log('NPCs: ', Object.keys(this.NPCs).length);
		console.log('Other: ', Object.keys(this.others).length);
		console.log('Items: ', Object.keys(this.items).length);
	//} catch(error) {
	//	console.log('SpawnManager Spawn parse error occured.', error, packet);
	//}
}

function SpawnManager$despawn(packet) {
	var id;
	id = packet.readDWord(); 
	if(this.characters[id] !== undefined) {
		delete this.characters[id];
	} else if(this.gates[id] !== undefined) {
		delete this.gates[id];
	} else if(this.pets[id] !== undefined) {
		delete this.pets[id];
	} else if(this.NPCs[id] !== undefined) {
		delete this.NPCs[id];
	} else if(this.monsters[id] !== undefined) {
		delete this.monsters[id];
	} else if(this.others[id] !== undefined) {
		delete this.others[id];
	} else if(this.items[id] !== undefined) {
		delete this.items[id];
	}

	console.log('Characters: ', Object.keys(this.characters).length);
	console.log('Gates: ', Object.keys(this.gates).length);
	console.log('Monsters: ', Object.keys(this.monsters).length);
	console.log('Pets: ', Object.keys(this.pets).length);
	console.log('NPCs: ', Object.keys(this.NPCs).length);
	console.log('Other: ', Object.keys(this.others).length);
	console.log('Items: ', Object.keys(this.items).length);
}