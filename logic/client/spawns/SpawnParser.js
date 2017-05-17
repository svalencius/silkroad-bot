var util = require('util');
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    SpawnParser: SpawnParser
};

var $SpawnParser = SpawnParser.prototype;
$SpawnParser.parseChar = SpawnParser$parseChar;
$SpawnParser.parseGate = SpawnParser$parseGate;
$SpawnParser.parsePet = SpawnParser$parsePet;
$SpawnParser.parseNPC = SpawnParser$parseNPC;
$SpawnParser.parseMonster = SpawnParser$parseMonster;
$SpawnParser.parseOther = SpawnParser$parseOther;
$SpawnParser.parseItem = SpawnParser$parseItem;

function SpawnParser(bot) {
	this._bot = bot;
}

function SpawnParser$parseChar(packet, model) {
	var tempObj;
	tempObj = new Object();

	tempObj.model = model;
	tempObj.volume = packet.readByte();
	tempObj.rank = packet.readByte();
	tempObj.icons = packet.readByte();
	tempObj.unknown1 = packet.readByte();
	tempObj.maxSlots = packet.readByte();

	tempObj.trade = 0;
	tempObj.itemCount = packet.readByte();
	tempObj.items = new Object();
	for (var i = 0; i < tempObj.itemCount; i++) {
		var itemId, item;
		itemId = packet.readDWord();
		tempObj.items[itemId] = new Object();
		tempObj.items[itemId].id = itemId;
		item = this._bot.gameData.items[itemId];
		if(item.type.startsWith('ITEM_CH') || item.type.startsWith('ITEM_EU') || item.type.startsWith('ITEM_FORT') || item.type.startsWith('ITEM_ROC_CH') || item.type.startsWith('ITEM_ROC_EU')) {
			tempObj.items[itemId].plus = packet.readByte();
		}
		if(item.type.contains('_TRADE_TRADER_') || item.type.contains('_TRADE_HUNTER_') || item.type.contains('_TRADE_THIEF_') ) {
			tempObj.trade = 1;
		}
	};

	tempObj.maxAvatarSlots = packet.readByte();
	tempObj.avatarCount = packet.readByte();
	tempObj.avatars = new Object();
	for (var i = 0; i < tempObj.avatarCount; i++) {
		var avatarId, avatar;
		avatarId = packet.readDWord();
		tempObj.avatars[avatarId] = new Object();
		tempObj.avatars[avatarId].id = avatarId;
		tempObj.avatars[avatarId].plus = packet.readByte();
	}
	tempObj.mask = packet.readByte();
	tempObj.maskData = new Object();
	if(tempObj.mask == 1) {
		var maskId, mask;
		maskId = packet.readDWord();
		tempObj.maskData.id = maskId;
		mask = this._bot.gameData.chars[maskId];
		if(mask.type.startsWith('CHAR')) {
			tempObj.maskData.unknown1 = packet.readByte();
			tempObj.maskData.count = packet.readByte();
			tempObj.maskData.unknownData = [];
			for (var i = 0; i < tempObj.maskData.count; i++) {
				tempObj.maskData.unknownData.push(packet.readDWord());
			};
		}

	}

	tempObj.uniqueId = packet.readDWord();

	tempObj.xSector = packet.readByte();
	tempObj.ySector = packet.readByte();
	tempObj.xOffset = packet.readFloat();
	tempObj.zOffset = packet.readFloat();
	tempObj.yOffset = packet.readFloat();
	
	tempObj.position = packet.readWord();
	tempObj.moving = packet.readByte();
	tempObj.running = packet.readByte();

	tempObj.movingData = new Object();
	if(tempObj.moving == 1) {
		tempObj.movingData.xSector = packet.readByte();
		tempObj.movingData.ySector = packet.readByte();
		if(tempObj.movingData.ySector == 0x80) {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.xOffset2 = packet.readWord();

			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.zOffset2 = packet.readWord();

			tempObj.movingData.yOffset = packet.readWord();
			tempObj.movingData.yOffset2 = packet.readWord();
		} else {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.yOffset = packet.readWord();
		}
	} else {
		tempObj.movingData.noDestination = packet.readByte();
		tempObj.movingData.angle = packet.readWord();
	}

	tempObj.unknown2 = packet.readByte();
	tempObj.alive = packet.readByte();
	tempObj.unknown3 = packet.readByte();
	tempObj.unknown4 = packet.readByte();
	//tempObj.unknown5 = packet.readByte();

	tempObj.walkingSpeed = packet.readDWord();
	tempObj.runningSpeed = packet.readDWord();
	tempObj.berserkerSpeed = packet.readDWord();
	
	tempObj.activeSkillsCount = packet.readByte();
	tempObj.activeSkills = new Object();

	for (var i = 0; i < tempObj.activeSkillsCount; i++) {
		var skillId, skill;
		skillId = packet.readDWord();
		tempObj.activeSkills[skillId] = new Object();
		tempObj.activeSkills[skillId].id = skillId;
		skill = this._bot.gameData.skills[skillId];
		tempObj.activeSkills[skillId].tempId = packet.readDWord();
		if(skill.type.startsWith('SKILL_EU_CLERIC_RECOVERYA_GROUP') || skill.type.startsWith('SKILL_EU_BARD_BATTLAA_GUARD') || skill.type.startsWith('SKILL_EU_BARD_DANCEA') || skill.type.startsWith('SKILL_EU_BARD_SPEEDUPA_HITRATE')) {
			tempObj.activeSkills[skillId].unknown1 = packet.readByte();
		}
	};
	tempObj.name = packet.readString(true);
	if(tempObj.trade == 1) {
		tempObj.unknown6 = packet.readQWord();
		tempObj.guildName = packet.readString(true); //Guild name
	} else {
		tempObj.jobType = packet.readByte();
		tempObj.jobLevel = packet.readByte();
		tempObj.pvpState = packet.readByte();
		tempObj.transport = packet.readByte();
		tempObj.unknown7 = packet.readByte();
		if(tempObj.transport == 1) {
			tempObj.transportId = packet.readDWord();
		}
		tempObj.unknown8 = packet.readByte();
		tempObj.stallFlag = packet.readByte();

		tempObj.unknown9 = packet.readByte();
		tempObj.guildName = packet.readString(true);
		tempObj.guildId = packet.readDWord();
		tempObj.grantName = packet.readString(true);
		tempObj.unknown10 = packet.readDWord();
		tempObj.unknown11 = packet.readDWord();
		tempObj.unknown12 = packet.readDWord();
		tempObj.unknown13 = packet.readWord();
		if(tempObj.stallFlag == 4) {
			tempObj.stallName = packet.readString(true);
			tempObj.unknown14 = packet.readDWord();
		}
		/*
		tempObj.unknown8 = packet.readByte();
		tempObj.unknown9 = packet.readByte();
		if(tempObj.unknown9  == 1) {
			tempObj.unknown10 = packet.readDWord();
		}
		tempObj.jobType = packet.readByte();
		//tempObj.jobLevel = packet.readByte(); //Need more tests.
		tempObj.stallFlag = packet.readByte();
		tempObj.guildName = packet.readString(true);
		tempObj.guildId = packet.readDWord();
		tempObj.grantName = packet.readString(true);
		tempObj.unknown11 = packet.readDWord();
		tempObj.unknown12 = packet.readDWord();
		tempObj.unknown13 = packet.readDWord();
		tempObj.unknown14 = packet.readWord();
		if(tempObj.stallFlag == 4) {
			tempObj.stallName = packet.readString(true);
			tempObj.unknown15 = packet.readDWord();
		}
		*/
		
	}
	tempObj.PKFlag = packet.readWord(); // PK Flag (0xFF); 

	this._bot.spawnManager.characters[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn character: ' + tempObj.name);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');
}

