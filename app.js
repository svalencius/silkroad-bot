var Bot = require('./Bot');

var bot = Bot.create({ host: '127.0.0.1', port: 15809, locale: 22, version: 206 }); // Configure server settings

bot.start();

bot.on('serverListening', function(port) {
    console.log('Bot is waiting game client connection on port: ', port);
});

bot.on('clientError', function(error){
    console.log('Client error', error);
});

bot.on('clientClose', function(hadError){
    console.log('Client close', hadError);
});

bot.on('serverList', function(serverList){
    console.log(serverList);
    bot.sendLogin('username', 'password', 1); // Enter login details
});

bot.on('loginError', function(error){
    console.log(error);
});

bot.on('loginResponse', function(data){
    console.log(data);
});

bot.on('gameLoginResponse', function(data){
    console.log(data);
});

bot.on('charList', function(charList){
    console.log(charList);
    bot.selectCharacter('TheVeryCharacter'); // Choose your character
});

bot.on('charListError', function(error){
    console.log(error);
});

bot.on('characterSelected', function(error){
    console.log('Character selected!');
});

bot.on('charData', function(character){
    console.log('Successfully got chardata!');
});