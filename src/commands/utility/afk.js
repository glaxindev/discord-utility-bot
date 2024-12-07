const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors, links } = require('../../config.js');
const schema = require('../../schemas/AfkSchema.js');

class Afk extends Command {
    constructor(client) {
        super(client, {
            name: 'afk',
            description: {
                content: 'Sets your status to afk globally or in a specific server!',
                examples: ['afk', 'afk <reason>'],
                usage: 'afk [reason]',
            },
            category: 'utility',
            aliases: [],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'reason',
                    description: 'The reason for being afk!',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        });
    }

    async run(client, ctx, args) {
        try {
            let reason;
            let author;
            if (ctx.isInteraction) {
                reason = ctx.interaction.options.data[0]?.value || null;
                author = ctx.interaction.user;
            } else {
                reason = args.join(' ') || null;
                author = ctx.author;
            };

            if (reason?.length > 100) {
                return errorEmbed(ctx, "The reason can't be longer than 100 characters!", "send");
            };

            if (!reason || reason === null) reason = "I am afk!";
            const data = await schema.findOne({ userID: author.id });
            if (data) {
                return errorEmbed(ctx, "You are already afk, please try again!", "send");
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('global')
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Afk Globally')
                        .setEmoji(emojis.dot),
                    new ButtonBuilder()
                        .setCustomId('server')
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Afk here only')
                        .setEmoji(emojis.dot),
                );

                const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        // .setCustomId('global')
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Join our support server!')
                        .setURL(links.supportserver)
                        .setEmoji(emojis.info),
                );

            const embed = new EmbedBuilder()
                .setColor(colors.main)
                .setAuthor({
                    name: "AFK System",
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`${emojis.dot} **Please choose your afk style from the buttons below:**`);

            const msg = await ctx.send({
                embeds: [embed],
                components: [row],
            });

            const filter = i => i.user.id === author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'global') {
                    await schema.create({
                        guildID: ctx.guild.id,
                        userID: author.id,
                        reason: reason,
                        timestamp: Date.now(),
                        global: true,
                    });
                    await i.update({
                        embeds: [
                            embed.setDescription(`${emojis.success} **You are now afk globally on discord!**`)
                        ],
                        components: [row1],
                    });
                } else if (i.customId === 'server') {
                    await schema.create({
                        guildID: ctx.guild.id,
                        userID: author.id,
                        reason: reason,
                        timestamp: Date.now(),
                        global: false,
                    });
                    await i.update({
                        embeds: [embed.setDescription(`${emojis.success} **You are now afk in this server!**`)],
                        components: [row1],
                    });
                };
            });
        } catch (err) {
            errorEmbed(ctx, "There was an error while executing this command!", "send");
            console.log(err);
        }
    }
}

module.exports = Afk;