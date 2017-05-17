var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    CharData: CharData
};

util.inherits(CharData, EventEmitter);

var $CharData = CharData.prototype;
$CharData.begin = CharData$begin;
$CharData.data = CharData$data;
$CharData.end = CharData$end;
$CharData.id = CharData$id;
$CharData.parse = CharData$parse;
$CharData.confirmSpawn = CharData$confirmSpawn;

function CharData(bot) {
    EventEmitter.call(this);

    this._bot = bot;

    this.charDataBeginPacket = null;
    this.charDataPacket = null;
    this.charDataEndPacket = null;
    this.charDataIdPacket = null;
    
    this.character = {
    	skipId: 		[],

    	uniqueId: 		null,
    	accountId: 		null,
    	race: 			null,
    	level: 			null,
    	maxLevel: 		null,
    	exp: 			null,
    	maxExp: 		null,
    	gold: 			null,
    	skillPoints: 	null,
    	statPoints: 	null,
    	zerk: 			null,

    	currentHP: 		null,
    	currentMP: 		null,
    	maxHP: 			null,
    	maxMP: 			null,

    	items: 			new Object(),
    	avatars: 		new Object(),
    	skills: 		new Object(),

    	speed: 			null,
    	name: 			null,
    	alias: 			null,

    	x: 				null,
    	y: 				null,
    	inCave: 		null,
    	moving: 		null,
    }

    this.firstTime = true;
}

function CharData$begin(packet) {
	this.charDataBeginPacket = packet;
}

function CharData$data(packet) {
	this.charDataPacket = packet;
}

function CharData$end(packet) {
	this.charDataEndPacket = packet;
}

function CharData$id(packet) {
	this.charDataIdPacket = packet;

	this.character.skipId[0] = packet.readByte();
	this.character.skipId[1] = packet.readByte();
	this.character.skipId[2] = packet.readByte();
	this.character.skipId[3] = packet.readByte();
	this.parse();

	//Check if someone is waiting for chardata and stuff to load into game because we have it already in bot client
	this._bot.serverLogic.checkForClientsInCharSelection();
}

