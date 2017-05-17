var util = require('util');
var EventEmitter = require('events').EventEmitter;
var hexy = require('hexy').hexy;
var PacketWriter = require('./packet/PacketWriter');
var settings = require('./vars/settings');
var globals = require('./vars/globals');
var enums = require('./vars/enums');
var opcodes = require('./vars/opcodes');
var Client = require('./connections/Client');
var Server = require('./connections/Server');
var ClientPacketManager = require('./logic/client/packet/ClientPacketManager').ClientPacketManager;
var ServerPacketManager = require('./logic/server/packet/ServerPacketManager').ServerPacketManager;
//Client
var GameData = require('./gamedata/GameData').GameData;
var Login = require('./logic/client/login/Login').Login;
var Ping = require('./logic/client/ping/Ping').Ping;
var CharList = require('./logic/client/character/CharList').CharList;
var CharData = require('./logic/client/character/CharData').CharData;
var InventoryParser = require('./logic/client/items/InventoryParser').InventoryParser;
var World = require('./logic/client/world/World').World;
var Teleport = require('./logic/client/teleport/Teleport').Teleport;
var GroupSpawn = require('./logic/client/spawns/GroupSpawn').GroupSpawn;
var SpawnManager = require('./logic/client/spawns/SpawnManager').SpawnManager;
var SpawnParser = require('./logic/client/spawns/SpawnParser').SpawnParser;
//Server
var ServerLogic = require('./logic/server/ServerLogic').ServerLogic;
var ServerSpawns = require('./logic/server/ServerSpawns').ServerSpawns;

module.exports = {
    create: create,
    Bot: Bot
};

function create(options) {
    return new Bot(options);
}

util.inherits(Bot, EventEmitter);

var $Bot = Bot.prototype;
$Bot.createClient = Bot$createClient;
$Bot.createServer = Bot$createServer;
$Bot.start = Bot$start;
$Bot.sendLogin = Bot$sendLogin;
$Bot.selectCharacter = Bot$selectCharacter;

function Bot(options) {
    EventEmitter.call(this);

    options = this.options = {
        host: options && options.host,
        port: options && options.port || 15779,
        locale: options && options.locale || 22,
        version: options && options.version || 188,
    };

    // vars
    this.settings = settings;
    this.globals = globals;
    this.enums = enums;
    this.opcodes = opcodes;

    // Store options to settings
    this.settings.host = options.host;
    this.settings.port = options.port;
    this.settings.locale = options.locale;
    this.settings.version = options.version;

    this.client = null;
    this.server = null;
    this.gatewayServer = null;
    this.agentServer = null;

    this._bound = {
        //Client
        onClientError: onClientError.bind(this),
        onClientClose: onClientClose.bind(this),
        onClientPacket: onClientPacket.bind(this),
        //Server
        onServerListening: onServerListening.bind(this),
        onServerConnection: onServerConnection.bind(this),
        onServerPacket: onServerPacket.bind(this),
        //Login
        onIdentified: onIdentified.bind(this),
        onServerList: onServerList.bind(this),
        onLoginError: onLoginError.bind(this),
        onLoginResponse: onLoginResponse.bind(this),
        onGameLoginResponse: onGameLoginResponse.bind(this),
        //CharList
        onCharList: onCharList.bind(this),
        onCharListError: onCharListError.bind(this),
        oncharacterSelected: oncharacterSelected.bind(this),
        //CharData
        onCharData: onCharData.bind(this),
        //Teleport
        onTeleportRequest: onTeleportRequest.bind(this),
    };



    //ClientPacketManager
    this.clientPacketManager = new ClientPacketManager(this);

    //ServerPacketManager
    this.serverPacketManager = new ServerPacketManager(this);

    //GameData
    this.gameData = new GameData();

    //Login
    this.login = new Login(this);
    this.login.on('identified', this._bound.onIdentified);
    this.login.on('serverList', this._bound.onServerList);
    this.login.on('loginError', this._bound.onLoginError);
    this.login.on('loginResponse', this._bound.onLoginResponse);
    this.login.on('gameLoginResponse', this._bound.onGameLoginResponse);

    //Ping
    this.ping = new Ping(this);

    //CharList
    this.charList = new CharList(this);
    this.charList.on('charList', this._bound.onCharList);
    this.charList.on('charListError', this._bound.onCharListError);
    this.charList.on('characterSelected', this._bound.oncharacterSelected);

    //CharData
    this.charData = new CharData(this);
    this.charData.on('charData', this._bound.onCharData);

    //InventoryParser
    this.inventoryParser = new InventoryParser(this);

    //World
    this.world = new World(this);

    //Teleport
    this.teleport = new Teleport(this);
    this.teleport.on('teleportRequest', this._bound.onTeleportRequest);

    //GroupSpawn
    this.groupSpawn = new GroupSpawn(this);

    //SpawnManager
    this.spawnManager = new SpawnManager(this);

    //SpawnParser
    this.spawnParser = new SpawnParser(this);

    //===Server modules===

    //ServerLogic
    this.serverLogic = new ServerLogic(this);

    //ServerSpawns
    this.serverSpawns = new ServerSpawns(this);

}

