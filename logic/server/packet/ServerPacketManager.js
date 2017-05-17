var util = require('util');
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    ServerPacketManager: ServerPacketManager
};

var $ServerPacketManager = ServerPacketManager.prototype;
$ServerPacketManager._sendPacket = ServerPacketManager$_sendPacket;
//$ServerPacketManager._sendPacketAll = ServerPacketManager$_sendPacketAll;
$ServerPacketManager.forwardPacket = ServerPacketManager$forwardPacket;
$ServerPacketManager.forwardPacketAll = ServerPacketManager$forwardPacketAll;

function ServerPacketManager(bot) {
	this._bot = bot;

	this._packetBlackList = [];

	this._packetBlackList.push(this._bot.opcodes.SERVER.HANDSHAKE);
	this._packetBlackList.push(this._bot.opcodes.SERVER.AGENT_SERVER);
	this._packetBlackList.push(this._bot.opcodes.SERVER.PATCH_INFO);
	this._packetBlackList.push(this._bot.opcodes.SERVER.PING);
	this._packetBlackList.push(this._bot.opcodes.SERVER.LOGIN_REPLY);
	this._packetBlackList.push(this._bot.opcodes.SERVER.CHARACTER_LIST);
	this._packetBlackList.push(this._bot.opcodes.SERVER.CHARACTER_SELECT);
	this._packetBlackList.push(this._bot.opcodes.SERVER.CHARDATA_BEGIN);
	this._packetBlackList.push(this._bot.opcodes.SERVER.CHARDATA_DATA);
	this._packetBlackList.push(this._bot.opcodes.SERVER.CHARDATA_END);
	this._packetBlackList.push(this._bot.opcodes.SERVER.CHARDATA_ID);
	this._packetBlackList.push(this._bot.opcodes.SERVER.WEATHER);
	//this._packetBlackList.push(this._bot.opcodes.SERVER.SINGLE_SPAWN);
	//this._packetBlackList.push(this._bot.opcodes.SERVER.SINGLE_DESPAWN);
	//this._packetBlackList.push(this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN);
	//this._packetBlackList.push(this._bot.opcodes.SERVER.GROUPSPAWN_DATA);
	//this._packetBlackList.push(this._bot.opcodes.SERVER.GROUPSPAWN_END);
}

function ServerPacketManager$_sendPacket(client, packet) {
	var tmpBuffer, p;

	//Set pointer to beginning
	packet.pointer = 6;
	tmpBuffer = packet.readByteArray(packet.size);
	p = new PacketWriter(tmpBuffer);
	this._bot.server.send(client, packet.opcode, p, packet.encrypted);
}

// function ServerPacketManager$_sendPacketAll(packet) {
// 	var tmpBuffer, p;

// 	//Set pointer to beginning
// 	packet.pointer = 6;
// 	tmpBuffer = packet.readByteArray(packet.size);
// 	p = new PacketWriter(tmpBuffer);
// 	this._bot.server.sendAll(packet.opcode, p, packet.encrypted);
// }

function ServerPacketManager$forwardPacket(client, packet, bypassBlacklist) {
	console.log('[SERVER][S->C] '+ packet.opcode.toString('16'));
	bypassBlacklist = bypassBlacklist || false;
	if(packet) {
		if(this._packetBlackList.indexOf(packet.opcode) == -1 || bypassBlacklist) {
			this._sendPacket(client, packet);
		}
	}
}

function ServerPacketManager$forwardPacketAll(packet, bypassBlacklist) {
	console.log('[SERVER][ALL][S->C] '+ packet.opcode.toString('16'));
	var clients;
	bypassBlacklist = bypassBlacklist || false;
	if(packet) {
		if(this._packetBlackList.indexOf(packet.opcode) == -1 || bypassBlacklist) {
			clients = this._bot.server.clients;
			for(var key in clients) {
		        var client;
		        client = clients[key];

		        if(client.state == this._bot.enums.clientState.LOADING_GAME_WORLD) {
		        	client.packetHoldList.push(packet);
		        } else {
		        	this._sendPacket(client, packet);
		        }
		    }
		}
	}
}
