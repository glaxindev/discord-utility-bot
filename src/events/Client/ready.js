const config = require('../../config.js');
const { Event } = require('../../structures/index.js');
const { WebhookClient, WebhookType, ActivityType } = require('discord.js');
const User = require('../../schemas/UserPremium.js');

class Ready extends Event {
    constructor(client, file) {
        super(client, file, {
            name: 'ready',
        });
    }

    async run() {
        this.client.logger.success(`[CLIENT] ${this.client.user?.tag} is started and ready!`);
        // set bot presence in discord.js v14
        this.client.user.setPresence({
            activities: [{
                name: `${this.client.users.cache.size} users in ${this.client.guilds.cache.size} servers`,
                type: ActivityType.Watching
            }],
            status: 'online'
        });

        const users = await User.find();
        for (let user of users) {
          this.client.userSettings.set(user.Id, user);
        }

        // require the premium handler
        require("../../handlers/premium.js")(this.client);
    }
}

module.exports = Ready;