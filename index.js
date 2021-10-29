// https://discord.com/oauth2/authorize?client_id=843334175725322250&scope=bot

// Dependencies
const Discord = require('discord.js');
const { JSDOM } = require('jsdom');
const phantom = require('phantom');
require('dotenv').config({ path: './process.env' });

// Function to get time since last ranked game.
const sinceShangLuGame = async (channel) => {

	// Get HTML from op.gg/shanglu
	const instance = await phantom.create();
	const page = await instance.createPage();
	console.log('Requesting HTML');
	await page.on('onResourceRequested', function(requestData) {
		console.info('Requesting', requestData.url);
	});
	console.log('Recieved HTML');
	// const status = await page.open('https://na.op.gg/summoner/userName=shang+lu');
	await page.open('https://na.op.gg/summoner/userName=shang+lu');
	const data = await page.property('content');
	await instance.exit();

	// Convert HTML to JSDOM object
	const dom = new JSDOM(data);
	const { document } = dom.window;

	// Select the info we are interested in
	const gameTypes = document.querySelectorAll('div.GameType');

	// Loop through available games to find last Ranked Solo played
	for (let i = 0; i < gameTypes.length; i++) {
		const gameType = gameTypes[i];
		const gamemode = gameType.textContent.trim();
		if (gamemode === 'Ranked Solo') {
			const timeSince = gameType.nextSibling.nextSibling.textContent;
			console.log(timeSince);
			channel.send('Shang Lu last played ' + timeSince + ' 😡');
			return;
		}
	}

	// If no ranked solo games were found..
	console.log('No ranked games found');
	channel.send('No ranked games found' + ' 😡😡😡😡😡😡');
};

// Login to discord
const client = new Discord.Client();
client.login(process.env.TOKEN);

// Respond to !shanglu
client.on('message', function(msg) {
	if (msg.content === '!shanglu') {
		const channel = msg.channel;
		const time = sinceShangLuGame(channel);
		console.log(time);
		channel.send(time);
	}
});

