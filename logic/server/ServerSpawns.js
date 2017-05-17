var util = require('util');
var PacketWriter = require('../../packet/PacketWriter');
var functions = require('../../functions');

module.exports = {
    ServerSpawns: ServerSpawns
};

var $ServerSpawns = ServerSpawns.prototype;
$ServerSpawns.sendSpawns = ServerSpawns$sendSpawns;
$ServerSpawns._sendChars = ServerSpawns$_sendChars;
$ServerSpawns._sendGates = ServerSpawns$_sendGates;
$ServerSpawns._sendPets = ServerSpawns$_sendPets;
$ServerSpawns._sendNPCs = ServerSpawns$_sendNPCs;
$ServerSpawns._sendMonsters = ServerSpawns$_sendMonsters;
$ServerSpawns._sendOthers = ServerSpawns$_sendOthers;
$ServerSpawns._sendItems = ServerSpawns$_sendItems;


function ServerSpawns(bot) {
	this._bot = bot;
	this._maxSpawnsInPacket = 5;
}

function ServerSpawns$sendSpawns(client) {
	this._sendChars(client);
	this._sendGates(client);
	this._sendPets(client);
	this._sendNPCs(client);
	this._sendMonsters(client);
	this._sendOthers(client);
	this._sendItems(client);
}

function ServerSpawns$_sendChars(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.characters;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn;

		spawn = spawns[uniqueId];

		pData.writeDWord(spawn.model);
		pData.writeByte(spawn.volume);
		pData.writeByte(spawn.rank);
		pData.writeByte(spawn.icons);
		pData.writeByte(spawn.unknown1);
		pData.writeByte(spawn.maxSlots);
		pData.writeByte(spawn.itemCount);

		for (var itemId in spawn.items) {
			var item, itemData;
			item = spawn.items[itemId];
			pData.writeDWord(itemId);
			itemData = this._bot.gameData.items[itemId];
			if(itemData.type.startsWith('ITEM_CH') || itemData.type.startsWith('ITEM_EU') || itemData.type.startsWith('ITEM_FORT') || itemData.type.startsWith('ITEM_ROC_CH') || itemData.type.startsWith('ITEM_ROC_EU')) {
				pData.writeByte(item.plus);
			}

		};

		pData.writeByte(spawn.maxAvatarSlots);
		pData.writeByte(spawn.avatarCount);

		for (var avatarId in spawn.avatars) {
			var avatar;
			avatar = spawn.avatars[avatarId];
			pData.writeDWord(avatarId);
			pData.writeByte(avatar.plus);
		};

		pData.writeByte(spawn.mask);
		if(spawn.mask == 1) {
			var mask;
			pData.writeDWord(spawn.maskData.id);
			mask = this._bot.gameData.chars[spawn.maskData.id];
			if(mask.type.startsWith('CHAR')) {
				pData.writeByte(spawn.maskData.unknown1);
				pData.writeByte(spawn.maskData.count);
				for (var i = 0; i < spawn.maskData.count; i++) {
					pData.writeDWord(spawn.maskData.unknownData[i]);
				};
			}
		}

		pData.writeDWord(spawn.uniqueId);
		pData.writeByte(spawn.xSector);
		pData.writeByte(spawn.ySector);
		pData.writeFloat(spawn.xOffset);
		pData.writeFloat(spawn.zOffset);
		pData.writeFloat(spawn.yOffset);
		pData.writeWord(spawn.position);
		pData.writeByte(spawn.moving);
		pData.writeByte(spawn.running);
		if(spawn.moving == 1) {
			pData.writeByte(spawn.movingData.xSector);
			pData.writeByte(spawn.movingData.ySector);

			if(spawn.movingData.ySector == 0x80) {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.xOffset2);

				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.zOffset2);

				pData.writeWord(spawn.movingData.yOffset);
				pData.writeWord(spawn.movingData.yOffset2);
			} else {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.yOffset);
			}
		} else {
			pData.writeByte(spawn.movingData.noDestination);
			pData.writeWord(spawn.movingData.angle);
		}

		pData.writeByte(spawn.unknown2);
		pData.writeByte(spawn.alive);
		pData.writeByte(spawn.unknown3);
		pData.writeByte(spawn.unknown4);
		pData.writeDWord(spawn.walkingSpeed);
		pData.writeDWord(spawn.runningSpeed);
		pData.writeDWord(spawn.berserkerSpeed);

		pData.writeByte(spawn.activeSkillsCount);

		for (var skillId in spawn.activeSkills) {
			var skill, skillData;
			skill = spawn.activeSkills[skillId];
			skillData = this._bot.gameData.skills[skillId];
			pData.writeDWord(skillId);
			pData.writeDWord(skill.tempId);
			if(skillData.type.startsWith('SKILL_EU_CLERIC_RECOVERYA_GROUP') || skillData.type.startsWith('SKILL_EU_BARD_BATTLAA_GUARD') || skillData.type.startsWith('SKILL_EU_BARD_DANCEA') || skillData.type.startsWith('SKILL_EU_BARD_SPEEDUPA_HITRATE')) {
				pData.writeByte(skill.unknown1);
			}

		};

		pData.writeString(spawn.name);
		if(spawn.trade == 1) {
			pData.writeQWord(spawn.unknown6);
			pData.writeString(spawn.guildName);
		} else {
			pData.writeByte(spawn.jobType);
			pData.writeByte(spawn.jobLevel);
			pData.writeByte(spawn.pvpState);
			pData.writeByte(spawn.transport);
			pData.writeByte(spawn.unknown7);
			if(spawn.transport == 1){
				pData.writeDWord(spawn.transportId);
			}
			pData.writeByte(spawn.unknown8);
			pData.writeByte(spawn.stallFlag);

			pData.writeByte(spawn.unknown9);
			pData.writeString(spawn.guildName);
			pData.writeDWord(spawn.guildId);
			pData.writeString(spawn.grantName);
			pData.writeDWord(spawn.unknown10);
			pData.writeDWord(spawn.unknown11);
			pData.writeDWord(spawn.unknown12);
			pData.writeWord(spawn.unknown13);
			if(spawn.stallFlag == 4) {
				pData.writeString(spawn.stallName);
				pData.writeDWord(spawn.unknown14);
			}
			/*
			pData.writeByte(spawn.unknown8);
			pData.writeByte(spawn.unknown9);
			if(spawn.unknown9 == 1) {
				pData.writeDWord(spawn.unknown10);
			}
			pData.writeByte(spawn.jobType);
			pData.writeByte(spawn.stallFlag);
			pData.writeString(spawn.guildName);
			pData.writeDWord(spawn.guildId);
			pData.writeString(spawn.grantName);
			pData.writeDWord(spawn.unknown11);
			pData.writeDWord(spawn.unknown12);
			pData.writeDWord(spawn.unknown13);
			pData.writeWord(spawn.unknown14);
			if(spawn.stallFlag == 4) {
				pData.writeString(spawn.stallName);
				pData.writeDWord(spawn.unknown15);
			}
			*/
		}

		pData.writeWord(spawn.PKFlag);



		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 

