const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Context, Event } = require('../../structures/index.js');
const schema = require('../../schemas/AfkSchema.js');
const { colors, emojis, links } = require('../../config.js');

class AfkEvent extends Event {
    constructor(client, file) {
        super(client, file, {
            name: 'messageCreate',
        });
    }
    async run(message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        const data = await schema.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
        });

        if (!data) return;

        if (data.global === true) {
            await schema.findOneAndDelete({
                guildID: message.guild.id,
                userID: message.author.id,
            });

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "AFK System"
                })
                .setColor(colors.main)
                .setDescription(`${emojis.success} **${message.author.tag}** is now no longer AFK!`);

                const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        // .setCustomId('global')
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Join our support server!')
                        .setURL(links.supportserver)
                        .setEmoji(emojis.info),
                );
        };
    }
}

module.exports = AfkEvent;