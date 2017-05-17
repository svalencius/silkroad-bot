var util = require('util');
var PacketWriter = require('../../packet/PacketWriter');
var functions = require('../../functions');

module.exports = {
    ServerLogic: ServerLogic
};

var $ServerLogic = ServerLogic.prototype;
$ServerLogic.identify = ServerLogic$identify;
$ServerLogic.patchRequest = ServerLogic$patchRequest;
$ServerLogic.sendPatchInfo = ServerLogic$sendPatchInfo;
$ServerLogic.serverListRequest = ServerLogic$serverListRequest;
$ServerLogic.login = ServerLogic$login;
$ServerLogic.sendHardcodedLoginSuccessPacket = ServerLogic$sendHardcodedLoginSuccessPacket;
$ServerLogic.gameLogin = ServerLogic$gameLogin;
$ServerLogic.characterList = ServerLogic$characterList;
$ServerLogic.characterSelect = ServerLogic$characterSelect;
$ServerLogic.checkForClientsInCharSelection = ServerLogic$checkForClientsInCharSelection;
$ServerLogic.sendCharDataAndStuff = ServerLogic$sendCharDataAndStuff;
$ServerLogic.spawnConfirmation = ServerLogic$spawnConfirmation;
$ServerLogic.sendSuccessByte = ServerLogic$sendSuccessByte;
$ServerLogic.weatherRequest = ServerLogic$weatherRequest;
$ServerLogic.sendSpawns = ServerLogic$sendSpawns;


function ServerLogic(bot) {
	this._bot = bot;
}

function ServerLogic$identify(packet, client) {

	//Start client if null
	if(!this._bot.client) {
		this._bot.createClient();
	}

	//If client state is lower than 50, means client is not connected to game server yet
	if(this._bot.globals.clientState.id < 50) {
		var resp = new PacketWriter();
		resp.writeString(this._bot.enums.serverType.GATEWAY_SERVER);
		resp.writeByte(0);
		this._bot.server.send(client, this._bot.opcodes.SERVER.AGENT_SERVER, resp, false);
	} else {
		var resp = new PacketWriter();
		resp.writeString(this._bot.enums.serverType.AGENT_SERVER);
		resp.writeByte(0);
		this._bot.server.send(client, this._bot.opcodes.SERVER.AGENT_SERVER, resp, false);
	}

	client.state = this._bot.enums.clientState.IDENTIFIED;
}

function ServerLogic$patchRequest(packet, client) {
	this.sendPatchInfo(client);
}

function ServerLogic$sendPatchInfo(client) {
	var resp = new PacketWriter();
	resp.writeDWord(0x05000101);
	resp.writeByte(0x20);
	this._bot.server.send(client, this._bot.opcodes.SERVER.PATCH_INFO, resp, false);
	var resp = new PacketWriter();
	resp.writeDWord(0x01000100);
	resp.writeDWord(0x00050A08);
	resp.writeWord(0x0000);
	resp.writeByte(0x20);
	this._bot.server.send(client, this._bot.opcodes.SERVER.PATCH_INFO, resp, false);
	var resp = new PacketWriter();
	resp.writeDWord(0x05000101);
	resp.writeByte(0x60);
	this._bot.server.send(client, this._bot.opcodes.SERVER.PATCH_INFO, resp, false);
	var resp = new PacketWriter();
	resp.writeDWord(0x02000300);
	resp.writeByte(0x20);
	this._bot.server.send(client, this._bot.opcodes.SERVER.PATCH_INFO, resp, false);
	var resp = new PacketWriter();
	resp.writeDWord(0x00000101);
	resp.writeByte(0xA1);
	this._bot.server.send(client, this._bot.opcodes.SERVER.PATCH_INFO, resp, false);
	var resp = new PacketWriter();
	resp.writeWord(0x0100);
	this._bot.server.send(client, this._bot.opcodes.SERVER.PATCH_INFO, resp, false);
}