function ServerSpawns$_sendGates(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.gates;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn;

		spawn = spawns[uniqueId];

		pData.writeDWord(spawn.model);
		pData.writeDWord(spawn.uniqueId);
		pData.writeByte(spawn.unknown1);
		pData.writeByte(spawn.unknown2);
		pData.writeFloat(spawn.unknown3);
		pData.writeFloat(spawn.unknown4);
		pData.writeFloat(spawn.unknown5);
		pData.writeWord(spawn.unknown6);
		pData.writeDWord(spawn.unknown7);
		pData.writeQWord(spawn.unknown8);

		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 

function ServerSpawns$_sendPets(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.pets;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn, petData, tempType;

		spawn = spawns[uniqueId];

		petData = this._bot.gameData.chars[spawn.model];

		pData.writeDWord(spawn.model);
		pData.writeDWord(spawn.uniqueId);
		pData.writeByte(spawn.xSector);
		pData.writeByte(spawn.ySector);
		pData.writeFloat(spawn.xOffset);
		pData.writeFloat(spawn.zOffset);
		pData.writeFloat(spawn.yOffset);
		pData.writeWord(spawn.position);
		pData.writeByte(spawn.moving);

		if(spawn.moving == 1) {
			pData.writeByte(spawn.movingData.xSector);
			pData.writeByte(spawn.movingData.ySector);

			if(spawn.movingData.ySector == 0x80) {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.xOffset2);

				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.zOffset2);

				pData.writeWord(spawn.movingData.yOffset);
				pData.writeWord(spawn.movingData.yOffset2);
			} else {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.yOffset);
			}
		} else {
			pData.writeByte(spawn.movingData.noDestination);
			pData.writeWord(spawn.movingData.angle);
		}

		pData.writeByte(spawn.unknown1);
		pData.writeByte(spawn.unknown2);
		pData.writeByte(spawn.unknown3);
		pData.writeByte(spawn.unknown4);
		pData.writeByte(spawn.unknown5);
		pData.writeFloat(spawn.unknown6);
		pData.writeFloat(spawn.speed);
		pData.writeFloat(spawn.unknown7);
		pData.writeWord(spawn.unknown8);

		tempType = petData.type;
		if(petData.type.startsWith('COS_P_BEAR') || petData.type.startsWith('COS_P_FOX') || petData.type.startsWith('COS_P_KANGAROO') || petData.type.startsWith('COS_P_PENGUIN') || petData.type.startsWith('COS_P_RAVEN') || petData.type.startsWith('COS_P_JINN') || petData.type.startsWith('COS_P_WOLF') || petData.type.startsWith('COS_P_WOLF_WHITE') || petData.type.startsWith('COS_P_WOLF_WHITE_SMALL')) {
			tempType = tempType.substring(0, tempType.length - 4)
		}
		if(tempType.startsWith('COS_C') || tempType.startsWith('COS_T_DHORSE')) {
			//Do nothing
		} else if(this._bot.gameData.petTypes.grabPets.indexOf(tempType) != -1) {
			pData.writeString(spawn.petName);
			pData.writeString(spawn.ownerName);
			pData.writeByte(spawn.unknown9);
			pData.writeDWord(spawn.ownerId);
		} else if(this._bot.gameData.petTypes.attackPets.indexOf(tempType) != -1) {
			pData.writeString(spawn.petName);
			pData.writeString(spawn.ownerName);
			pData.writeByte(spawn.unknown10);
			pData.writeByte(spawn.unknown11);
			pData.writeDWord(spawn.ownerId);

			if(spawn.b1 == 255 && spawn.b2 == 255 && spawn.b3 == 255 && spawn.b4 == 255) {
				pData.writeByte(spawn.b1);
				pData.writeByte(spawn.b2);
				pData.writeByte(spawn.b3);
				pData.writeByte(spawn.b4);
				pData.writeWord(spawn.unknown12);
			}
		} else if(tempType.contains('COS_T')) {
			pData.writeString(spawn.ownerName);
			pData.writeByte(spawn.unknown13);
			pData.writeByte(spawn.unknown14);
			pData.writeDWord(spawn.unknown15);
			pData.writeByte(spawn.unknown16);
		} else if (tempType.startsWith('TRADE_COS_QUEST_TRADE')) {
			pData.writeString(spawn.ownerName);
			pData.writeWord(spawn.unknown17);
			pData.writeDWord(spawn.unknown18);
		} else {
			pData.writeString(spawn.ownerName);
			pData.writeByte(spawn.unknown19);
			pData.writeByte(spawn.unknown20);
			pData.writeDWord(spawn.unknown21);
		}


		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 