function CharData$parse() {
	var model, itemCount, slot;

	//try {

		//Main
		this.charDataPacket.readDWord();
		model = this.charDataPacket.readDWord(); //model
		if(model >= 1703 && model <= 1932){
			this.character.race = "CH";
		} else {
			this.character.race = "EU";
		}

		this.charDataPacket.readByte(); // volume and height
		this.character.level = 			this.charDataPacket.readByte();
		this.character.maxLevel = 		this.charDataPacket.readByte();
		this.character.exp = 			this.charDataPacket.readQWord();
		this.charDataPacket.readWord(); //SP Bar
		this.charDataPacket.readWord(); //Unknown
		this.character.gold = 			this.charDataPacket.readQWord();
		this.character.skillPoints = 	this.charDataPacket.readDWord();
		this.character.statPoints = 	this.charDataPacket.readWord();
		this.character.zerk = 			this.charDataPacket.readByte();
		this.charDataPacket.readDWord(); //Unknown
		this.character.currentHP = 		this.charDataPacket.readDWord();
		this.character.currentMP = 		this.charDataPacket.readDWord();
		this.charDataPacket.readByte(); //Unknown
		this.charDataPacket.readByte(); //Unknown
		this.charDataPacket.readQWord(); //Unknown

		//Items
		this.charDataPacket.readByte(); //max inventory slots
		itemCount = this.charDataPacket.readByte();
		for (var i = 0; i < itemCount; i++) {
			slot = this.charDataPacket.readByte();
			this.character.items[slot] = this._bot.inventoryParser.parse();
		};
		                            
		//Avatars
		this.charDataPacket.readByte(); // max avatars
		var avaCount;
		avaCount = this.charDataPacket.readByte();
		for (var i = 0; i < avaCount; i++) {
			var avaSlot, avaId, ava, avaType, avaPlus, avaBlueAmount;

			avaSlot = this.charDataPacket.readByte();
			this.charDataPacket.readDWord();
			avaId = this.charDataPacket.readDWord();

			ava = this._bot.gameData.items[avaId];
			avaType = ava.type || undefined;
			avaPlus = this.charDataPacket.readByte();
			this.charDataPacket.readQWord();
			this.charDataPacket.readDWord();
			avaBlueAmount = this.charDataPacket.readByte();
			for (var j = 0; j < avaBlueAmount; j++) {
				this.charDataPacket.readDWord();
				this.charDataPacket.readDWord();
			};
			this.charDataPacket.readWord();
			this.charDataPacket.readWord();

			this.character.avatars[avaSlot] = {
				model: avaId,
				type: avaType,
				name: ava.name || undefined,
				plus: avaPlus,

			}

		};

		this.charDataPacket.readByte(); //unknown

		//Mastery
		var masteryFlag;
		masteryFlag = this.charDataPacket.readByte(); //mastery start
		while(masteryFlag == 1) {
			this.charDataPacket.readDWord(); //Mastery ID
			this.charDataPacket.readByte(); //Master Lv
			masteryFlag = this.charDataPacket.readByte(); //new mastery start/end
		};

		this.charDataPacket.readByte(); //unknown

		//Skills
		var skillFlag;
		skillFlag = this.charDataPacket.readByte(); //skill start
		while(skillFlag == 1) {
			var skillId, skill;
			skillId = this.charDataPacket.readDWord(); //Skill ID

			skill = this._bot.gameData.skills[skillId];

			this.charDataPacket.readByte();
			skillFlag = this.charDataPacket.readByte(); ///new skill start/end

			this.character.skills[skillId] = skill;

		};

		//Skip quests
		var temp;
		temp = [];
		while(true) {
			temp[0] = temp[1];
			temp[1] = temp[2];
			temp[2] = temp[3];
			temp[3] = this.charDataPacket.readByte();
			if((temp[0] == this.character.skipId[0]) && (temp[1] == this.character.skipId[1]) && (temp[2] == this.character.skipId[2]) && (temp[3] == this.character.skipId[3])) {
				this.charDataPacket.pointer -= 4;
				break;
			}
		}

		//Unique ID
		this.character.uniqueId = this.charDataPacket.readDWord();

		//Coordinates
		var xSector, ySector, xOffset, zOffset, yOffset;
		xSector = this.charDataPacket.readByte();
		ySector = this.charDataPacket.readByte();
		if(ySector == 0x80) {
			this.character.inCave = true;
		} else {
			this.character.inCave = false;
		}

		xOffset = this.charDataPacket.readFloat();
		zOffset = this.charDataPacket.readFloat();
		yOffset = this.charDataPacket.readFloat();

		this.character.x = functions.calculateX(xSector, xOffset);
		this.character.y = functions.calculateY(ySector, yOffset);

		this.charDataPacket.readWord(); //position
		this.character.moving = this.charDataPacket.readByte();
		this.charDataPacket.readByte(); // Running
		this.charDataPacket.readByte();
		this.charDataPacket.readWord();

		//
		this.charDataPacket.readByte();
		this.charDataPacket.readByte();
		this.charDataPacket.readByte(); //Deathflag
		this.charDataPacket.readByte(); //Movement flag
		this.charDataPacket.readByte(); //Berserker flag

		//Speed
		this.charDataPacket.readDWord(); //Walking speed
		this.character.speed = this.charDataPacket.readFloat(); //Running speed
		this.charDataPacket.readDWord(); //Berserker speed

		//Name & Alias
		this.character.name = this.charDataPacket.readString(true); //Player name
		this.character.alias = this.charDataPacket.readString(true); //Player alias


		//Job
		this.charDataPacket.readByte(); //Job level
		this.charDataPacket.readByte(); //Job type
		this.charDataPacket.readDWord(); //Trader exp
		this.charDataPacket.readDWord(); //Thief exp
		this.charDataPacket.readDWord(); //Hunter exp
		this.charDataPacket.readByte(); //Trader level
		this.charDataPacket.readByte(); //Thief level
		this.charDataPacket.readByte(); //Hunter level

		//Something
		this.charDataPacket.readByte(); //PK Flag
		this.charDataPacket.readWord(); //Unknown
		this.charDataPacket.readDWord(); //Unknown
		this.charDataPacket.readByte(); //Unknown

		this.character.accountId = this.charDataPacket.readDWord(); //Account ID

		this.confirmSpawn();

		this.emit('charData', this.character);

	//} catch(error) {
	//	console.log('CharData parse error occured.', error, this.charDataPacket);
	//}

}

function CharData$confirmSpawn() {
	if(this._bot.globals.firstSpawnAccepted) {
		this._bot.client.send(this._bot.opcodes.CLIENT.CONFIRM_SPAWN, new PacketWriter(), false);
	} else {
		this._bot.globals.firstSpawnAccepted = true;
	}
}