function ServerLogic$serverListRequest(packet, client) {
	//Send server list if client already have it
	if(this._bot.login.serverListPacket) {
		var tmpBuffer, resp;
		//Set pointer to beginning
		this._bot.login.serverListPacket.pointer = 6;
		tmpBuffer = this._bot.login.serverListPacket.readByteArray(this._bot.login.serverListPacket.size);
		resp = new PacketWriter(tmpBuffer);
		this._bot.server.send(client, this._bot.opcodes.SERVER.SERVER_LIST, resp, false);
	}

	client.state = this._bot.enums.clientState.WAITING_LOGIN;
}

function ServerLogic$login(packet, client) {
	//Take username/password and forward packet to server 
	if(this._bot.globals.clientState == this._bot.enums.clientState.WAITING_LOGIN) {
		var tmpBuffer, p, username, password, serverId;

		packet.readByte(); //locale
		username = packet.readString(true);
		password = packet.readString(true);
		serverId = packet.readWord();
		
		this._bot.login.sendLogin(username, password, serverId);
	}
}

function ServerLogic$sendHardcodedLoginSuccessPacket() {
	var host, port, p;

	host = '127.0.0.1'; //hardcoded for so far :(
	port = this._bot.server.listener.address().port;

	if(host && port) {
		p = new PacketWriter();
		p.writeByte(0x01); //Success byte
		p.writeDWord(0x01); //SessionId. Can be any number since we don't need it.
		p.writeString(host);
		p.writeWord(port);
		this._bot.server.sendAll(this._bot.opcodes.SERVER.LOGIN_REPLY, p, false);
	}
}

function ServerLogic$gameLogin(packet, client) {
	this.sendPatchInfo(client);
	var resp = new PacketWriter();
	resp.writeByte(0x01);
	this._bot.server.send(client, this._bot.opcodes.SERVER.GAME_LOGIN_REPLY, resp, false);
}

function ServerLogic$characterList(packet, client) {
	var tmpBuffer, p;
	//Send character list if bot already have it
	if(this._bot.charList.charListPacket) {
		//Set pointer to beginning
		this._bot.charList.charListPacket.pointer = 6;
		tmpBuffer = this._bot.charList.charListPacket.readByteArray(this._bot.charList.charListPacket.size);
		p = new PacketWriter(tmpBuffer);
		this._bot.server.send(client, this._bot.opcodes.SERVER.CHARACTER_LIST, p, false);
	}

	//Send char select success and chardata if bot is already in game world
	if(this._bot.globals.clientState == this._bot.enums.clientState.IN_GAME) {
		this.sendCharDataAndStuff(client);
	}

	client.state = this._bot.enums.clientState.WAITING_CHAR_SELECTION;
}

function ServerLogic$characterSelect(packet, client) {
	var charName;
	charName = packet.readString(true);
	this._bot.charList.selectCharacter(charName);
}

function ServerLogic$checkForClientsInCharSelection() {
	var clients;
	clients = this._bot.server.clients;
	for(var key in clients) {
		var client;
		client = clients[key];
		if(client.state == this._bot.enums.clientState.WAITING_CHAR_SELECTION) {
			this.sendCharDataAndStuff(client);
		}
	}
}

function ServerLogic$sendCharDataAndStuff(client) {
	//set client state to loading into game, so proxy will hold incoming game world packets meanwhile
	client.state = this._bot.enums.clientState.LOADING_GAME_WORLD;

	this.sendSuccessByte(client);

	this._bot.serverPacketManager.forwardPacket(client, this._bot.charData.charDataBeginPacket, true);
	this._bot.serverPacketManager.forwardPacket(client, this._bot.charData.charDataPacket, true);
	this._bot.serverPacketManager.forwardPacket(client, this._bot.charData.charDataEndPacket, true);
	this._bot.serverPacketManager.forwardPacket(client, this._bot.charData.charDataIdPacket, true);

	this._bot.serverSpawns.sendSpawns(client);
}