function Bot$createClient(){
    var client, bound;

    bound = this._bound;

    client = this.client = Client.connect({ port: this.options.port, host: this.options.host });
    client.on('error', bound.onClientError);
    client.on('close', bound.onClientClose);
    client.on('packet', bound.onClientPacket);

}

function Bot$createServer(){
    var server;
    bound = this._bound;

    server = this.server = Server.listen(this);
    server.on('listening', bound.onServerListening);
    server.on('connection', bound.onServerConnection);
    server.on('packet', bound.onServerPacket);

}

// Triggers _createClient() which start connection with the game server
function Bot$start(){
    if(this.client == null){
        this.createServer();
        this.createClient();
        
    }
}

function Bot$sendLogin(username, password, serverId){
    this.login.sendLogin(username, password, serverId);
}

function Bot$selectCharacter(charName){
    this.charList.selectCharacter(charName);
}

// Event handlers

//Client events
function onClientPacket(packet) {
    switch (packet.opcode) {
        case this.opcodes.SERVER.AGENT_SERVER:
            this.login.identify(packet);
            break;
        case this.opcodes.SERVER.SERVER_LIST:
            this.login.serverList(packet);
            break;
        case this.opcodes.SERVER.CAPTCHA_REQUEST:
            this.login.captchaRequest(packet);
            break;
        case this.opcodes.SERVER.LOGIN_REPLY:
            this.login.loginResponse(packet);
            break;
        case this.opcodes.SERVER.GAME_LOGIN_REPLY:
            this.login.gameLoginResponse(packet);
            break;
        case this.opcodes.SERVER.CHARACTER_LIST:
            this.charList.analyze(packet);
            break;
        case this.opcodes.SERVER.CHARACTER_SELECT:
            this.charList.characterSelected(packet);
            break;
        case this.opcodes.SERVER.TELEPORT_REQUEST:
            this.teleport.teleportRequest(packet);
            break;
        case this.opcodes.SERVER.CHARDATA_BEGIN:
            this.charData.begin(packet);
            break;
        case this.opcodes.SERVER.CHARDATA_DATA:
            this.charData.data(packet);
            break;
        case this.opcodes.SERVER.CHARDATA_END:
            this.charData.end(packet);
            break;
        case this.opcodes.SERVER.CHARDATA_ID:
            this.charData.id(packet);
            break;
        case this.opcodes.SERVER.WEATHER:
            this.world.weather(packet);
            break;
        case this.opcodes.SERVER.SINGLE_SPAWN:
            this.spawnManager.spawn(packet);
            break;
        case this.opcodes.SERVER.SINGLE_DESPAWN:
            this.spawnManager.despawn(packet);
            break;
        case this.opcodes.SERVER.GROUPSPAWN_BEGIN:
            this.groupSpawn.groupSpawnBegin(packet);
            break;
        case this.opcodes.SERVER.GROUPSPAWN_DATA:
            this.groupSpawn.groupSpawnData(packet);
            break;
        case this.opcodes.SERVER.GROUPSPAWN_END:
            this.groupSpawn.groupSpawnEnd(packet);
            break;
        default:
            break;
    }

    //Forward packet to connected clients on the local server
    this.serverPacketManager.forwardPacketAll(packet);
    
    this.emit('clientPacket', packet);
}

