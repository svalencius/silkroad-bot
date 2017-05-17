var util = require('util');
var PacketWriter = require('../../../packet/PacketWriter');
var functions = require('../../../functions');

module.exports = {
    World: World
};

var $World = World.prototype;
$World.weather = World$weather;

function World(bot) {
	this._bot = bot;

	this.weatherPacket = null;
}

function World$weather(packet) {
	this.weatherPacket = packet;
}