function SpawnParser$parseGate(packet, model) {
	var tempPortal;
	tempObj = new Object();

	tempObj.model = model;
	tempObj.uniqueId = packet.readDWord();
	tempObj.unknown1 = packet.readByte();
	tempObj.unknown2 = packet.readByte();
	tempObj.unknown3 = packet.readFloat();
	tempObj.unknown4 = packet.readFloat();
	tempObj.unknown5 = packet.readFloat();
	tempObj.unknown6 = packet.readWord();
	tempObj.unknown7 = packet.readDWord();
	tempObj.unknown8 = packet.readQWord();
	this._bot.spawnManager.gates[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn portal:' + tempObj.model);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');
}

function SpawnParser$parsePet(packet, model) {
	var tempObj, pet, tempType;
	tempObj = new Object();

	tempObj.model = model;
	pet = this._bot.gameData.chars[model];
	tempObj.uniqueId = packet.readDWord();
	tempObj.xSector = packet.readByte();
	tempObj.ySector = packet.readByte();
	tempObj.xOffset = packet.readFloat();
	tempObj.zOffset = packet.readFloat();
	tempObj.yOffset = packet.readFloat();
	tempObj.position = packet.readWord();
	tempObj.moving = packet.readByte();

	tempObj.movingData = new Object();
	if(tempObj.moving == 1) {
		tempObj.movingData.xSector = packet.readByte();
		tempObj.movingData.ySector = packet.readByte();
		if(tempObj.movingData.ySector == 0x80) {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.xOffset2 = packet.readWord();

			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.zOffset2 = packet.readWord();

			tempObj.movingData.yOffset = packet.readWord();
			tempObj.movingData.yOffset2 = packet.readWord();
		} else {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.yOffset = packet.readWord();
		}
	} else {
		tempObj.movingData.noDestination = packet.readByte();
		tempObj.movingData.angle = packet.readWord();
	}

	tempObj.unknown1 = packet.readByte();
	tempObj.unknown2 = packet.readByte();
	tempObj.unknown3 = packet.readByte();
	tempObj.unknown4 = packet.readByte();
	tempObj.unknown5 = packet.readByte();
	tempObj.unknown6 = packet.readFloat();
	tempObj.speed = packet.readFloat();
	tempObj.unknown7 = packet.readFloat();
	tempObj.unknown8 = packet.readWord();
	tempType = pet.type;
	if(pet.type.startsWith('COS_P_BEAR') || pet.type.startsWith('COS_P_FOX') || pet.type.startsWith('COS_P_KANGAROO') || pet.type.startsWith('COS_P_PENGUIN') || pet.type.startsWith('COS_P_RAVEN') || pet.type.startsWith('COS_P_JINN') || pet.type.startsWith('COS_P_WOLF') || pet.type.startsWith('COS_P_WOLF_WHITE') || pet.type.startsWith('COS_P_WOLF_WHITE_SMALL')) {
		tempType = tempType.substring(0, tempType.length - 4)
	}
	if(tempType.startsWith('COS_C') || tempType.startsWith('COS_T_DHORSE')) {
		//Do nothing
	} else if(this._bot.gameData.petTypes.grabPets.indexOf(tempType) != -1) {
		tempObj.petName = packet.readString(true);
		tempObj.ownerName = packet.readString(true);
		tempObj.unknown9 = packet.readByte();
		tempObj.ownerId = packet.readDWord();
	} else if(this._bot.gameData.petTypes.attackPets.indexOf(tempType) != -1) {
		tempObj.petName = packet.readString(true);
		tempObj.ownerName = packet.readString(true);
		tempObj.unknown10 = packet.readByte();
		tempObj.unknown11 = packet.readByte();
		tempObj.ownerId = packet.readDWord();
		try {
			var b1, b2, b3, b4;
			tempObj.b1 = b1 = packet.readByte();
			tempObj.b2 = b2 = packet.readByte();
			tempObj.b3 = b3 = packet.readByte();
			tempObj.b4 = b4 = packet.readByte();

			if(b1 == 255 && b2 == 255 && b3 == 255 && b4 == 255) {
				tempObj.unknown12 = packet.readWord();
			} else {
				packet.pointer -= 4;
			}

		}catch (err) {}



	} else if(tempType.contains('COS_T')) {
		tempObj.ownerName = packet.readString(true);
		tempObj.unknown13 = packet.readByte();
		tempObj.unknown14 = packet.readByte();
		tempObj.unknown15 = packet.readDWord();
		tempObj.unknown16 = packet.readByte();
	} else if (tempType.startsWith('TRADE_COS_QUEST_TRADE')) {
		tempObj.ownerName = packet.readString(true);
		tempObj.unknown17 = packet.readWord();
		tempObj.unknown18 = packet.readDWord();
	} else {
		tempObj.ownerName = packet.readString(true);
		tempObj.unknown19 = packet.readByte();
		tempObj.unknown20 = packet.readByte();
		tempObj.unknown21 = packet.readDWord();
	}
	this._bot.spawnManager.pets[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn pet: ' + pet.type);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');
	//console.log(tempObj);
}