function ServerSpawns$_sendNPCs(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.NPCs;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn;

		spawn = spawns[uniqueId];

		pData.writeDWord(spawn.model);
		pData.writeDWord(spawn.uniqueId);
		pData.writeByte(spawn.xSector);
		pData.writeByte(spawn.ySector);
		pData.writeFloat(spawn.xOffset);
		pData.writeFloat(spawn.zOffset);
		pData.writeFloat(spawn.yOffset);
		pData.writeWord(spawn.position);
		pData.writeByte(spawn.moving);
		pData.writeByte(spawn.running);
		if(spawn.moving == 1) {
			pData.writeByte(spawn.movingData.xSector);
			pData.writeByte(spawn.movingData.ySector);

			if(spawn.movingData.ySector == 0x80) {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.xOffset2);

				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.zOffset2);

				pData.writeWord(spawn.movingData.yOffset);
				pData.writeWord(spawn.movingData.yOffset2);
			} else {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.yOffset);
			}
		} else {
			pData.writeByte(spawn.movingData.noDestination);
			pData.writeWord(spawn.movingData.angle);
		}

		pData.writeByte(spawn.alive);
		pData.writeByte(spawn.unknown1);
		pData.writeByte(spawn.unknown2);
		pData.writeByte(spawn.unknown3);
		pData.writeDWord(spawn.walkingSpeed);
		pData.writeDWord(spawn.runningSpeed);
		pData.writeDWord(spawn.berserkerSpeed);
		pData.writeByte(spawn.unknown4);
		pData.writeByte(spawn.check);

		if(spawn.check != 0) {
			pData.writeByte(spawn.count);
			for (var i = 0; i < spawn.count; i++) {
				pData.writeByte(spawn.unknown5[i]);
			};
		}

		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 

