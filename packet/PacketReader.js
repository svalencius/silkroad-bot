var $PacketReader = PacketReader.prototype;
$PacketReader.readByte = PacketReader$readByte;
$PacketReader.readWord = PacketReader$readWord;
$PacketReader.readDWord = PacketReader$readDWord;
$PacketReader.readQWord = PacketReader$readQWord;
$PacketReader.readString = PacketReader$readString;
$PacketReader.readFloat = PacketReader$readFloat;
$PacketReader.readBool = PacketReader$readBool;
$PacketReader.readByteArray = PacketReader$readByteArray;
$PacketReader.rawBuffer = PacketReader$rawBuffer;

module.exports = PacketReader;

function PacketReader(data) {
    var buffer;
    
    buffer = this.buffer = data;
    this.size = buffer.readUInt16LE(0);
    this.opcode = buffer.readUInt16LE(2);
    this.encrypted = false;
    this.securityCount = buffer.readUInt8(4);
    this.securityCRC = buffer.readUInt8(5);
    this.pointer = 6;
}

function PacketReader$readByte() {
    var tmp = this.buffer.readUInt8(this.pointer);
    this.pointer++;
    return tmp;
}

function PacketReader$readWord() {
    var tmp = this.buffer.readUInt16LE(this.pointer);
    this.pointer += 2;
    return tmp;
}

function PacketReader$readDWord() {
    var tmp = this.buffer.readUInt32LE(this.pointer);
    this.pointer += 4;
    return tmp;
}

function PacketReader$readQWord() {
    var tmp = this.buffer.readDoubleLE(this.pointer);
    this.pointer += 8;
    return tmp;
}

function PacketReader$readString(ascii) {
    if (ascii) {
        var len = this.readWord();
        var str = this.buffer.toString('utf8', this.pointer, this.pointer + len);
        this.pointer += len;
        return str;
    }
}

function PacketReader$readFloat() {
    var tmp = this.buffer.readFloatLE(this.pointer);
    this.pointer += 4;
    return tmp;
}

function PacketReader$readBool() {
    var tmp = this.buffer.readUInt8(this.pointer);
    if (tmp == 1) {
        return true;
    }
    else {
        return false;
    }
}

function PacketReader$readByteArray(size) {
    return this.buffer.slice(this.pointer, this.pointer + size);
}

function PacketReader$rawBuffer() {
    return this.buffer;
}
