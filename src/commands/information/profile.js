const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors, supportServerId, owners, roles, links } = require('../../config.js');
const User = require('../../schemas/UserPremium.js');
const BadgesSchema = require('../../schemas/UserBadges.js');
const moment = require('moment');

class Profile extends Command {
    constructor(client) {
        super(client, {
            name: 'profile',
            description: {
                content: 'Shows your profile or the profile of the mentioned user!',
                examples: ['profile', 'profile <user>'],
                usage: 'profile',
            },
            category: 'information',
            aliases: ['badges', 'pi', 'pr'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'user',
                    description: 'The user to show the profile of!',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        });
    }

    async run(client, ctx, args, user) {
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
                  .setTitle(`**Fetching user's profile...** ${emojis.loading}`)
                  .setColor(colors.main)
                ]
              });
    
            if (!target) {
                return errorEmbed(ctx, 'The specified user is not in this server!', 'edit');
            };
    
            let userTag = target.tag;
            if (userTag.length > 20) {
                userTag = target.tag.slice(0, 20) + '...';
            }
    
            let avatar;
            if (target.avatarURL({ dynamic: true })) {
                avatar = target.avatarURL({ dynamic: true });
            } else {
                avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
            }
    
            let author;
            if (ctx.isInteraction) {
                author = ctx.interaction.user;
            } else {
                author = ctx.author;
            }
    
            let user = await User.findOne({
                Id: target.id, // if you are using slash commands, swap message with interaction.
               });
    
               let userinfo = [];
               let premium = user?.premium;
    
               if (user && user?.isPremium) {
                  userinfo = [
                    `${emojis.dot} **Active Plan:** ${premium.plan}`,
                    `${emojis.dot} **Billing Amount:** ${premium.billing}`,
                    `${emojis.dot} **Redeemed By:** ${author}`,
                    `${emojis.dot} **Redeemed At:** <t:${moment.utc(premium.redeemedAt).format("X")}:R>`,
                    `${emojis.dot} **Expires At:** <t:${moment.utc(premium.expiresAt).format("X")}:R>`,
                ];
               };
    
               let badges = [];
               let totalBadges = 0;
              
               let userBadges = await BadgesSchema.findOne({ UserId: target.id });
               if (userBadges) {
                if (userBadges.Badges.isDev) {
                    badges.push(`${emojis.dev} **Developer**`);
                    totalBadges++;
                };
                if (userBadges.Badges.isOwner) {
                    badges.push(`${emojis.owner} **Bot Owner**`);
                    totalBadges++;
                };
                if (userBadges.Badges.isSupportTeam) {
                    badges.push(`${emojis.mod} **Support Team**`);
                    totalBadges++;
                };
                if (userBadges.Badges.isPartner) {
                    badges.push(`${emojis.partner} **Bot Partner**`);
                    totalBadges++;
                };
                if (userBadges.Badges.isPremiumUser) {
                    badges.push(`${emojis.premium} **Premium User**`);
                    totalBadges++;
                };
                if (userBadges.Badges.isNoPrefixUser) {
                    badges.push(`${emojis.plus} **No Prefix**`);
                    totalBadges++;
                };
                if (userBadges.Badges.isVoter) {
                    badges.push(`${emojis.verified} **Bot Voter**`);
                    totalBadges++;
                };
               };
    
            let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Get Free Badge')
                .setStyle(ButtonStyle.Link)
                .setEmoji(emojis.mod)
                .setURL(links.supportserver),
            );
    
            const embed = new EmbedBuilder()
            .setColor(colors.main)
            .setAuthor({ name: `${userTag}'s profile`, iconURL: avatar })
            .setThumbnail(avatar)
            .setFooter({
                text: `Requested by ${author.tag}`,
                iconURL: author.displayAvatarURL({ dynamic: true }),
            });
            if (user?.isPremium) {
                embed.addFields({
                    name: `${emojis.premium} **Subscriptions**`,
                    value: `\n ${userinfo.join('\n')}`,
                });
            };
            if (totalBadges > 0) {
                embed.addFields({
                    name: `${emojis.bot} **Badges [${totalBadges}]**`,
                    value: `\n ${badges.join('\n')}`,
                });
            } else {
                embed.addFields({
                    name: `${emojis.bot} **Badges [${totalBadges}]**`,
                    value: `Looks like ${target.tag} doesn't have any badges to display. Want a free badge? Join my [Support Server](${links.supportserver}) for a free badge!`,
                });
            };

            ctx.editMessage({
                embeds: [embed],
                components: [row],
            });
        } catch (err) {
            console.log(err)
            errorEmbed(ctx, "There was an error while executing this command!", "edit");
        }
    }
}

module.exports = Profile;