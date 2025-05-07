const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const Handler = require('./src/handler/Handler')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    presence: {
        status: 'online'
    }
});
client.commands = new Collection();

const handler = new Handler(client);
handler.handleModules();

client.login(process.env.TOKEN)
    .catch(err => console.error(err));