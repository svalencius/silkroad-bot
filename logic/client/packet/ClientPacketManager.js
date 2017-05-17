var util = require('util');
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    ClientPacketManager: ClientPacketManager
};

var $ClientPacketManager = ClientPacketManager.prototype;
$ClientPacketManager.forwardPacket = ClientPacketManager$forwardPacket;

function ClientPacketManager(bot) {
	this._bot = bot;

	this._packetBlackList = [];

	this._packetBlackList.push(this._bot.opcodes.CLIENT.HANDSHAKE);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.HANDSHAKE_OK);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.AGENT_SERVER);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.PING);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.GAME_LOGIN);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.REQUEST_SERVER_LIST);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.LOCATION_REQUEST);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.CHARACTER_LIST);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.CHARACTER_SELECT);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.CONFIRM_SPAWN);
	this._packetBlackList.push(this._bot.opcodes.CLIENT.WEATHER_REQUEST);
}

function ClientPacketManager$forwardPacket(packet, client) {
	if(packet && this._bot.globals.clientState != this._bot.enums.clientState.OFFLINE && this._packetBlackList.indexOf(packet.opcode) == -1 && client.state == this._bot.enums.clientState.IN_GAME) {
		var tmpBuffer, p;
		//Set pointer to beginning
		packet.pointer = 6;
		tmpBuffer = packet.readByteArray(packet.size);
		p = new PacketWriter(tmpBuffer);
		this._bot.client.send(packet.opcode, p, packet.encrypted);
	}
}
