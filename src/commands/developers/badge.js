const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../config.js');
const schema = require('../../schemas/UserBadges.js');

class Badge extends Command {
    constructor(client) {
        super(client, {
            name: 'badge',
            description: {
                content: 'badge <add/remove>',
                examples: ['badge add <user> <badge>', 'badge remove <user> <badge>'],
                usage: 'badge <add/remove> <user> <badge>',
            },
            category: 'developers',
            aliases: [],
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
        let subCommand = args[0];
        let user = ctx.message.mentions.users.first() || client.users.cache.get(args[1]);
        let badge = args[2];

        if (!user) return errorEmbed(ctx, "You need to specify a valid user!", "send");
        if (!badge) return errorEmbed(ctx, "You need to specify a valid badge!", "send");

        let badges = [
            "isDev",
            "isOwner",
            "isPartner",
            "isPremiumUser",
            "isNoPrefixUser",
            "isSupportTeam",
            "isVoter",
        ];

        if (!badges.includes(badge)) return errorEmbed(ctx, "You need to specify a valid badge!", "send");

        const dta = await schema.findOne({ UserId: user.id });
        const data = dta.Badges;

        switch (subCommand) {
            case 'add': {
                if (badge === "isDev") {
                    if (data.isDev) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isDev = true;
                    dta.save();
                };
                if (badge === "isOwner") {
                    if (data.isOwner) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isOwner = true;
                    dta.save();
                };
                if (badge === "isPartner") {
                    if (data.isPartner) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isPartner = true;
                    dta.save();
                };
                if (badge === "isPremiumUser") {
                    if (data.isPremiumUser) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isPremiumUser = true;
                    dta.save();
                };
                if (badge === "isNoPrefixUser") {
                    if (data.isNoPrefixUser) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isNoPrefixUser = true;
                    dta.save();
                };
                if (badge === "isSupportTeam") {
                    if (data.isSupportTeam) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isSupportTeam = true;
                    dta.save();
                };
                if (badge === "isVoter") {
                    if (data.isVoter) return errorEmbed(ctx, "This user already has this badge!", "send");
                    data.isVoter = true;
                    dta.save();
                };
                const embed = new EmbedBuilder()
                    .setColor(colors.main)
                    .setAuthor({
                        name: `Badge Added`,
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setDescription(`${emojis.success} **${user.tag}** now has the \`${badge}\` badge!`)
                    .setFooter({
                        text: `Requested by ${ctx.author.tag}`,
                        iconURL: ctx.author.displayAvatarURL(),
                    });

                ctx.sendMessage({ embeds: [embed] });
                break;
            }
            case 'remove': {
                if (badge === "isDev") {
                    if (!data.isDev) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isDev = null;
                    dta.save();
                };
                if (badge === "isOwner") {
                    if (!data.isOwner) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isOwner = null;
                    dta.save();
                };
                if (badge === "isPartner") {
                    if (!data.isPartner) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isPartner = null;
                    dta.save();
                };
                if (badge === "isPremiumUser") {
                    if (!data.isPremiumUser) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isPremiumUser = null;
                    dta.save();
                };
                if (badge === "isNoPrefixUser") {
                    if (!data.isNoPrefixUser) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isNoPrefixUser = null;
                    dta.save();
                };
                if (badge === "isSupportTeam") {
                    if (!data.isSupportTeam) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isSupportTeam = null;
                    dta.save();
                };
                if (badge === "isVoter") {
                    if (!data.isVoter) return errorEmbed(ctx, "This user doesn't have this badge!", "send");
                    data.isVoter = null;
                    dta.save();
                };
                const embed = new EmbedBuilder()
                    .setColor(colors.main)
                    .setAuthor({
                        name: `Badge Removed`,
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setDescription(`${emojis.success} **${user.tag}** no longer has the \`${badge}\` badge!`)
                    .setFooter({
                        text: `Requested by ${ctx.author.tag}`,
                        iconURL: ctx.author.displayAvatarURL(),
                    });

                ctx.sendMessage({ embeds: [embed] });
                break;
            }
            default: break;
        }
    }
}

module.exports = Badge;