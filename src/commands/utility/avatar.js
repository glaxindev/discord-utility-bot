const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors, token } = require('../../config.js');
const axios = require('axios');

class Avatar extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            description: {
                content: 'Shows the avatar of you or the specified user!',
                examples: ['avatar [user]'],
                usage: 'avatar [user]',
            },
            category: 'utility',
            aliases: ['av', 'pfp'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to get the avatar from',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        });
    }

    async run(client, ctx, args) {
        try {
            await ctx.guild.members.fetch();
            let target;
            if(ctx.isInteraction) {
                target = ctx.interaction.options.data.find(arg => arg.name.toLowerCase() == 'user')?.user || ctx.interaction.user;
            } else {
                target = await ctx.message.mentions.users.first();
                if (!target) target = ctx.guild.members.cache.get(args[0])?.user || ctx.author;
            };

            await ctx.sendMessage({
                embeds: [
                    new EmbedBuilder()
                    .setColor(colors.main)
                    .setDescription(`**Fetching user's avatar...** ${emojis.loading}`)
                ]
            });

            if (!target) {
                return errorEmbed(ctx, 'The specified user is not in this server!', 'edit');
            }

            const avatar = target.displayAvatarURL({ dynamic: true, size: 4096 });

            if (ctx.isInteraction && !avatar) {
                if (target.id == ctx.interaction.user.id) {
                    return errorEmbed(ctx, "You do not have an avatar!", "edit");
                } else {
                    return errorEmbed(ctx, "The specified user doesn't have an avatar!", "edit");
                };
            } else if (!ctx.isInteraction && !avatar) {
                if (target.id == ctx.author.id) {
                    return errorEmbed(ctx, "You do not have an avatar!", "edit");
                } else {
                    return errorEmbed(ctx, "The specified user doesn't have an avatar!", "edit");
                };
            };

            let userTag = target.tag;
            if (userTag.length > 20) {
              userTag = target.tag.slice(0, 20) + "...";
            };

            let author;
            if (ctx.isInteraction) {
                author = ctx.interaction.user;
            } else {
                author = ctx.author;
            }

            // check if avatar is animated
            let desc = `${emojis.dot} [\`PNG\`](https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.png?size=4096) | [\`JPG\`](https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.jpg?size=4096) | [\`GIF\`](https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.gif?size=4096)`;
            if (!avatar.includes(".gif")) {
                desc = `${emojis.dot} [\`PNG\`](https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.png?size=4096) | [\`JPG\`](https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.jpg?size=4096)`;
            };

            const embed = new EmbedBuilder()
            .setColor(colors.main)
            .setAuthor({
                name: `${userTag}'s avatar`,
                iconURL: avatar,
            })
            .setImage(avatar)
            .setDescription(desc)
            .setFooter({
                text: `Requested by ${author.tag}`,
                iconURL: author.displayAvatarURL({ dynamic: true }),
            });

            let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('user-avatar')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('User Avatar')
                .setEmoji(emojis.members),
                new ButtonBuilder()
                .setCustomId('server-avatar')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Server Avatar')
                .setEmoji(emojis.home),
            );

            await ctx.editMessage({
                embeds: [embed],
                components: [row],
            });

            const filter = (i) => i.user.id === author.id;
            const collector = ctx.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'user-avatar') {
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
            
                    if(res.data.avatar !== undefined && res.data.avatar !== null) {
                        let url = `https://cdn.discordapp.com/guilds/${ctx.guild.id}/users/${target.id}/avatars/${res.data.avatar}.webp?size=4096`
                        // check if avatar is animated if yes then set extension to gif
                        if (res.data.avatar.startsWith("a_")) {
                            url = `https://cdn.discordapp.com/guilds/${ctx.guild.id}/users/${target.id}/avatars/${res.data.avatar}.gif?size=4096`
                        };
                        const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `${userTag}'s server avatar`,
                            iconURL: avatar,
                        })
                        .setImage(url)
                        .setDescription(`${emojis.dot} [Download link](${url})`)
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
                                    name: `${userTag} doesn't have a server avatar!`,
                                    iconURL: avatar,
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
        } catch (err) {
            // console.log(err)
            errorEmbed(ctx, "There was an error while executing this command!", "edit");
        }
    }
}

module.exports = Avatar;