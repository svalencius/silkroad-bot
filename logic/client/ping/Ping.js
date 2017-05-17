var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PacketWriter = require('../../../packet/PacketWriter');

module.exports = {
    Ping: Ping
};

var $Ping = Ping.prototype;
$Ping.start = Ping$start;
$Ping.stop = Ping$stop;
$Ping._ping = Ping$_ping;

function Ping(bot) {
    this._bot = bot;
    this.timer = null;
    this.delay = 7000;
}

function Ping$start() {
	var self = this;
	this.timer = setInterval(function() {
		self._ping();
	}, this.delay);
}

function Ping$stop() {
	clearInterval(this.timer);
}

function Ping$_ping() {
	if(this._bot.globals.clientState != this._bot.enums.clientState.OFFLINE) {
		this._bot.client.send(this._bot.opcodes.CLIENT.PING, new PacketWriter());
	}
}