function onClientError(error) {
    this.emit('clientError', error);
}

function onClientClose(hadError) {
    //Stop ping timer
    this.ping.stop();
    globals.clientState = enums.clientState.OFFLINE;

    this.emit('clientClose', hadError);
}

function onIdentified(server){
    //Change client state
    this.globals.clientState = this.enums.clientState.IDENTIFIED;
    //Stop ping timer
    this.ping.start();

    this.emit('identified', server);
}

function onServerList(serverList) {
    // Change client state to WAITING_LOGIN
    this.globals.clientState = this.enums.clientState.WAITING_LOGIN;
    // Make auto login if needed
    this.login.autoLogin();

    this.emit('serverList', serverList);
}

function onLoginError(error) {
    this.emit('loginError', error);
}

function onLoginResponse(data) {
    if(data.code == 1) {
        if(this.settings.system.connectToAgentServer) {
            this.client.reconnect({port: data.port, host: data.host});
        }
    }

    this.emit('loginResponse', data);
}

function onGameLoginResponse(data) {
    //Request character list
    if(data.code === 1) {
        if(this.settings.system.requestCharList) {
            this.charList.requestCharList();
        }
    }

    this.emit('gameLoginResponse', data);
}

function onCharList(charList) {
    var charName;

    // Change client state to WAITING_CHAR_SELECTION
    this.globals.clientState = this.enums.clientState.WAITING_CHAR_SELECTION;

    charName = this.settings.charName;
    //Select character if needed
    if(this.settings.autologin && charName){
        this.charList.selectCharacter(charName);
    }
    
    this.emit('charList', charList);
}

function onCharData(character) {
    this.emit('charData', character);
}

function onCharListError(error) {
    this.emit('charListError', error);
}

function oncharacterSelected() {
    // Change client state to IN_GAME
    this.globals.clientState = this.enums.clientState.IN_GAME;

    this.emit('characterSelected');
}

function onTeleportRequest() {
    this.emit('teleportRequest');
}

//Server events
function onServerPacket(packet, client) {
    switch (packet.opcode) {
        case this.opcodes.CLIENT.AGENT_SERVER:
            this.serverLogic.identify(packet, client);
            break;
        case this.opcodes.CLIENT.PATCH_REQUEST:
            this.serverLogic.patchRequest(packet, client);
            break;
        case this.opcodes.CLIENT.REQUEST_SERVER_LIST:
            this.serverLogic.serverListRequest(packet, client);
            break;
        case this.opcodes.CLIENT.LOGIN:
            this.serverLogic.login(packet, client);
            break;
        case this.opcodes.CLIENT.GAME_LOGIN:
            this.serverLogic.gameLogin(packet, client);
            break;
        case this.opcodes.CLIENT.CHARACTER_LIST:
            this.serverLogic.characterList(packet, client);
            break;
        case this.opcodes.CLIENT.CHARACTER_SELECT:
            this.serverLogic.characterSelect(packet, client);
            break;
        case this.opcodes.CLIENT.CONFIRM_SPAWN:
            this.serverLogic.spawnConfirmation(packet, client);
            break;
        case this.opcodes.CLIENT.WEATHER_REQUEST:
            this.serverLogic.weatherRequest(packet, client);
            break;
    }

    //Forward packet to remote game server
    this.clientPacketManager.forwardPacket(packet, client);
    this.emit('serverPacket', packet, client);
}

function onServerListening(port) {
    this.emit('serverListening', port);
}

function onServerConnection(socket) {
    this.emit('serverConnection', socket);
}