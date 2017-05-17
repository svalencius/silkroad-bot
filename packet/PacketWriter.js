var $PacketWriter = PacketWriter.prototype;
$PacketWriter.writeByte = PacketWriter$writeByte;
$PacketWriter.writeWord = PacketWriter$writeWord;
$PacketWriter.writeDWord = PacketWriter$writeDWord;
$PacketWriter.writeQWord = PacketWriter$writeQWord;
$PacketWriter.writeString = PacketWriter$writeString;
$PacketWriter.writeFloat = PacketWriter$writeFloat;
$PacketWriter.setPointer = PacketWriter$setPointer;
$PacketWriter.resetPointer = PacketWriter$resetPointer;
$PacketWriter.getBytes = PacketWriter$getBytes;

module.exports = PacketWriter;

function PacketWriter(buffer) {
    this.buffer = new Buffer(4096);
    this.pointer = 0;
    this.size = 0;
    
    if (buffer) {
        buffer.copy(this.buffer);
        this.pointer = this.size = buffer.length;
    }
}

function PacketWriter$writeByte(b) {
    this.buffer.writeUInt8(b, this.pointer);
    if (this.pointer == this.size) {
        this.pointer += 1;
        this.size += 1;
    } else {
        this.pointer += 1;
    }
}

function PacketWriter$writeWord(w) {
    this.buffer.writeUInt16LE(w, this.pointer);
    if (this.pointer == this.size) {
        this.pointer += 2;
        this.size += 2;
    } else {
        this.pointer += 2;
    }
}

function PacketWriter$writeDWord(dw) {
    this.buffer.writeUInt32LE(dw, this.pointer);
    if (this.pointer == this.size) {
        this.pointer += 4;
        this.size += 4;
    } else {
        this.pointer += 4;
    }
}

function PacketWriter$writeQWord(qw) {
    this.buffer.writeDoubleLE(qw, this.pointer);
    if (this.pointer == this.size) {
        this.pointer += 8;
        this.size += 8;
    } else {
        this.pointer += 8;
    }
}

function PacketWriter$writeString(str) {
    var test = new String(str);
    var len = test.length; 
    this.writeWord(len);
    this.buffer.write(str, this.pointer);
    if (this.pointer == this.size) {
        this.pointer += len;
        this.size += len;
    } else {
        this.pointer += len;
    }
}

function PacketWriter$writeFloat(f) {
    this.buffer.writeFloatLE(f, this.pointer);
    if (this.pointer == this.size) {
        this.pointer += 4;
        this.size += 4;
    } else {
        this.pointer += 4;
    }
}

function PacketWriter$setPointer(i) {
    this.pointer = i;
}

function PacketWriter$resetPointer() {
    this.pointer = this.size;
}

function PacketWriter$getBytes() {
    return this.buffer.slice(0, this.size);
}
