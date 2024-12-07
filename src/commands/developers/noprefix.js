const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../config.js');
const NoPrefixSchema = require('../../schemas/NoPrefix.js');
const schema = require('../../schemas/UserBadges.js');

class NoPrefix extends Command {
    constructor(client) {
        super(client, {
            name: 'noprefix',
            description: {
                content: 'Add no prefix to your account.',
                examples: ['noprefix add', 'noprefix remove'],
                usage: 'noprefix <add/remove>',
            },
            category: 'developers',
            aliases: ['np'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: true,
            },
            slashCommand: false,
            options: [],
        });
    }

    async run(client, ctx, args) {
        try {
            const subCommand = args[0];
            if (!subCommand) return;

            switch (subCommand) {
                case 'add': {
                    let id = ctx.message.mentions?.users?.first()?.id || args[1];
                    if (!id || isNaN(id)) return errorEmbed(ctx, "You need to mention a user or provide a user ID.", "send");

                    let badgesSchema = await schema.findOne({ UserId: id });
                    let badges = badgesSchema?.Badges;
                    // if (!badges) return errorEmbed(ctx, "This user does not have a profile!", "send");
        
                    const noPrefix = await NoPrefixSchema.findOne({ targetId: id });
                    if (noPrefix) return errorEmbed(ctx, "This user has already no prefix enabled!", "send");

                    const data = new NoPrefixSchema({ targetId: id, addedBy: ctx.author.id });
                    await data.save();

                    badges.isNoPrefixUser = true;
                    badgesSchema.save();

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Added no prefix to user (${id})`,
                            iconURL: ctx.author.displayAvatarURL({ dynamic: true }),
                        });

                    ctx.sendMessage({ embeds: [embed] });
                    break;
                }
                case 'remove': {
                    let id = ctx.message.mentions?.users?.first()?.id || args[1];
                    if (!id || isNaN(id)) return errorEmbed(ctx, "You need to mention a user or provide a user ID.", "send");

                    let badgesSchema = await schema.findOne({ UserId: id });
                    let badges = badgesSchema?.Badges;
                    // if (!badges) return errorEmbed(ctx, "This user does not have a profile!", "send");
        
                    const noPrefix = await NoPrefixSchema.findOne({ targetId: id });
                    if (!noPrefix) return errorEmbed(ctx, "This user does not have no prefix enabled!", "send");

                    await noPrefix.deleteOne();

                    badges.isNoPrefixUser = null;
                    badgesSchema.save();

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Removed no prefix from user (${id})`,
                            iconURL: ctx.author.displayAvatarURL({ dynamic: true }),
                        });

                    ctx.sendMessage({ embeds: [embed] });
                    break;
                }
                case 'info': {
                    let id = ctx.message.mentions?.users?.first()?.id || args[1];
                    if (!id || isNaN(id)) return errorEmbed(ctx, "You need to mention a user or provide a user ID.", "send");
        
                    const noPrefix = await NoPrefixSchema.findOne({ targetId: id });
                    if (!noPrefix) return errorEmbed(ctx, "This user does not have no prefix enabled!", "send");

                    let arr = [
                        `${emojis.dot} **User:** <@${noPrefix.targetId}>`,
                        `${emojis.dot} **Added By:** <@${noPrefix.addedBy}>`,
                        `${emojis.dot} **Is Enabled?:** ${emojis.success} Yes`,
                    ];

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `No Prefix System`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription(arr.join('\n'))
                        .setFooter({
                            text: `Requested by ${ctx.author.tag}`,
                            iconURL: ctx.author.displayAvatarURL({ dynamic: true }),
                        });

                    ctx.sendMessage({ embeds: [embed] });
                    break;
                }
                case 'list': {
                    const noPrefix = await NoPrefixSchema.find();
                    if (!noPrefix) return errorEmbed(ctx, "There are no users with no prefix enabled!", "send");

                    let arr = [];
                    for (let i = 0; i < noPrefix.length; i++) {
                        arr.push(`${emojis.dot} ${i + 1}. ${noPrefix[i].targetId} - <@${noPrefix[i].addedBy}>`);
                    }

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `No Prefix System`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription(arr.join('\n'))
                        .setFooter({
                            text: `Requested by ${ctx.author.tag}`,
                            iconURL: ctx.author.displayAvatarURL({ dynamic: true }),
                        });

                    ctx.sendMessage({ embeds: [embed] });
                    break;
                }
                default: break;
            }
        } catch (err) {
            console.log(err)
            errorEmbed(ctx, "There was an error while executing this command.", "send");
        }
    }
}

module.exports = NoPrefix;