function SpawnParser$parseNPC(packet, model) {
	var tempObj, NPC;
	tempObj = new Object();

	tempObj.model = model;
	NPC = this._bot.gameData.chars[model];
	tempObj.uniqueId = packet.readDWord();
	tempObj.xSector = packet.readByte();
	tempObj.ySector = packet.readByte();
	tempObj.xOffset = packet.readFloat();
	tempObj.zOffset = packet.readFloat();
	tempObj.yOffset = packet.readFloat();
	tempObj.position = packet.readWord();
	tempObj.moving = packet.readByte();
	tempObj.running = packet.readByte();

	tempObj.movingData = new Object();
	if(tempObj.moving == 1) {
		tempObj.movingData.xSector = packet.readByte();
		tempObj.movingData.ySector = packet.readByte();
		if(tempObj.movingData.ySector == 0x80) {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.xOffset2 = packet.readWord();

			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.zOffset2 = packet.readWord();

			tempObj.movingData.yOffset = packet.readWord();
			tempObj.movingData.yOffset2 = packet.readWord();
		} else {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.yOffset = packet.readWord();
		}
	} else {
		tempObj.movingData.noDestination = packet.readByte();
		tempObj.movingData.angle = packet.readWord();
	}

	tempObj.alive = packet.readByte();
	tempObj.unknown1 = packet.readByte();
	tempObj.unknown2 = packet.readByte();
	tempObj.unknown3 = packet.readByte();
	//tempObj.berserkerActive = packet.readByte();
	tempObj.walkingSpeed = packet.readDWord();
	tempObj.runningSpeed = packet.readDWord();
	tempObj.berserkerSpeed = packet.readDWord();

	tempObj.unknown4 = packet.readByte();

	tempObj.check = packet.readByte();
	if(tempObj.check != 0) {
		tempObj.count = packet.readByte();
		tempObj.unknown5 = [];
		for (var i = 0; i < tempObj.count; i++) {
			tempObj.unknown5.push(packet.readByte());
		};
	}
	this._bot.spawnManager.NPCs[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn NPC: ' + NPC.type);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');
}

