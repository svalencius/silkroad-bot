var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PacketWriter = require('../../../packet/PacketWriter');

module.exports = {
    CharList: CharList
};

util.inherits(CharList, EventEmitter);

var $CharList = CharList.prototype;
$CharList.requestCharList = CharList$requestCharList;
$CharList.analyze = CharList$analyze;
$CharList.selectCharacter = CharList$selectCharacter;
$CharList.characterSelected = CharList$characterSelected;
$CharList.confirmSpawn = CharList$confirmSpawn;

function CharList(bot) {
    EventEmitter.call(this);

    this._bot = bot;
    this.charList = new Object;
    this.charListPacket = null;

}

function CharList$requestCharList() {
	var p = new PacketWriter();
    p.writeByte(2);
    this._bot.client.send(this._bot.opcodes.CLIENT.CHARACTER_LIST, p, false);
}

function CharList$analyze(packet) {
	this.charListPacket = packet;
	var charCount, charInfo;

	this.charList = new Object;
	if(packet.readByte() == 2) {
		if(packet.readByte() == 1) {
			charCount = packet.readByte();
			for (var i = 0; i < charCount; i++) {

				//Main data
				charInfo = {
					model: 			packet.readDWord(),
					name: 			packet.readString(true),
					volume: 		packet.readByte(),
					level: 			packet.readByte(),
					exp: 			packet.readQWord(),
					str: 			packet.readWord(),
					int: 			packet.readWord(),
					statPoints: 	packet.readWord(),
					hp: 			packet.readDWord(),
					mp: 			packet.readDWord(),
				};


				// Deletion
				if(packet.readByte() == 1) { //If character is deleted
					packet.readDWord();
					charInfo.deleted = true;
				} else {
					charInfo.deleted = false;
				}

				packet.readByte(); // Unknown
				packet.readByte(); // Unknown
				packet.readByte(); // Unknown

				//Items
				for (var i = 0; i < packet.readByte(); i++) {
					packet.readDWord();
					packet.readByte();
				};

				//Avatars
				for (var i = 0; i < packet.readByte(); i++) {
					packet.readDWord();
					packet.readByte();
				};

				this.charList[charInfo.name] = charInfo;

			};
		}
	}

	this.emit('charList', this.charList);
}

function CharList$selectCharacter(charName) {

	if(this._bot.globals.clientState == this._bot.enums.clientState.WAITING_CHAR_SELECTION) {
		if(this.charList[charName]){
			//Save character to settings
			this._bot.settings.charName = charName;
			var p = new PacketWriter();
	   		p.writeString(charName);
	    	this._bot.client.send(this._bot.opcodes.CLIENT.CHARACTER_SELECT, p, false);
	    } else {
	    	this.emit('charListError', 'Cannot select character because given character name is not exist ('+ charName +')');
	    }
	} else {
		this.emit('charListError', 'Cannot select character because client state is not WAITING_CHAR_SELECTION ('+ this._bot.globals.clientState +')');
	}
}

function CharList$characterSelected(packet) {
	if(packet.readByte() == 1) {
		//Confirm spawn
    	this.confirmSpawn();
		//Character selected. Bot in game.
		this.emit('characterSelected');
	}
}

function CharList$confirmSpawn(){
	this._bot.client.send(this._bot.opcodes.CLIENT.CONFIRM_SPAWN, new PacketWriter(), false);
}