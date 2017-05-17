module.exports = {
	calculateX: calculateX,
	calculateY: calculateY,
}

function calculateX(xSector, xOffset){
	return parseInt((xSector - 135) * 192 + xOffset / 10);
}

function calculateY(ySector, yOffset){
	return parseInt((ySector - 92) * 192 + yOffset / 10);
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };
}

if (typeof String.prototype.contains != 'function') {
    String.prototype.contains = function (str){
    	return this.indexOf(str) > -1;
    };
}