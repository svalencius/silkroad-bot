module.exports.clientState = {
	OFFLINE: 					{
		id: 	10,
		name: 	'Offline',
	},
	IDENTIFIED: 				{
		id: 	20,
		name: 	'Identified',
	},
	WAITING_LOGIN: 				{
		id: 	30,
		name: 	'Waiting login',
	},
	WAITING_CAPTCHA: 			{
		id: 	40,
		name: 	'Waiting captcha',
	},
	WAITING_CHAR_SELECTION: 	{
		id: 	50,
		name: 	'Waiting character selection',
	},
	LOADING_GAME_WORLD: 	{
		id: 	51,
		name: 	'Loading into game world',
	},
	IN_GAME: 					{
		id: 	60,
		name: 	'In game world',
	},
	TELEPORTING: 				{
		id: 70,
		name: 'Teleporting',
	}
};

module.exports.serverType = {
	GATEWAY_SERVER: 	"GatewayServer",
	AGENT_SERVER: 	"AgentServer",
};