const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const client = new Client({intents: [Object.keys(GatewayIntentBits)]});
const mongoose = require('mongoose')
const config = require("./config")
        
fs.readdir('./events/', (err, files) => {
	if (err) return console.error(err);
	files.forEach(file => {
		const event = require(`./events/${file}`);
		const eventName = file.split('.')[0];
		client.on(eventName, event.bind(null, client));
	});
});

client.commands = new Collection();

fs.readdir('./commands/', (err, files) => {
	if (err) return console.error(err);
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		const props = require(`./commands/${file}`);
		const commandName = file.split('.')[0];
		client.commands.set(commandName, props);
	});
});

mongoose.connect(config.mongodbConnectionURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

mongoose.connection.once('open', function () {
}).on('error', function (error) {
  console.log('Base de donnée non connecté', error)
})

client.login(config.botToken);



// ANTI CRASH
process.on("unhandledRejection", (reason, p) => {
	const a = [0, 400, 500, 10062, 10008, 50035, 40032, 50013, 40002, 200000]
	const m = ["Message ID not found", "INTERACTION_TIMEOUT", "Invalid Intent"]
	if (m.includes(reason.message)) return;
	if (a.includes(reason.code)) return;
	console.log(reason, p);
});