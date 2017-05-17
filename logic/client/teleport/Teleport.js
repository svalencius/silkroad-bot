var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PacketWriter = require('../../../packet/PacketWriter');

module.exports = {
    Teleport: Teleport
};

util.inherits(Teleport, EventEmitter);

var $Teleport = Teleport.prototype;
$Teleport.teleportRequest = Teleport$teleportRequest;

function Teleport(bot) {
    EventEmitter.call(this);

    this._bot = bot;
}

function Teleport$teleportRequest(packet) {
	if(this._bot.settings.system.acceptTeleportRequest){
		this._bot.client.send(this._bot.opcodes.CLIENT.TELEPORT_ACCEPT, new PacketWriter(), false);
	}
	this.emit('teleportRequest');
}

