var util = require('util');
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    InventoryParser: InventoryParser
};

var $InventoryParser = InventoryParser.prototype;
$InventoryParser.parse = InventoryParser$parse;

function InventoryParser(bot) {
	this._bot = bot;
}

function InventoryParser$parse() {
	var tempItem, item, itemId, itemType, itemName;

	tempItem = {
		model: 			null,
		type: 			null,
		name: 			null,
		plus: 			null,
		durability: 	null,
		amount: 		null,
		modelLevel: 	null,
		modelName: 		null,
		model2: 		null,
	};

	this._bot.charData.charDataPacket.readDWord(); //unknown
	itemId = this._bot.charData.charDataPacket.readDWord();
	item = this._bot.gameData.items[itemId];
	itemType = item.type || undefined;
	itemName = item.name || undefined;

	tempItem.model = itemId;
	tempItem.type = itemType;
	tempItem.name = itemName;
	if(			itemType.startsWith('ITEM_CH') || 
				itemType.startsWith('ITEM_EU') || 
				itemType.startsWith('ITEM_MALL_AVATAR') || 
				itemType.startsWith('ITEM_ETC_E060529_GOLDDRAGONFLAG') || 
				itemType.startsWith('ITEM_EVENT_CH') || 
				itemType.startsWith('ITEM_EVENT_EU') || 
				itemType.startsWith('ITEM_EVENT_AVATAR_W_NASRUN') ||
				itemType.startsWith('ITEM_EVENT_AVATAR_M_NASRUN') || 
				itemType.startsWith('ITEM_EVENT_E081126_SILKROAD_PLAG')) {

		var itemPlus, durability, blueAmount;

		itemPlus = this._bot.charData.charDataPacket.readByte();
		this._bot.charData.charDataPacket.readQWord();
		durability = this._bot.charData.charDataPacket.readDWord();
		blueAmount = this._bot.charData.charDataPacket.readByte();
		for (var i = 0; i < blueAmount; i++) {
			this._bot.charData.charDataPacket.readDWord();
			this._bot.charData.charDataPacket.readDWord();
		};

		this._bot.charData.charDataPacket.readWord();
		this._bot.charData.charDataPacket.readWord();
		//this._bot.charData.charDataPacket.readWord();
		
		tempItem.plus = itemPlus;
		tempItem.durability = durability;
		tempItem.amount = 1;

	} else if(		(itemType.startsWith("ITEM_COS") && itemType.contains("SILK")) || 
					(itemType.startsWith("ITEM_EVENT_COS") && !itemType.contains("_C_"))) {

		var flag;

		flag = this._bot.charData.charDataPacket.readByte();
		if(flag == 2 || flag == 3 || flag == 4) { // 0x03 Alive - 0x04 Dead -  0x02 Summoned
			tempItem.modelLevel = this._bot.charData.charDataPacket.readDWord();
			tempItem.modelName = this._bot.charData.charDataPacket.readString(true);
			this._bot.charData.charDataPacket.readByte();
			if(this._bot.gameData.types.attackPetItems.indexOf(itemType) == -1){
				this._bot.charData.charDataPacket.readDWord();
			}
		}

		tempItem.plus = 0;
		tempItem.durability = 0;
		tempItem.amount = 1;

	} else if(this._bot.gameData.petTypes.grabPetItems.indexOf(itemName) != -1 || this._bot.gameData.petTypes.attackPetItems.indexOf(itemName) != -1) {
		var flag;

		flag = this._bot.charData.charDataPacket.readByte();

		if(flag == 2 || flag == 3 || flag == 4) { // 0x03 Alive - 0x04 Dead -  0x02 Summoned
			tempItem.model2 = this._bot.charData.charDataPacket.readDWord();
			tempItem.modelName = this._bot.charData.charDataPacket.readString(true);
			if(this._bot.gameData.types.attackPetItems.indexOf(itemType) == -1){
				this._bot.charData.charDataPacket.readDWord();
			}
			this._bot.charData.charDataPacket.readByte();
		}

		tempItem.plus = 0;
		tempItem.durability = 0;
		tempItem.amount = 1;

	} else if(itemType == 'ITEM_ETC_TRANS_MONSTER') {
		this._bot.charData.charDataPacket.readDWord();
		tempItem.plus = 0;
		tempItem.durability = 0;
		tempItem.amount = 1;

	} else if(itemType.startsWith('ITEM_MALL_MAGIC_CUBE')) {
		this._bot.charData.charDataPacket.readDWord();
		tempItem.plus = 0;
		tempItem.durability = 0;
		tempItem.amount = 1;

	} else {
		var count;
		count = this._bot.charData.charDataPacket.readWord();
		if(itemType.contains('ITEM_ETC_ARCHEMY_ATTRSTONE') || itemType.contains('ITEM_ETC_ARCHEMY_MAGICSTONE')) {
			this._bot.charData.charDataPacket.readByte();
		}

		tempItem.plus = 0;
		tempItem.durability = 0;
		tempItem.amount = count;

	}
	return tempItem;
}