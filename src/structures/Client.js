const {
    ApplicationCommandType,
    Client,
    Collection,
    EmbedBuilder,
    PermissionsBitField,
    REST,
    Routes,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const Logger = require('./Logger.js');
const config = require('../config.js');
const loadPlugins = require('../plugin/index.js');
const modules = require('../modules/modules.js');
const connectdb = require('../handlers/mongodb.js');
const Dokdo = require('dokdo');

class RhytonClient extends Client {
    constructor(options) {
        super(options);
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldown = new Collection();
        this.userSettings = new Collection();
        this.config = config;
        this.logger = new Logger();
        this.modules = modules;
        this.colors = config.colors;
        this.body = [];
    }

    embed() {
        return new EmbedBuilder();
    }

    async start(token) {
        this.loadCommands();
        this.logger.info(`[CLIENT] Successfully loaded commands!`);
        this.loadEvents();
        this.logger.info(`[CLIENT] Successfully loaded events!`);
        loadPlugins(this);

        if (this.config.mongodb.connect === true) {
            await connectdb();
        };
        
        this.dokdo = new Dokdo(this, {
            prefix: config.prefix,
            owners: config.owners,
            aliases: ["jsk"],
          });

        await this.login(token);
    }

    loadCommands() {
        const commandsPath = fs.readdirSync(path.join(__dirname, '../commands'));
        commandsPath.forEach((dir) => {
            const commandFiles = fs
                .readdirSync(path.join(__dirname, `../commands/${dir}`))
                .filter((file) => file.endsWith('.js'));
            commandFiles.forEach(async (file) => {
                const cmd = require(`../commands/${dir}/${file}`);
                const command = new cmd(this, file);
                command.category = dir;
                command.file = file;
                this.commands.set(command.name, command);
                if (command.aliases.length !== 0) {
                    command.aliases.forEach((alias) => {
                        this.aliases.set(alias, command.name);
                    });
                }
                if (command.slashCommand) {
                    const data = {
                        name: command.name,
                        description: command.description.content,
                        type: ApplicationCommandType.ChatInput,
                        options: command.options ? command.options : null,
                        name_localizations: command.nameLocalizations
                            ? command.nameLocalizations
                            : null,
                        description_localizations: command.descriptionLocalizations
                            ? command.descriptionLocalizations
                            : null,
                    };
                    const json = JSON.stringify(data);
                    this.body.push(JSON.parse(json));
                }
            });
        });
        this.once('ready', async () => {
            const applicationCommands = Routes.applicationCommands(this.config.clientId);
            try {
                const rest = new REST({ version: '9' }).setToken(this.config.token ?? '');
                // await rest.put(applicationCommands(this.config.clientId), { body: [] });
                await rest.put(applicationCommands, { body: this.body });

                this.logger.info(`[CLIENT] Successfully loaded slash commands!`);
            } catch (error) {
                this.logger.error(error);
            }
        });
    }

    loadEvents() {
        const eventsPath = fs.readdirSync(path.join(__dirname, '../events'));
        eventsPath.forEach((dir) => {
            const events = fs
                .readdirSync(path.join(__dirname, `../events/${dir}`))
                .filter((file) => file.endsWith('.js'));
            events.forEach(async (file) => {
                const event = require(`../events/${dir}/${file}`);
                const evt = new event(this, file);
                this.on(evt.name, (...args) => evt.run(...args));
            });
        });
    }
}

module.exports = RhytonClient;