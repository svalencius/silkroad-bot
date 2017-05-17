var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var Security = require('../security/Security');
var PacketReader = require('../packet/PacketReader');
var PacketWriter = require('../packet/PacketWriter');

module.exports = {
    listen: listen,
    Server: Server
};

function listen(bot) {
    return new Server(bot);
}

util.inherits(Server, EventEmitter);

var $Server = Server.prototype;
$Server._listen = Server$_listen;
$Server.send = Server$send;
$Server.sendAll = Server$sendAll;
$Server._processData = Server$_processData;
$Server._process = Server$_process;
$Server._handlePackets = Server$_handlePackets;
$Server._handshake = Server$_handshake;

function Server(bot) {
    EventEmitter.call(this);

    this._bot = bot;

    this.clients = new Object();

    this.listener = null;
    this.port = 9000;
    
    this._stored = {
        buffer: [],
        length: 0
    };
    
    this._bound = {
        onListening: onListening.bind(this),
        onConnection: onConnection.bind(this),
        onClose: onClose.bind(this),
        onError: onError.bind(this),

        onSocketReadable: onSocketReadable.bind(this),
        onSocketError: onSocketError.bind(this),
        onSocketClose: onSocketClose.bind(this),
    };

    this._listen();
}

function Server$_listen() {
    var listener, bound;

    bound = this._bound;
    listener = this.listener = net.createServer().listen(this.port);
    listener.on('listening', bound.onListening);
    listener.on('connection', bound.onConnection);
    listener.on('close', bound.onClose);
    listener.on('error', bound.onError);
}

function Server$send(client, opcode, packet, encrypted) {
    var p;

    //console.log('[SERVER][S->C] '+ opcode.toString('16'));
    p = client.security.formatPacket(opcode, packet.getBytes(), encrypted);
    client.socket.write(p);

}

function Server$sendAll(opcode, packet, encrypted) {
    //if(Object.keys(this.clients).length) {
    //    console.log('[SERVER][ALL][S->C] '+ opcode.toString('16'));
    //}
    for(var key in this.clients) {
        var client, p;
        client = this.clients[key];
        p = client.security.formatPacket(opcode, packet.getBytes(), encrypted);
        client.socket.write(p);
    };
}

function Server$_processData(data, length, client) {
    var pointer = 0;
    var tmpLength = data.length;
    var buffers = [];
    var bufferCount = 0;

    var totalBuffer = {};
    totalBuffer = data;

    if (this._stored.length > 0) {
        totalBuffer = new Buffer(this._stored.length + length);
        this._stored.buffer.copy(totalBuffer);
        data.copy(totalBuffer, this._stored.length);
        tmplength = this._stored.length + length;
        this._stored.length = 0;
    }
    else {
        totalBuffer = data;
    }

    while (tmpLength > 0) {
        var encrypted = false;
        var realsize = 0;
        var packetsize = totalBuffer[pointer + 1] << 8 | totalBuffer[pointer];
        if ((packetsize & 0x8000) > 0) {
            packetsize &= 0x7fff;
            realsize = packetsize;
            encrypted = true;
            packetsize = 2 + client.security.getOutputLength(packetsize + 4);
        }
        else {
            packetsize += 6;
        }

        if (packetsize > tmpLength) {
            this._stored.buffer = new Buffer(tmpLength);
            totalBuffer.copy(this._stored.buffer, 0, pointer);
            this._stored.length = tmpLength;
            tmpLength = 0;
        }
        else {
            var currentBuffer = new Buffer(packetsize);
            totalBuffer.copy(currentBuffer, 0, pointer, pointer + packetsize);
            var tmp = {
                size: packetsize,
                buffer: currentBuffer,
                encry: encrypted,
                real: realsize
            };

            buffers.push(tmp);
            bufferCount++;
            pointer += packetsize;
            tmpLength -= packetsize;

        }
    }

    if (bufferCount > 0) {
        this._process(buffers, bufferCount, client);
    }
}

function Server$_process(buffers, length, client) {
    for (var i = 0; i < length; i++) {
        if (buffers[i].encry) {
            var decrypted = client.security.decode(buffers[i].buffer, 2, buffers[i].size - 2);
            var real = new Buffer(2 + buffers[i].size);
            real.writeUInt16LE(buffers[i].real, 0);
            decrypted.copy(real, 2);
            var p = new PacketReader(real);
            p.encrypted = true;
            this._handlePackets(p, client);
        }
        else {
            var p = new PacketReader(buffers[i].buffer);
            p.encrypted = false;
            this._handlePackets(p, client);
        }
    }
}

function Server$_handlePackets(packet, client) {
    console.log('[SERVER][C->S] ' + packet.opcode.toString('16'));
    if (packet.opcode === 0x5000 || packet.opcode === 0x9000) {
        this._handshake(packet, client);
    } else {
        this.emit('packet', packet, client);
    }
}

function Server$_handshake(packet, client) {
    var responsePackets;
    responsePackets = client.security.handshake(packet);
    if(responsePackets) {
        for (var i = 0; i < responsePackets.length; i++) {
            this.send(client, responsePackets[i].opcode, responsePackets[i].packet, responsePackets[i].encrypted);
        };
    }
}

function onListening() {
    this.emit('listening', this.port);
}

function onConnection(socket) {
    var client, socketIndex, bound;

    bound = this._bound;

    client = new Object(); 
    client.socket = socket;
    client.security = new Security();
    client.state = this._bot.enums.clientState.OFFLINE;
    client.packetHoldList = [];

    socketIndex = socket.remoteAddress + ':' + socket.remotePort;

    this.clients[socketIndex] = client;

    socket.on('readable', function () {
        bound.onSocketReadable(client);
    });
    socket.on('error', function (error) {
        bound.onSocketError(error, client);
    });
    socket.on('close', function (hadError) {
        bound.onSocketClose(hadError, socket);
    });

    //Generate and send security to client
    var response;
    response = client.security.generateSecurity(false, false, false);
    this.send(client, 0x5000, response, false);

    //Emit
    this.emit('connection', client);
}

function onClose(hadError, client) {
    console.log('Server close', hadError);
    this.emit('close', hadError);
}

function onError(error) {
    console.log('Server error', error);
    this.emit('error', error);
}

function onSocketReadable(client) {
    var chunk;

    if (client.socket) {
        chunk = client.socket.read();
    }
    
    if (chunk) {
        this._processData(chunk, chunk.length, client);
    }
}

function onSocketError(error, client) {
    console.log('Server socket error', error);
    this.emit('socketError', error, client);
}

function onSocketClose(hadError, socket) {
    //Remove client from clients object
    for(var key in this.clients) {
        if(this.clients[key].socket == socket) {
            this.clients[key].socket.destroy();
            delete this.clients[key];
        }
    }

    console.log('Server socket close', hadError);
    this.emit('socketClose', hadError);
}



