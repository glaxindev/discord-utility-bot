const { Command } = require('../../structures/index.js');
const { errorEmbed, missingUserPermissions } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors } = require('../../config.js');
const schema = require('../../schemas/IgnoreBypass.js');

class IgnoreBypass extends Command {
    constructor(client) {
        super(client, {
            name: 'ignorebypass',
            description: {
                content: 'ignorebypass <add/remove/list/reset> <user>',
                examples: ['ignorebypass add @user', 'ignorebypass remove @user', 'ignorebypass list', 'ignorebypass reset'],
                usage: 'ignorebypass <add/remove/list/reset> <user>',
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
                    description: 'Add a user to the ignorebypass list!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to add to the ignorebypass list!',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'remove',
                    description: 'Remove a user from the ignorebypass list!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to remove from the ignorebypass list!',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'list',
                    description: 'Lists all the users in the ignorebypass list!',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'reset',
                    description: 'Resets the ignorebypass list for this server!',
                    type: ApplicationCommandOptionType.Subcommand,
                },
            ],
        });
    }

    async run(client, ctx, args) {
        try {
            await ctx.guild.members.fetch();
            let subCommand;
            let user;
            if (ctx.isInteraction) {
                subCommand = ctx.interaction.options.data[0].name;
                user = ctx.guild.members.cache.get(ctx.interaction.options.data[0].options[0]?.user.id);
            }
            else {
                subCommand = args[0];
                user = ctx.message.mentions.users.first();
                if (!user) user = ctx.guild.members.cache.get(args[1]);
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
                          .setTitle(`**Adding user to database...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });

                    if (!user) return errorEmbed(ctx, "Please specify a user to add to the ignorebypass list!", "edit");
                    if (user.id === author.id) return errorEmbed(ctx, "You cannot add yourself to the ignorebypass list!", "edit");

                    let data = await schema.findOne({ guildId: ctx.guild.id });
                    if (data) {
                        if (data.userIds.includes(user.id)) return errorEmbed(ctx, "This user is already in the ignorebypass list!", "edit");
                        data.userIds.push(user.id);
                        data.save();

                        const embed = new EmbedBuilder()
                          .setColor(colors.main)
                          .setAuthor({
                            name: `Ignore Bypass`,
                            iconURL: client.user.displayAvatarURL({
                              dynamic: true,
                            }),
                          })
                          .setDescription(
                            `${emojis.success} Added ${user} to ignore bypass list for this server!`
                          );

                        await ctx.editMessage({
                          embeds: [embed],
                        });
                    } else {
                        const newData = new schema({
                            guildId: ctx.guild.id,
                            userIds: [user.id],
                            addedBy: author.id,
                        });
                        newData.save();

                        const embed = new EmbedBuilder()
                          .setColor(colors.main)
                          .setAuthor({
                            name: `Ignore Bypass`,
                            iconURL: client.user.displayAvatarURL({
                              dynamic: true,
                            }),
                          })
                          .setDescription(
                            `${emojis.success} Added ${user} to ignore bypass list for this server!`
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
                          .setTitle(`**Removing user from database...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });

                    if (!user) return errorEmbed(ctx, "Please specify a user to remove from the ignorebypass list!", "edit");
                    if (user.id === author.id) return errorEmbed(ctx, "You cannot remove yourself from the ignorebypass list!", "edit");

                    let data = await schema.findOne({ guildId: ctx.guild.id });
                    if (!data) return errorEmbed(ctx, "There are no users in the ignorebypass list!", "edit");
                    if (!data.userIds.includes(user.id)) return errorEmbed(ctx, "This user is not in the ignorebypass list!", "edit");
                    data.userIds.splice(data.userIds.indexOf(user.id), 1);
                    data.save();

                    const embed = new EmbedBuilder()
                      .setColor(colors.main)
                      .setAuthor({
                        name: `Ignore Bypass`,
                        iconURL: client.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      })
                      .setDescription(
                        `${emojis.success} Removed ${user} from ignore bypass list for this server!`
                      );

                    await ctx.editMessage({
                      embeds: [embed],
                    });
                    break;
                }
                case 'list': {
                    let data = await schema.findOne({ guildId: ctx.guild.id });
                    // check if there are no users in the ignorebypass list through userIds
                    if (!data || data.userIds.length === 0) return errorEmbed(ctx, "There are no users in the ignorebypass list!", "send");


                    let perPage = 10;
                    let page = 1;
                    let start = (page - 1) * perPage;
                    let end = start + perPage;
                    let arr = [];
                    data.userIds.slice(start, end).forEach((id, i) => {
                        arr.push(`\`[${start + i + 1}]\` | [${id}](https://discord.com/users/${id}) | <@${id}>`);
                    });
                    
                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Ignore Bypass`,
                            iconURL: client.user.displayAvatarURL({
                            dynamic: true,
                            }),
                        })
                        .setDescription(
                            `${arr.join('\n')}`
                        )
                        // .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({
                            text: `Page ${page} out of ${Math.ceil(data.userIds.length / perPage)}`,
                            iconURL: author.displayAvatarURL({ dynamic: true }),
                        });

                        if (data.userIds.length > perPage) {
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
                                    data.userIds.slice(start, end).forEach((id, i) => {
                                        arr.push(`\`[${start + i + 1}]\` | [${id}](https://discord.com/users/${id}) | <@${id}>`);
                                    });
                                    embed.setDescription(arr.join('\n'));
                                    embed.setFooter({
                                        text: `Page ${page} out of ${Math.ceil(data.userIds.length / perPage)}`,
                                        iconURL: author.displayAvatarURL({ dynamic: true }),
                                    });
                                    if (page === Math.ceil(data.userIds.length / perPage)) {
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
                                    data.userIds.slice(start, end).forEach((id, i) => {
                                        arr.push(`\`[${start + i + 1}]\` | [${id}](https://discord.com/users/${id}) | <@${id}>`);
                                    });
                                    embed.setDescription(arr.join('\n'));
                                    embed.setFooter({
                                        text: `Page ${page} out of ${Math.ceil(data.userIds.length / perPage)}`,
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
                          .setTitle(`**Resetting bypass users...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });
                    
                    let data = await schema.findOne({ guildId: ctx.guild.id });
                    if (data.userIds.length > 0) {
                        data.userIds = [];
                        data.save();

                        const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Ignore Bypass`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription(`${emojis.success} Removed all users from my ignore bypass list!`);
    
                        await ctx.editMessage({
                            embeds: [embed],
                        });
                    } else {
                        errorEmbed(ctx, "There are no bypass users in this server!", "edit");
                    };
                    break;
                }
                default: {
                    let p;
                    if (ctx.isInteraction) {
                        p = '/';
                    } else {
                        let prefix = require('../../schemas/Prefix.js');
                        let data = await prefix.findOne({ guildID: ctx.guild.id });
                        if (data) {
                            p = data.prefix;
                        } else {
                            p = client.config.prefix;
                        };
                    };
    
                    const arr = [
                        `${emojis.dot} \`${p}ignorebypass add <user>\``,
                        `> Adds a user to the ignorebypass list!`,
                        `${emojis.dot} \`${p}ignorebypass remove <user>\``,
                        `> Removes a user from the ignorebypass list!`,
                        `${emojis.dot} \`${p}ignorebypass list\``,
                        `> Lists all the users in the ignorebypass list!`,
                        `${emojis.dot} \`${p}ignorebypass reset\``,
                        `> Resets the ignorebypass list for this server!`,
                    ];
    
                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Ignore Bypass`,
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
            console.log(err);
            errorEmbed(ctx, "There was an error while executing this command!", "edit");
        }
    }
}

module.exports = IgnoreBypass;