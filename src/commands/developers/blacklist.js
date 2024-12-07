const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../config.js');
const BlacklistSchema = require('../../schemas/Blacklist.js');

class Blacklist extends Command {
    constructor(client) {
        super(client, {
            name: 'blacklist',
            description: {
                content: 'Blacklist a user from using the bot.',
                examples: ['blacklist'],
                usage: 'blacklist',
            },
            category: 'developers',
            aliases: ['bl'],
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
            let subCommand = args[0];
            if (!subCommand) return;

            switch (subCommand) {
                case 'add': {
                    let id = ctx.message.mentions?.users?.first()?.id || args[1];
                    if (!id || isNaN(id)) return errorEmbed(ctx, "You need to mention a user or provide a user ID.", "send");
        
                    const blacklist = await BlacklistSchema.findOne({ targetId: id });
                    if (blacklist) return errorEmbed(ctx, "This user is already in the blacklist!", "send");

                    const data = new BlacklistSchema({ targetId: id, addedBy: ctx.author.id });
                    await data.save();

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Successfully blacklisted the user (${id})`,
                            iconURL: ctx.author.displayAvatarURL({ dynamic: true }),
                        });

                    ctx.sendMessage({ embeds: [embed] });
                    break;
                }
                case 'remove': {
                    let id = ctx.message.mentions?.users?.first()?.id || args[1];
                    if (!id || isNaN(id)) return errorEmbed(ctx, "You need to mention a user or provide a user ID.", "send");
        
                    const blacklist = await BlacklistSchema.findOne({ targetId: id });
                    if (!blacklist) return errorEmbed(ctx, "This user is not in the blacklist!", "send");

                    await blacklist.deleteOne();

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Successfully removed blacklist from the user (${id})`,
                            iconURL: ctx.author.displayAvatarURL({ dynamic: true }),
                        });

                    ctx.sendMessage({ embeds: [embed] });
                    break;
                }
                case 'info': {
                    let id = ctx.message.mentions?.users?.first()?.id || args[1];
                    if (!id || isNaN(id)) return errorEmbed(ctx, "You need to mention a user or provide a user ID.", "send");
        
                    const blacklist = await BlacklistSchema.findOne({ targetId: id });
                    if (!blacklist) return errorEmbed(ctx, "This user is not in the blacklist!", "send");

                    let arr = [
                        `${emojis.dot} **User:** <@${blacklist.targetId}>`,
                        `${emojis.dot} **Added By:** <@${blacklist.addedBy}>`,
                        `${emojis.dot} **Is Blacklisted?:** ${emojis.success} Yes`,
                    ];

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Blacklist System`,
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
                    const blacklist = await BlacklistSchema.find();
                    if (!blacklist) return errorEmbed(ctx, "There are no users in the blacklist!", "send");

                    let arr = [];
                    for (let i = 0; i < blacklist.length; i++) {
                        arr.push(`${emojis.dot} ${i + 1}. ${blacklist[i].targetId} - <@${blacklist[i].addedBy}>`);
                    }

                    const embed = new EmbedBuilder()
                        .setColor(colors.main)
                        .setAuthor({
                            name: `Blacklist System`,
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
                default: return;
            }
        } catch (err) {
            // console.log(err);
            errorEmbed(ctx, "There was an error while executing the command!", "send");
        }
    }
}

module.exports = Blacklist;