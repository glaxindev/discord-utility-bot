const { GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.js');
const RhytonClient = require('./structures/Client.js');

const {
    GuildMembers,
    MessageContent,
    GuildMessages,
    Guilds,
    GuildMessageTyping,
} = GatewayIntentBits;

const clientOptions = {
    intents: [
        Guilds,
        GuildMessages,
        MessageContent,
        GuildMembers,
        GuildMessageTyping,
    ],
    partials: [Partials.User, Partials.Message, Partials.Reaction, Partials.Channel],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
    },
    restRequestTimeout: 20000,
    shards: "auto",
};

const client = new RhytonClient(clientOptions);
client.start(config.token);

module.exports = client;