const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors, token } = require('../../config.js');
const axios = require('axios');

class Banner extends Command {
    constructor(client) {
        super(client, {
            name: 'banner',
            description: {
                content: 'Shows the banner of the server or the user!',
                examples: ['banner [user/server]'],
                usage: 'banner [user/server]',
            },
            category: 'utility',
            aliases: ['bnr'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'user',
                    description: 'Shows banner of you or the specified user!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to show the banner of',
                            type: ApplicationCommandOptionType.User,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'server',
                    description: 'Shows banner of the server!',
                    type: ApplicationCommandOptionType.Subcommand,
                },
            ],
        });
    }

    async run(client, ctx, args) {
        try {
        await ctx.guild.members.fetch();
        let subCommand;
        let target;
        if (ctx.isInteraction) {
            subCommand = ctx.interaction.options.data[0].name;
            target = ctx.interaction.options.data[0].options?.[0]?.user || ctx.interaction.user;
        }
        else {
            subCommand = args[0];
            target = await ctx.message.mentions.users.first();
            if (!target) target = ctx.guild.members.cache.get(args[1])?.user || ctx.author;
        };

        let author;
        if (ctx.isInteraction) {
            author = ctx.interaction.user;
        } else {
            author = ctx.author;
        };

        switch (subCommand) {
            case 'user': {
                try {
                    await ctx.sendMessage({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(colors.main)
                            .setDescription(`**Fetching user's banner...** ${emojis.loading}`)
                        ]
                    });

                    if (!target) {
                        return errorEmbed(ctx, 'The specified user is not in this server!', 'edit');
                    };

                    let userTag = target.tag;
                    if (userTag.length > 20) {
                        userTag = target.tag.slice(0, 20) + '...';
                    };

                    const data = await axios.get(`https://discord.com/api/users/${target.id}`, {
                        headers: {
                          Authorization: `Bot ${token}`
                        }
                      }).then(d => d.data);

                      if (data.banner) {
                        let url = data.banner.startsWith("a_") ? ".gif?size=4096" : ".png?size=4096";
                        url = `https://cdn.discordapp.com/banners/${target.id}/${data.banner}${url}`;
                        
                        // make a download option for the banner in different formats
                        let desc = `${emojis.dot} [\`PNG\`](https://cdn.discordapp.com/banners/${target.id}/${data.banner}.png?size=4096) | [\`JPG\`](https://cdn.discordapp.com/banners/${target.id}/${data.banner}.jpg?size=4096)`;
                        if (url.includes(".gif")) {
                            desc = `${emojis.dot} [\`PNG\`](https://cdn.discordapp.com/banners/${target.id}/${data.banner}.png?size=4096) | [\`JPG\`](https://cdn.discordapp.com/banners/${target.id}/${data.banner}.jpg?size=4096) | [\`GIF\`](https://cdn.discordapp.com/banners/${target.id}/${data.banner}.gif?size=4096)`;
                        };
                        
                        const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `${userTag}'s banner`,
                            iconURL: target.displayAvatarURL({ dynamic: true }),
                        })
                        .setImage(url)
                        .setDescription(desc)
                        .setFooter({
                            text: `Requested by ${author.tag}`,
                            iconURL: author.displayAvatarURL({ dynamic: true }),
                        });

                        
            let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('user-banner')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('User Banner')
                .setEmoji(emojis.members),
                new ButtonBuilder()
                .setCustomId('server-banner')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Server Banner')
                .setEmoji(emojis.home),
            );

            await ctx.editMessage({
                embeds: [embed],
                components: [row],
            });

            const filter = (i) => i.user.id === author.id;
            const collector = ctx.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'user-banner') {
                    await i.update({
                        embeds: [embed],
                        components: [row],
                    }).catch(err => {});
                } else if (i.customId === 'server-avatar') {
                    let res = await axios.get(`https://discord.com/api/guilds/${ctx.guild.id}/members/${target.id}`, {
                        headers: {
                            Authorization: `Bot ${token}`
                        }
                    })
            
                    if(res.data.banner !== undefined && res.data.banner !== null) {
                        let url = `https://cdn.discordapp.com/guilds/${ctx.guild.id}/users/${target.id}/banners/${res.data.banner}.webp?size=4096`
                        // check if avatar is animated if yes then set extension to gif
                        if (res.data.avatar.startsWith("a_")) {
                            url = `https://cdn.discordapp.com/guilds/${ctx.guild.id}/users/${target.id}/banners/${res.data.banner}.gif?size=4096`
                        };
                        
                        const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `${userTag}'s server banner`,
                            iconURL: target.displayAvatarURL({ dynamic: true }),
                        })
                        .setImage(url)
                        .setFooter({
                            text: `Requested by ${author.tag}`,
                            iconURL: author.displayAvatarURL({ dynamic: true }),
                        });

                        i.update({
                            embeds: [embed],
                            components: [row],
                        }).catch(err => {});
                    } else {
                        await i.update({
                            embeds: [
                                new EmbedBuilder()
                                .setColor(colors.main)
                                .setAuthor({
                                    name: `${userTag} doesn't have a server banner!`,
                                    iconURL: author.displayAvatarURL({ dynamic: true }),
                                })
                            ],
                            components: [row],
                        }).catch(err => {});
                    };
                };
            });

            collector.on('end', async (i) => {
                await ctx.editMessage({
                    embeds: [embed],
                    components: [],
                }).catch(err => {});
            });
                      } else {
                        if (target.id === author.id) {
                          errorEmbed(ctx, 'You do not have a banner!', 'edit')
                          return;
                        } else {
                          errorEmbed(ctx, `${target.tag} does not have a banner!`, 'edit')
                        }
                      };
                } catch (err) {
                    // console.log(err)
                    errorEmbed(ctx, "There was an error while executing this command!", "edit");
                }
            }
            case 'server': {
                try {
                    await ctx.sendMessage({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(colors.main)
                            .setDescription(`**Fetching server's banner...** ${emojis.loading}`)
                        ]
                    });
                } catch (err) {
                    // console.log(err)
                    errorEmbed(ctx, "There was an error while executing this command!", "edit");
                }
            }
            default: {
                let p;
                if (ctx.isInteraction) {
                    p = '/';
                } else {
                    p = ctx.prefix;
                };

                const arr = [
                    `${emojis.dot} \`${p}banner user [user]\``,
                    `> Shows banner of a user!`,
                    `\n${emojis.dot} \`${p}banner server\``,
                    `> Shows banner of the server!`,
                ];

                const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Invalid Argument(s)`,
                    iconURL: client.user.displayAvatarURL(),
                })
                .setColor(colors.error)
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
            errorEmbed(ctx, "There was an error while executing this command!", "send");
        }
    }
}

module.exports = Banner;