var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PacketWriter = require('../../../packet/PacketWriter');

module.exports = {
    Login: Login
};

util.inherits(Login, EventEmitter);

var $Login = Login.prototype;
$Login.identify = Login$identify;
$Login.serverList = Login$serverList;
$Login.captchaRequest = Login$captchaRequest;
$Login.sendLogin = Login$sendLogin;
$Login.autoLogin = Login$autoLogin;
$Login.loginResponse = Login$loginResponse;
$Login.gameLoginResponse = Login$gameLoginResponse;

function Login(bot) {
    EventEmitter.call(this);

    this._bot = bot;
    this.srvList = null;
    this.serverListPacket = null;
}

function Login$identify(packet) {
    var server;
    server = packet.readString(true);
    if (server == this._bot.enums.serverType.GATEWAY_SERVER) {
        var resp = new PacketWriter();
        resp.writeByte(this._bot.settings.locale);
        resp.writeString("SR_Client");
        resp.writeDWord(this._bot.settings.version);
        this._bot.client.send(this._bot.opcodes.CLIENT.PATCH_REQUEST, resp, true);

        var b = new PacketWriter();
        this._bot.client.send(this._bot.opcodes.CLIENT.REQUEST_SERVER_LIST, b, true);

        this.emit('identified', server);
    } else if (server == this._bot.enums.serverType.AGENT_SERVER) {
        var resp = new PacketWriter();
        resp.writeDWord(this._bot.globals.sessionId);
        resp.writeString(this._bot.settings.username);
        resp.writeString(this._bot.settings.password);
        resp.writeByte(this._bot.settings.locale); //locale
        resp.writeDWord(0);
        resp.writeWord(0);
        this._bot.client.send(this._bot.opcodes.CLIENT.GAME_LOGIN, resp, true);

        this.emit('identified', server);
    }
}

function Login$serverList(packet) {
    var serverList, server, newServer, id, name, ratio, state, c, total;

    //Save this packet for incoming game client connections (server emulation)
    this.serverListPacket = packet;

    total = 1;
    serverList = []

    newServer = packet.readByte();

    while(newServer == 1) {
        id = packet.readByte();
        name = packet.readString(true);
        newServer = packet.readByte();
    }

    newServer = packet.readByte();

    while(newServer == 1) {

        id = ratio = cur = max = c = null;

        id = packet.readWord();

        if(this._bot.settings.locale == 18) { // ISRO
            name = packet.readString(true);
            ratio = packet.readFloat();

            c = name.charAt(0);
            name = name.substring(1);
            cur = Math.round(ratio * 3500.0);
            total += cur;
        } else { // Other versions
            name = packet.readString(true);
            cur = packet.readWord();
            max = packet.readWord();
        }

        server = {
            serverId: id,
            name: name,
            ratio: ratio || null,
            c: c || null,
            cur: cur || null,
            max: max || null,
        }

        serverList.push(server);

        state = packet.readByte();

        // csro/vsro extra bytes
        if(this._bot.settings.locale == 4 || this._bot.settings.locale == 22){
            if(packet.readByte() == 1){
                packet.readByte();
            }
        }

        newServer = packet.readByte();
    }

    this.srvList = serverList;

    this.emit('serverList', serverList);
}

function Login$captchaRequest(packet) {

    var p = new PacketWriter();
    p.writeString("");
    this._bot.client.send(this._bot.opcodes.CLIENT.CAPTCHA_REPLY, p, true);

}

function Login$sendLogin(username, password, serverId) {
    this._bot.settings.username = username;
    this._bot.settings.password = password;
    this._bot.settings.serverId = serverId;

    if(this._bot.globals.clientState == this._bot.enums.clientState.WAITING_LOGIN) {
        var p = new PacketWriter();
        p.writeByte(this._bot.settings.locale);
        p.writeString(this._bot.settings.username);
        p.writeString(this._bot.settings.password);
        p.writeWord(this._bot.settings.serverId);
        this._bot.client.send(this._bot.opcodes.CLIENT.LOGIN, p, true);
    } else {
        this.emit('loginError', 'Cannot send login packet because client state is not WAITING_LOGIN ('+ this._bot.globals.clientState +')');
    }
}

function Login$autoLogin() {
    if(this._bot.settings.autologin) {
        if(this._bot.settings.username && this._bot.settings.password && this._bot.settings.serverId){
            this.sendLogin(this._bot.settings.username, this._bot.settings.password, this._bot.settings.serverId);
        }
    }
}

function Login$loginResponse(packet){
    var code, subcode, sessionId, host, port, maxTry, curTry, reason, date, emitResp;

    code = packet.readByte();

    if(code == 1) {
        this._bot.globals.sessionId = sessionId = packet.readDWord();
        host = packet.readString(true);
        port = packet.readWord();

        emitResp = {
            code: code,
            host: host,
            port: port,
            sessionId: sessionId,
        }
        
        //Send hardcoded success
        //this._bot.serverLogic.sendHardcodedLoginSuccessPacket();

        this.emit('loginResponse', emitResp);

    } else {
        subcode = packet.readByte();
        if(subcode == 1) {
            //Wrong ID/PW

            this._bot.globals.loginMaxTry = maxTry = packet.readDWord();
            this._bot.globals.loginCurTry = curTry = packet.readDWord();

            emitResp = {
                code: code,
                subcode: subcode,
                maxTry: maxTry,
                curTry: curTry,
            }

            this.emit('loginResponse', emitResp);

        } else if (subcode == 2) {
            // Account banned
            if(packet.readByte() == 1) {
                reason = readString(true);
                date = packet.readDWord() + '-' + packet.readDWord() + '-' + packet.readDWord() + ' ' + packet.readDWord() + ':' + packet.readDWord();
            }

            emitResp = {
                code: code,
                subcode: subcode,
                reason: reason,
                date: date,
            }

            this.emit('loginResponse', emitResp);
            
        } else if (subcode == 3) {
            //User already connected
            emitResp = {
                code: code,
                subcode: subcode,
            }

            this.emit('loginResponse', emitResp);
        } else if (subcode == 5) {
            // Server is full

            emitResp = {
                code: code,
                subcode: subcode,
            }

            this.emit('loginResponse', emitResp);
        } else {
            // Unknown login error code
            emitResp = {
                code: code,
                subcode: subcode,
            }

            this.emit('loginResponse', emitResp);
        }

        //Notify game client
        this._bot.ServerPacketManager.forwardPacketAll(packet);
    }

}

function Login$gameLoginResponse(packet) {
    var code, subcode, emitResp;

    code = packet.readByte();

    if(code == 1){
        //Successfully logged in
        emitResp = {
            code: code,
        }

        this.emit('gameLoginResponse', emitResp);

    } else {
        // Meh.
        subcode = packet.readByte();

        emitResp = {
                code: code,
                subcode: subcode,
            }

        this.emit('gameLoginResponse', emitResp);
    }
}