function ServerLogic$spawnConfirmation(packet, client) {
	client.state = this._bot.enums.clientState.IN_GAME;

	//send packets which were on hold while loading into game world
	for (var i = 0; i < client.packetHoldList.length; i++) {
		var packet = client.packetHoldList[i];
		//console.log(packet.opcode.toString('16'));
		this._bot.serverPacketManager.forwardPacket(client, packet, true);
	}
	//remove sent packets
	client.packetHoldList.splice(0, client.packetHoldList.length);
}

function ServerLogic$sendSuccessByte(client) {
	p = new PacketWriter();
	p.writeByte(0x01); //success byte
	this._bot.server.send(client, this._bot.opcodes.SERVER.CHARACTER_SELECT, p, false);
}

function ServerLogic$weatherRequest(packet, client) {
	this._bot.serverPacketManager.forwardPacket(client, this._bot.world.weatherPacket, true);
	client.state = this._bot.enums.clientState.IN_GAME;
}

function ServerLogic$sendSpawns(client) {
	var NPCs, count, pBegin, pData, Pend;

	NPCs = this._bot.spawnManager.NPCs;
	count = Object.keys(NPCs).length;

	// Stop this function if there's no spawned objects
	if(!count) {
		return;
	}

	pBegin = new PacketWriter();
	pBegin.writeByte(1); //Spawn action.
	pBegin.writeWord(count);

	pData = new PacketWriter();

	for (var uniqueId in NPCs) {
		var NPC;

		NPC = NPCs[uniqueId];

		pData.writeDWord(NPC.model);
		pData.writeDWord(NPC.uniqueId);
		pData.writeByte(NPC.xSector);
		pData.writeByte(NPC.ySector);
		pData.writeFloat(NPC.xOffset);
		pData.writeFloat(NPC.zOffset);
		pData.writeFloat(NPC.yOffset);
		pData.writeWord(NPC.position);
		pData.writeByte(NPC.moving);
		pData.writeByte(NPC.running);
		if(NPC.moving == 1) {
			pData.writeByte(NPC.movingData.xSector);
			pData.writeByte(NPC.movingData.ySector);

			if(NPC.movingData.ySector == 0x80) {
				pData.writeWord(NPC.movingData.xOffset);
				pData.writeWord(NPC.movingData.xOffset2);

				pData.writeWord(NPC.movingData.zOffset);
				pData.writeWord(NPC.movingData.zOffset2);

				pData.writeWord(NPC.movingData.yOffset);
				pData.writeWord(NPC.movingData.yOffset2);
			} else {
				pData.writeWord(NPC.movingData.xOffset);
				pData.writeWord(NPC.movingData.zOffset);
				pData.writeWord(NPC.movingData.yOffset);
			}
		} else {
			pData.writeByte(NPC.movingData.noDestination);
			pData.writeWord(NPC.movingData.angle);
		}

		pData.writeByte(NPC.alive);
		pData.writeByte(NPC.unknown1);
		pData.writeByte(NPC.unknown2);
		pData.writeByte(NPC.unknown3);
		pData.writeDWord(NPC.walkingSpeed);
		pData.writeDWord(NPC.runningSpeed);
		pData.writeDWord(NPC.berserkerSpeed);
		pData.writeByte(NPC.unknown4);
		pData.writeByte(NPC.check);

		if(NPC.check != 0) {
			pData.writeByte(NPC.count);
			for (var i = 0; i < NPC.count; i++) {
				pData.writeByte(NPC.unknown5[i]);
			};
		}

		

	};

	pEnd = new PacketWriter();

	console.log('Sending NPC spawn');
	//console.log(pData);

	this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_BEGIN, pBegin, false);
	this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_DATA, pData, false);
	this._bot.server.send(client, this._bot.opcodes.SERVER.GROUPSPAWN_END, pEnd, false);

} 