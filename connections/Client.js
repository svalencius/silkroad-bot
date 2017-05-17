var util = require('util');
var fs = require('fs');
var hexdump = require('hexdump-nodejs');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var Security = require('../security/Security');
var PacketReader = require('../packet/PacketReader');
var PacketWriter = require('../packet/PacketWriter');

module.exports = {
    connect: connect,
    Client: Client
};

function connect(options) {
    return new Client(options);
}

util.inherits(Client, EventEmitter);

var $Client = Client.prototype;
$Client._connect = Client$_connect;
$Client.end = Client$end;
$Client.reconnect = Client$reconnect;
$Client.send = Client$send;
$Client._processData = Client$_processData;
$Client._process = Client$_process;
$Client._handlePackets = Client$_handlePackets;
$Client._handshake = Client$_handshake;

function Client(options) {
    EventEmitter.call(this);
    
    options = this.options = {
        host: options && options.host,
        port: options && options.port || 15779
    };

    
    this.connection = null;

    this.security = null;
    
    this._stored = {
        buffer: null,
        length: 0,
    };
    
    this._bound = {
        onError: onError.bind(this),
        onClose: onClose.bind(this),
        onReadable: onReadable.bind(this)
    };

    this._connect(options);
}

function Client$_connect(options) {
    var conn, bound;

    this.security = new Security();

    bound = this._bound;
    conn = this.connection = net.connect(options);
    conn.on('error', bound.onError);
    conn.on('close', bound.onClose);
    conn.on('readable', bound.onReadable);
}

function Client$end() {
    this.connection.end();
    this.connection = null;
}

function Client$reconnect(options){
    if(this.connection){
        this.connection.end();
        this.connection = null;
    }

    this._connect(options);

}

function Client$send(opcode, packet, encrypted) {
    var packet;

    console.log('[CLIENT][C->S] '+ opcode.toString('16'));
    packet = this.security.formatPacket(opcode, packet.getBytes(), encrypted);
    this.connection.write(packet);
}

function Client$_processData(data) {
    console.log('PROCESS DATA CHECKPOINT');
    var pointer = 0;
    var tmpLength = data.length;
    var buffers = [];
    var totalBuffer;
    fs.appendFile('log/client.log', '================================\n');
    fs.appendFile('log/client.log', 'tmpLength: ' + tmpLength + '\n');

    if (this._stored.buffer.length > 0) {
        fs.appendFile('log/client.log', 'stored: ' + this._stored.buffer.length + '\n');
        totalBuffer = new Buffer(this._stored.buffer.length + data.length);
        this._stored.buffer.copy(totalBuffer);
        data.copy(totalBuffer, this._stored.buffer.length);
        tmpLength = this._stored.buffer.length + data.length;
        this._stored.length = 0;
    }

    while (tmpLength > 0) {
        var encrypted = false;
        var realSize = 0;
        var packetSize = data[pointer + 1] << 8 | data[pointer];
        if ((packetSize & 0x8000) > 0) {
            packetSize &= 0x7fff;
            realSize = packetSize;
            encrypted = true;
            packetSize = 2 + this.security.getOutputLength(packetSize + 4);
        }
        else {
            packetSize += 6;
        }

        if (packetSize > tmpLength) {
            this._stored.buffer = new Buffer(tmpLength);
            data.copy(this._stored.buffer, 0, pointer);
            this._stored.buffer.length = tmpLength;
            tmpLength = 0;
        }
        else {
            var currentBuffer = new Buffer(packetSize);
            data.copy(currentBuffer, 0, pointer, pointer + packetSize);
            var tmp = {
                size: packetSize,
                buffer: currentBuffer,
                encry: encrypted,
                real: realSize
            };
            buffers.push(tmp);
            pointer += packetSize;
            tmpLength -= packetSize;

        }
    }

    for (var i = 0; i < buffers.length; i++) {
        fs.appendFile('log/client.log', 'buffer size: ' + buffers[i].size + '\n');
        fs.appendFile('log/client.log', 'buffer encry: ' + buffers[i].encry + '\n');
        fs.appendFile('log/client.log', 'buffer real size: ' + buffers[i].real + '\n');
        fs.appendFile('log/client.log', '--------------------------\n');
        
    };
    fs.appendFile('log/client.log', '================================\n');

    if (buffers.length > 0) {
        this._process(buffers);
    }
}

function Client$_process(buffers) {
    console.log('PROCESS CHECKPOINT');
    for (var i = 0; i < buffers.length; i++) {
        if (buffers[i].encry) {
            var decrypted = this.security.decode(buffers[i].buffer, 2, buffers[i].size - 2);
            var real = new Buffer(2 + buffers[i].size);
            real.writeUInt16LE(buffers[i].real, 0);
            decrypted.copy(real, 2);
            var p = new PacketReader(real);
            p.encrypted = true;
            fs.appendFile('log/client.log', '================================\n');
            fs.appendFile('log/client.log', 'packet: ' + p.opcode.toString('16') + '\n');
            fs.appendFile('log/client.log', '================================\n');
            this._handlePackets(p);
        }
        else {
            var p = new PacketReader(buffers[i].buffer);
            p.encrypted = false;
            fs.appendFile('log/client.log', '================================\n');
            fs.appendFile('log/client.log', 'packet: ' + p.opcode.toString('16') + '\n');
            fs.appendFile('log/client.log', '================================\n');
            this._handlePackets(p);
        }
    }
}

function Client$_handlePackets(packet) {
    console.log('[CLIENT][S->C] ' + packet.opcode.toString('16'));
    if (packet.opcode === 0x5000) {
        this._handshake(packet);
    } else {
        this.emit('packet', packet);
    }
}

function Client$_handshake(packet) {
    var responsePackets;

    responsePackets = this.security.handshake(packet);
    if(responsePackets) {
        for (var i = 0; i < responsePackets.length; i++) {
            this.send(responsePackets[i].opcode, responsePackets[i].packet, responsePackets[i].encrypted);
        };
    }
    
    /*
    var sec;
    
    sec = this.security;
    packet.pointer = 6;
    if (packet.size == 0x25) {
        console.log("Handshake starting");
        //this.send(0x5000, new PacketWriter(sec.handshakeE(packet)), false);
        console.log(new PacketWriter(sec.handshakeE(packet)));
    }
    else if (packet.size == 9) {
        this.connection.write(sec.handshake10(packet));
        
        var resp = new PacketWriter();
        resp.writeString("SR_Client");
        resp.writeByte(0);
        this.send(0x2001, resp, true);
        
    }
    */
}

function onError(error) {
    this.emit('error', error);
}

function onClose(hadError) {
    this.emit('close', hadError);
}

function onReadable() {
    var conn, chunk;
    
    conn = this.connection;
    if (conn) {
        chunk = this.connection.read();
    }

    if (chunk) {
        fs.appendFile('log/client.log', hexdump(chunk));
        this._processData(chunk);
    }
}





