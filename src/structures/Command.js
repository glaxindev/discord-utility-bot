class Command {
    constructor(client, options) {
        this.client = client;
        this.name = options.name;
        this.nameLocalizations = options.nameLocalizations;
        this.description = {
            content: options.description
                ? options.description.content || 'No description provided'
                : 'No description provided',
            usage: options.description
                ? options.description.usage || 'No usage provided'
                : 'No usage provided',
            examples: options.description ? options.description.examples || [''] : [''],
        };
        this.descriptionLocalizations = options.descriptionLocalizations;
        this.aliases = options.aliases || [];
        this.cooldown = options.cooldown || 3;
        this.args = options.args || false;
        this.permissions = {
            dev: options.permissions ? options.permissions.dev || false : false,
        };
        this.slashCommand = options.slashCommand || false;
        this.options = options.options || [];
        this.category = options.category || 'general';
    }

    async run(_client, _message, _args, _user) {
        return await Promise.resolve();
    }
}

module.exports = Command;