function ServerSpawns$_sendMonsters(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.monsters;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn;

		spawn = spawns[uniqueId];

		pData.writeDWord(spawn.model);
		pData.writeDWord(spawn.uniqueId);
		

		pData.writeByte(spawn.xSector);
		pData.writeByte(spawn.ySector);
		pData.writeFloat(spawn.xOffset);
		pData.writeFloat(spawn.zOffset);
		pData.writeFloat(spawn.yOffset);
		pData.writeWord(spawn.position);
		pData.writeByte(spawn.moving);
		pData.writeByte(spawn.running);
		if(spawn.moving == 1) {
			pData.writeByte(spawn.movingData.xSector);
			pData.writeByte(spawn.movingData.ySector);

			if(spawn.movingData.ySector == 0x80) {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.xOffset2);

				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.zOffset2);

				pData.writeWord(spawn.movingData.yOffset);
				pData.writeWord(spawn.movingData.yOffset2);
			} else {
				pData.writeWord(spawn.movingData.xOffset);
				pData.writeWord(spawn.movingData.zOffset);
				pData.writeWord(spawn.movingData.yOffset);
			}
		} else {
			pData.writeByte(spawn.movingData.noDestination);
			pData.writeWord(spawn.movingData.angle);
		}

		pData.writeByte(spawn.alive);
		pData.writeByte(spawn.unknown1);
		pData.writeByte(spawn.unknown2);
		pData.writeByte(spawn.berserkerActive);
		pData.writeFloat(spawn.walkingSpeed);
		pData.writeFloat(spawn.runningSpeed);
		pData.writeFloat(spawn.berserkerSpeed);

		pData.writeByte(spawn.activeSkillsCount);

		for (var skillId in spawn.activeSkills) {
			var skill;
			skill = spawn.activeSkills[skillId];
			pData.writeDWord(skillId);
			pData.writeDWord(skill.unknown4);
		};

		pData.writeByte(spawn.unknown5);
		pData.writeByte(spawn.unknown6);
		pData.writeByte(spawn.unknown7);
		pData.writeByte(spawn.type);

		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 

function ServerSpawns$_sendOthers(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.others;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn, otherData;

		spawn = spawns[uniqueId];

		otherData = this._bot.gameData.chars[spawn.model];

		pData.writeDWord(spawn.model);
		pData.writeDWord(spawn.uniqueId);

		if(otherData.type == 'INS_QUEST_TELEPORT') {
			pData.writeByte(spawn.xSector);
			pData.writeByte(spawn.ySector);
			pData.writeFloat(spawn.xOffset);
			pData.writeFloat(spawn.zOffset);
			pData.writeFloat(spawn.yOffset);
			pData.writeWord(spawn.position);
			pData.writeByte(spawn.moving);
			pData.writeByte(spawn.running);
			pData.writeWord(spawn.unknown1);
			pData.writeString(spawn.unknown2);
			pData.writeDWord(spawn.unknown3);
		}


		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 

function ServerSpawns$_sendItems(client) {
	var spawns, spawnCount, currentPacketCount, sentPacketCount, pBegin, pData, Pend;

	spawns = this._bot.spawnManager.items;
	spawnCount = Object.keys(spawns).length;

	// Stop this function if there's no spawned objects
	if(!spawnCount) {
		return;
	}

	currentPacketCount = 0;
	sentPacketCount = 0;

	pData = new PacketWriter();
	pEnd = new PacketWriter();

	for (var uniqueId in spawns) {
		var spawn, itemData;

		spawn = spawns[uniqueId];

		itemData = this._bot.gameData.items[spawn.model];

		pData.writeDWord(spawn.model);

		if(itemData.type.startsWith('ITEM_ETC_GOLD')) {
			pData.writeDWord(spawn.amount);
		}

		if(itemData.type.startsWith('ITEM_QSP') || itemData.type.startsWith('ITEM_ETC_E090825') || itemData.type.startsWith('ITEM_QNO') || itemData.type.startsWith('ITEM_TRADE_SPECIAL_BOX')) {
			pData.writeString(spawn.name);
		}

		if(itemData.type.startsWith('ITEM_CH') || itemData.type.startsWith('ITEM_EU')) {
			pData.writeByte(spawn.plus);
		}

		pData.writeDWord(spawn.uniqueId);
		pData.writeByte(spawn.xSector);
		pData.writeByte(spawn.ySector);
		pData.writeFloat(spawn.xOffset);
		pData.writeFloat(spawn.zOffset);
		pData.writeFloat(spawn.yOffset);
		pData.writeWord(spawn.position);
		pData.writeByte(spawn.owned);
		if(spawn.owned == 1) {
			pData.writeDWord(spawn.ownerId);
		}
		pData.writeByte(spawn.itemBlued);

		//================= SEND STACKED PACKET =====================

		sentPacketCount += 1;
		currentPacketCount += 1;

		if(sentPacketCount % this._maxSpawnsInPacket == 0 || sentPacketCount >= spawnCount) {

			pBegin = new PacketWriter();
			pBegin.writeByte(1); //Spawn action.
			pBegin.writeWord(currentPacketCount);

			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
			this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

			pData = new PacketWriter();

			currentPacketCount = 0;
		}

	};

} 