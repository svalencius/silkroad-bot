var util = require('util');
var PacketWriter = require('../../../packet/PacketWriter');
var PacketReader = require('../../../packet/PacketReader');
var functions = require('../../../functions');

module.exports = {
    GroupSpawn: GroupSpawn
};

var $GroupSpawn = GroupSpawn.prototype;
$GroupSpawn.groupSpawnBegin = GroupSpawn$groupSpawnBegin;
$GroupSpawn.groupSpawnData = GroupSpawn$groupSpawnData;
$GroupSpawn.groupSpawnEnd = GroupSpawn$groupSpawnEnd;

function GroupSpawn(bot) {
	this._bot = bot;

	this.groupSpawnDataPackets = [];
	this.action = 0;
	this.count = 0;
}

function GroupSpawn$groupSpawnBegin(packet) {
	this.action = packet.readByte();
	this.count = packet.readWord();
}

function GroupSpawn$groupSpawnData(packet) {
	this.groupSpawnDataPackets.push(packet);
	/*
	if(!this.groupSpawnPacketData) {
		this.groupSpawnPacketData = packet;
	} else {
		this.groupSpawnPacketData.buffer = Buffer.concat([this.groupSpawnPacketData.buffer, packet.buffer]);
	}
	*/
}

function GroupSpawn$groupSpawnEnd(packet) {
	var integralBuffer, integralPacket;
	integralBuffer = new Buffer(0);

	for(var i = 0; i < this.groupSpawnDataPackets.length; i++) {
		integralBuffer = Buffer.concat([integralBuffer, this.groupSpawnDataPackets[i].readByteArray(this.groupSpawnDataPackets[i].buffer.length - this.groupSpawnDataPackets[i].pointer)]);
	}
	integralPacket = new PacketReader(integralBuffer);
	integralPacket.pointer = 0;
	
	this._bot.spawnManager.parseGroupSpawn(integralPacket, this.action, this.count);

	//flush groupSpawnDataPackets for the next incoming group spawn data
	this.groupSpawnDataPackets.splice(0, this.groupSpawnDataPackets.length);
}