function SpawnParser$parseMonster(packet, model) {
	var tempObj, monster;
	tempObj = new Object();

	tempObj.model = model;
	monster = this._bot.gameData.chars[model];
	tempObj.uniqueId = packet.readDWord();
	tempObj.xSector = packet.readByte();
	tempObj.ySector = packet.readByte();
	tempObj.xOffset = packet.readFloat();
	tempObj.zOffset = packet.readFloat();
	tempObj.yOffset = packet.readFloat();
	tempObj.position = packet.readWord();
	tempObj.moving = packet.readByte();
	tempObj.running = packet.readByte();

	tempObj.movingData = new Object();
	if(tempObj.moving == 1) {
		tempObj.movingData.xSector = packet.readByte();
		tempObj.movingData.ySector = packet.readByte();
		if(tempObj.movingData.ySector == 0x80) {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.xOffset2 = packet.readWord();

			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.zOffset2 = packet.readWord();

			tempObj.movingData.yOffset = packet.readWord();
			tempObj.movingData.yOffset2 = packet.readWord();
		} else {
			tempObj.movingData.xOffset = packet.readWord();
			tempObj.movingData.zOffset = packet.readWord();
			tempObj.movingData.yOffset = packet.readWord();
		}
	} else {
		tempObj.movingData.noDestination = packet.readByte();
		tempObj.movingData.angle = packet.readWord();
	}

	tempObj.alive = packet.readByte();
	tempObj.unknown1 = packet.readByte();
	tempObj.unknown2 = packet.readByte();
	//tempObj.unknown3 = packet.readByte(); //Deprecated by vsro client. No idea about isro.
	tempObj.berserkerActive = packet.readByte();
	tempObj.walkingSpeed = packet.readFloat();
	tempObj.runningSpeed = packet.readFloat();
	tempObj.berserkerSpeed = packet.readFloat();

	tempObj.activeSkillsCount = packet.readByte();
	tempObj.activeSkills = new Object();
	for (var i = 0; i < tempObj.activeSkillsCount; i++) {
		var skillId;
		skillId = packet.readDWord();
		tempObj.activeSkills[skillId] = new Object();
		tempObj.activeSkills[skillId].id = skillId;
		tempObj.activeSkills[skillId].unknown4 = packet.readDWord();
	};

	tempObj.unknown5 = packet.readByte();
	tempObj.unknown6 = packet.readByte();
	tempObj.unknown7 = packet.readByte();
	tempObj.type = packet.readByte();

	this._bot.spawnManager.monsters[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn monster: ' + monster.type);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');
}

