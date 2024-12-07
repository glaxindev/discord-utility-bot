const { Command } = require('../../structures/index.js');
const { errorEmbed, missingUserPermissions } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.js');
const { emojis, colors } = config;
const Schema = require('../../schemas/Prefix.js');

class Prefix extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            description: {
                content: 'Change/Reset the prefix of the bot!',
                examples: ['prefix', 'prefix <new prefix>'],
                usage: 'prefix <new prefix>',
            },
            category: 'config',
            aliases: ['p'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'set',
                    description: 'Set a new prefix for this server!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'prefix',
                            description: 'The new prefix for this server!',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'reset',
                    description: 'Reset the prefix to the default one!',
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
        });
    }

    async run(client, ctx, args) {
        try {
            if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return missingUserPermissions(ctx, "Manage Server", "send");
            };
            let subCommand;
            let newPrefix;
            if (ctx.isInteraction) {
                subCommand = ctx.interaction.options.data[0].name;
                newPrefix = ctx.interaction.options.data[0].options[0]?.value.toString();
            }
            else {
                subCommand = args[0];
                newPrefix = args[1];
            };
    
            let author;
            if (ctx.isInteraction) {
                author = ctx.interaction.user;
            } else {
                author = ctx.author;
            };
    
            switch (subCommand) {
                case 'set': {
                    if (!newPrefix) {
                        return errorEmbed(ctx, "You need to provide a new prefix!", "send");
                    };
    
                    if (newPrefix.length > 5) {
                        return errorEmbed(ctx, "The prefix can't be longer than 5 characters!", "send");
                    };
    
                    if (newPrefix === Schema.findOne({ guildID: ctx.guild.id }).prefix) {
                        return errorEmbed(ctx, "This is already the current prefix!", "send");
                    };
    
                    const confirmButton = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(emojis.success);
    
                    const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(emojis.error);
    
                    const row = new ActionRowBuilder()
                    .addComponents(confirmButton, cancelButton);
    
                    const embed = new EmbedBuilder()
                    .setColor(colors.main)
                    .setAuthor({
                        name: 'Prefix System',
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(`${emojis.dot} Are you sure you want to change the prefix to \`${newPrefix}\`?`)
                    .setFooter({
                        text: `Requested by ${author.tag}`,
                        iconURL: author.displayAvatarURL({ dynamic: true }),
                    });
    
                    const msg = await ctx.sendMessage({
                        embeds: [embed],
                        components: [row],
                    });
    
                    const filter = i => i.user.id === author.id;
                    const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
    
                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        if (i.customId === 'confirm') {
                            // Update the prefix in the database
                            const data = await Schema.findOneAndUpdate({ guildID: ctx.guild.id }, { prefix: newPrefix }, { new: true });
                            if (!data) {
                                const newData = new Schema({ guildID: ctx.guild.id, prefix: newPrefix });
                                await newData.save();
                            };
            
                            const embed = new EmbedBuilder()
                            .setColor(colors.main)
                            .setDescription(`${emojis.dot} **The prefix for this server is now** \`${newPrefix}\``);
                            await i.editReply({
                                embeds: [embed],
                                components: [],
                            }).catch(() => {});
                            collector.stop();
                        } else if (i.customId === 'cancel') {
                            const disabledRow = new ActionRowBuilder()
                            .addComponents(confirmButton.setDisabled(true), cancelButton.setDisabled(true));
    
                            await i.editReply({
                                content: `Cancelled`,
                                embeds: [embed],
                                components: [disabledRow],
                            }).catch(() => {});
                            collector.stop();
                        };
                    });
    
                    collector.on('end', async (collected, reason) => {
                        if (reason === 'time') {
                            const newRow = new ActionRowBuilder()
                            .addComponents(confirmButton.setDisabled(true), cancelButton.setDisabled(true));
    
                            await msg.edit({
                                content: `Cancelled`,
                                embeds: [embed],
                                components: [newRow],
                            }).catch(() => {});
                            collector.stop();
                        };
                    });
    
                    break;
                }
                case 'reset': {
                    const confirmButton = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(emojis.success);
    
                    const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(emojis.error);
    
                    const row = new ActionRowBuilder()
                    .addComponents(confirmButton, cancelButton);
    
                    const embed = new EmbedBuilder()
                    .setColor(colors.main)
                    .setAuthor({
                        name: 'Prefix System',
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(`${emojis.dot} Are you sure you want to reset the server prefix?`)
                    .setFooter({
                        text: `Requested by ${author.tag}`,
                        iconURL: author.displayAvatarURL({ dynamic: true }),
                    });
    
                    const msg = await ctx.sendMessage({
                        embeds: [embed],
                        components: [row],
                    });
    
                    const filter = i => i.user.id === author.id;
                    const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
    
                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        if (i.customId === 'confirm') {
                            // Update the prefix in the database
                            const data = await Schema.findOneAndUpdate({ guildID: ctx.guild.id }, { prefix: config.prefix }, { new: true });
                            if (!data) {
                                const newData = new Schema({ guildID: ctx.guild.id, prefix: config.prefix });
                                await newData.save();
                            };
            
                            const embed = new EmbedBuilder()
                            .setColor(colors.main)
                            .setDescription(`${emojis.dot} **The prefix for this server is now** \`${config.prefix}\``);
                            await i.editReply({
                                embeds: [embed],
                                components: [],
                            }).catch(() => {});
                            collector.stop();
                        } else if (i.customId === 'cancel') {
                            const disabledRow = new ActionRowBuilder()
                            .addComponents(confirmButton.setDisabled(true), cancelButton.setDisabled(true));
    
                            await i.editReply({
                                content: `Cancelled`,
                                embeds: [embed],
                                components: [disabledRow],
                            }).catch(() => {});
                            collector.stop();
                        };
                    });
    
                    collector.on('end', async (collected, reason) => {
                        if (reason === 'time') {
                            const newRow = new ActionRowBuilder()
                            .addComponents(confirmButton.setDisabled(true), cancelButton.setDisabled(true));
    
                            await msg.edit({
                                content: `Cancelled`,
                                embeds: [embed],
                                components: [newRow],
                            }).catch(() => {});
                            collector.stop();
                        };
                    });

                    break;
                }
                default: {
                    let p = config.prefix;
                    const data = await Schema.findOne({ guildID: ctx.guild.id });
                    if (data) {
                        p = data.prefix;
                    };
    
                    const embed = new EmbedBuilder()
                    .setColor(colors.main)
                    .setDescription(`${emojis.dot} **The prefix for this server is** \`${p}\``);
    
                    ctx.sendMessage({
                        embeds: [embed],
                    });
                }
            }
        } catch (err) {
            console.log(err);
            errorEmbed(ctx, "There was an error while executing this command!", "send");
        }
    }
}

module.exports = Prefix;