const { Command } = require('../../structures/index.js');
const { errorEmbed, missingUserPermissions } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors } = require('../../config.js');
const IgnoreChannelSchema = require('../../schemas/IgnoreChannel.js');

class IgnoreChannel extends Command {
    constructor(client) {
        super(client, {
            name: 'ignorechannel',
            description: {
                content: 'ignorechannel <add/remove/list/reset>',
                examples: ['ignorechannel add #channel', 'ignorechannel remove #channel', 'ignorechannel list', 'ignorechannel reset'],
                usage: '<add/remove/list/reset>',
            },
            category: 'config',
            aliases: [],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'add',
                    description: 'Add a channel to the ignore list!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'The channel to add to the ignore list!',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        }
                    ],
                },
                {
                    name: 'remove',
                    description: 'Remove a channel from the ignore list!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'The channel to remove from the ignore list!',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        }
                    ],
                },
                {
                    name: 'list',
                    description: 'List all ignored channels in this server!',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'reset',
                    description: 'Reset the ignored channels in this server!',
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
        });
    }

    async run(client, ctx, args) {
        try {
            await ctx.guild.channels.fetch();
            let subCommand;
            let channel;
            if (ctx.isInteraction) {
                subCommand = ctx.interaction.options.data[0].name;
                channel = ctx.guild.channels.cache.get(ctx.interaction.options.data[0].options[0]?.value);
            }
            else {
                subCommand = args[0];
                channel = ctx.message.mentions.channels.first();
                if (!channel) channel = ctx.guild.channels.cache.get(args[1]);
            };
    
            let author;
            if (ctx.isInteraction) {
                author = ctx.interaction.user;
            } else {
                author = ctx.author;
            };

            if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) return missingUserPermissions(ctx, "Manage Server", "send");

            switch (subCommand) {
                case 'add': {
                    await ctx.sendMessage({
                        embeds: [
                          new EmbedBuilder()
                          .setTitle(`**Adding channel to database...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });
                    
                    if (!channel) return errorEmbed(ctx, "Please provide a channel to add to the ignore list!", "edit");
                    if (channel.type !== ChannelType.GuildText) return errorEmbed(ctx, "Please provide a text channel to add to the ignore list!", "edit");
                    let data = await IgnoreChannelSchema.findOne({ guildId: ctx.guild.id });
                    if (data) {
                        if (data.channelIds.includes(channel.id)) {
                            errorEmbed(ctx, "This channel is already in the ignore list!", "edit");
                        } else {
                            data.channelIds.push(channel.id);
                            data.save();

                            
                    const embed = new EmbedBuilder()
                      .setColor(colors.main)
                      .setAuthor({
                        name: `Ignore Channel`,
                        iconURL: client.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      })
                      .setDescription(
                        `${emojis.success} Added ${channel} to my ignore list for this server!`
                      );

                    await ctx.editMessage({
                      embeds: [embed],
                    });
                        };
                    } else {
                        let channelIds = [];
                        channelIds.push(channel.id);

                        data = new IgnoreChannelSchema({
                            guildId: ctx.guild.id,
                            channelIds: channelIds,
                            addedBy: author.id,
                        });
                        data.save();
                        
                    const embed = new EmbedBuilder()
                      .setColor(colors.main)
                      .setAuthor({
                        name: `Ignore Channel`,
                        iconURL: client.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      })
                      .setDescription(
                        `${emojis.success} Added ${channel} to my ignore list for this server!`
                      );

                    await ctx.editMessage({
                      embeds: [embed],
                    });
                    };
                    break;
                }
                case 'remove': {
                    await ctx.sendMessage({
                        embeds: [
                          new EmbedBuilder()
                          .setTitle(`**Removing channel from database...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });
                    
                    if (!channel) return errorEmbed(ctx, "Please provide a channel to remove from the ignore list!", "edit");
                    let data = await IgnoreChannelSchema.findOne({ guildId: ctx.guild.id });
                    if (data) {
                        if (!data.channelIds.includes(channel.id)) {
                            errorEmbed(ctx, "This channel is not in the ignore list!", "edit");
                        } else {
                            data.channelIds.splice(data.channelIds.indexOf(channel.id), 1);
                            data.save();

                            const embed = new EmbedBuilder()
                            .setColor(colors.main)
                            .setAuthor({
                                name: `Ignore Channel`,
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setDescription(`${emojis.success} Removed ${channel} from my ignore list for this server!`);
        
                            await ctx.editMessage({
                                embeds: [embed],
                            });
                        };
                    } else {
                        errorEmbed(ctx, "This channel is not in the ignore list!", "edit");
                    };
                    break;
                }
                case 'list': {
                    let data = await IgnoreChannelSchema.findOne({ guildId: ctx.guild.id });
                    if (!data || data.channelIds.length === 0) return errorEmbed(ctx, "There are no channels in the ignorechannel list!", "send");

                    let perPage = 10;
                    let page = 1;
                    let start = (page - 1) * perPage;
                    let end = start + perPage;
                    let arr = [];
                    data.channelIds.slice(start, end).forEach((id, i) => {
                        arr.push(`\`[${start + i + 1}]\` | [${id}](https://discord.com/channels/${ctx.guild.id}/${id}) | <#${id}>`);
                    });
                    
                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Ignore Channel`,
                            iconURL: client.user.displayAvatarURL({
                            dynamic: true,
                            }),
                        })
                        .setDescription(
                            `${arr.join('\n')}`
                        )
                        // .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({
                            text: `Page ${page} out of ${Math.ceil(data.channelIds.length / perPage)}`,
                            iconURL: author.displayAvatarURL({ dynamic: true }),
                        });

                        if (data.channelIds.length > perPage) {
                            const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId('previous')
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel('Previous')
                                .setDisabled(true)
                                .setEmoji(emojis.bot),
                                new ButtonBuilder()
                                .setCustomId('next')
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel('Next')
                                .setEmoji(emojis.bot),
                            );
                            
                            let filter = (interaction) => interaction.user.id === author.id;
                            let collector = ctx.channel.createMessageComponentCollector({
                                filter,
                                time: 60000,
                            });
                            collector.on('collect', async (interaction) => {
                                if (interaction.customId === 'next') {
                                    page++;
                                    start = (page - 1) * perPage;
                                    end = start + perPage;
                                    arr = [];
                                    data.channelIds.slice(start, end).forEach((id, i) => {
                                        arr.push(`\`[${start + i + 1}]\` | [${id}](https://discord.com/channels/${ctx.guild.id}/${id}) | <#${id}>`);
                                    });
                                    embed.setDescription(arr.join('\n'));
                                    embed.setFooter({
                                        text: `Page ${page} out of ${Math.ceil(data.channelIds.length / perPage)}`,
                                        iconURL: author.displayAvatarURL({ dynamic: true }),
                                    });
                                    if (page === Math.ceil(data.channelIds.length / perPage)) {
                                        row.components[0].setDisabled(false);
                                        row.components[1].setDisabled(true);
                                    } else {
                                        row.components[0].setDisabled(false);
                                        row.components[1].setDisabled(false);
                                    };
                                    await interaction.update({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                } else if (interaction.customId === 'previous') {
                                    page--;
                                    start = (page - 1) * perPage;
                                    end = start + perPage;
                                    arr = [];
                                    data.channelIds.slice(start, end).forEach((id, i) => {
                                        arr.push(`\`[${start + i + 1}]\` | [${id}](https://discord.com/channels/${ctx.guild.id}/${id}) | <#${id}>`);
                                    });
                                    embed.setDescription(arr.join('\n'));
                                    embed.setFooter({
                                        text: `Page ${page} out of ${Math.ceil(data.channelIds.length / perPage)}`,
                                        iconURL: author.displayAvatarURL({ dynamic: true }),
                                    });
                                    if (page === 1) {
                                        row.components[0].setDisabled(true);
                                        row.components[1].setDisabled(false);
                                    } else {
                                        row.components[0].setDisabled(false);
                                        row.components[1].setDisabled(false);
                                    };
                                    await interaction.update({
                                        embeds: [embed],
                                        components: [row],
                                    });
                                };
                            });
                            collector.on('end', async () => {
                                row.components[0].setDisabled(true);
                                row.components[1].setDisabled(true);
                                await ctx.editMessage({
                                    embeds: [embed],
                                    components: [row],
                                });
                            });
                            await ctx.sendMessage({
                                embeds: [embed],
                                components: [row],
                            });
                        } else {
                            await ctx.sendMessage({
                                embeds: [embed],
                            });
                        };            
                    break;
                }
                case 'reset': {
                    await ctx.sendMessage({
                        embeds: [
                          new EmbedBuilder()
                          .setTitle(`**Resetting ignored channels...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });
                    
                    let data = await IgnoreChannelSchema.findOne({ guildId: ctx.guild.id });
                    if (data.channelIds.length > 0) {
                        data.channelIds = [];
                        data.save();

                        const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Ignore Channel`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription(`${emojis.success} Removed all channels from my ignore list!`);
    
                        await ctx.editMessage({
                            embeds: [embed],
                        });
                    } else {
                        errorEmbed(ctx, "There are no ignored channels in this server!", "edit");
                    };
                    break;
                }
                default: {
                    let p;
                    if (ctx.isInteraction) {
                        p = '/';
                    } else {
                        p = require('../../schemas/Prefix.js').findOne({ guildID: ctx.guild.id }).prefix
                        ? require('../../schemas/Prefix.js').findOne({ guildID: ctx.guild.id }).prefix
                        : client.config.prefix;
                    };
    
                    const arr = [
                        `${emojis.dot} \`${p}ignorechannel add <channel>\``,
                        `> Adds a channel to the ignore list!`,
                        `\n${emojis.dot} \`${p}ignorechannel remove <channel>\``,
                        `> Removes a channel from the ignore list!`,
                        `\n${emojis.dot} \`${p}ignorechannel list\``,
                        `> Lists all ignored channels in this server!`,
                        `\n${emojis.dot} \`${p}ignorechannel reset\``,
                        `> Resets the ignored channels in this server!`,
                    ];
    
                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Ignore Channel`,
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor(colors.main)
                    .setDescription(arr.join('\n'))
                    .setFooter({
                        text: `Requested by ${author.tag}`,
                        iconURL: author.displayAvatarURL({ dynamic: true }),
                    });
    
                    ctx.sendMessage({
                        embeds: [embed],
                    });
                }
            }
        } catch (err) {
            console.log(err)
            errorEmbed(ctx, "There was an error while executing this command!", "edit");
        }
    }
}

module.exports = IgnoreChannel;