function SpawnParser$parseOther(packet, model) {
	var tempObj, other;
	tempObj = new Object();

	tempObj.model = model;
	other = this._bot.gameData.chars[model];
	tempObj.uniqueId = packet.readDWord();
	if(other.type == 'INS_QUEST_TELEPORT') {
		tempObj.xSector = packet.readByte();
		tempObj.ySector = packet.readByte();
		tempObj.xOffset = packet.readFloat();
		tempObj.zOffset = packet.readFloat();
		tempObj.yOffset = packet.readFloat();
		tempObj.position = packet.readWord();
		tempObj.moving = packet.readByte();
		tempObj.running = packet.readByte();
		tempObj.unknown1 = packet.readWord();
		tempObj.unknown2 = packet.readString(true);
		tempObj.unknown3 = packet.readDWord();
	}
	this._bot.spawnManager.others[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn other: ' + other.type);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');
}

function SpawnParser$parseItem(packet, model) {
	var tempObj, item;
	tempObj = new Object();

	tempObj.model = model;
	item = this._bot.gameData.items[model];
	if(item.type.startsWith('ITEM_ETC_GOLD')) {
		tempObj.amount = packet.readDWord();
	}

	if(item.type.startsWith('ITEM_QSP') || item.type.startsWith('ITEM_ETC_E090825') || item.type.startsWith('ITEM_QNO') || item.type.startsWith('ITEM_TRADE_SPECIAL_BOX')) {
		tempObj.name = packet.readString(true);
	}

	if(item.type.startsWith('ITEM_CH') || item.type.startsWith('ITEM_EU')) {
		tempObj.plus = packet.readByte();
	}

	tempObj.uniqueId = packet.readDWord();
	tempObj.xSector = packet.readByte();
	tempObj.ySector = packet.readByte();
	tempObj.xOffset = packet.readFloat();
	tempObj.zOffset = packet.readFloat();
	tempObj.yOffset = packet.readFloat();
	tempObj.position = packet.readWord();
	tempObj.owned = packet.readByte();
	if(tempObj.owned == 1) {
		tempObj.ownerId = packet.readDWord();
	}
	tempObj.itemBlued = packet.readByte();

	this._bot.spawnManager.items[tempObj.uniqueId] = tempObj;
	console.log('=================================');
	console.log('Spawn item: ' + item.type);
	console.log('Unique ID: ' + tempObj.uniqueId + ' Model: ' + tempObj.model);
	console.log('=================================');

}