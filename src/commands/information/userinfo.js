const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { emojis, colors, token } = require('../../config.js');
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const moment = require('moment') // npm i moment
moment.locale('ENG')

class Userinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            description: {
                content: 'Shows information about an user!',
                examples: ['userinfo [user]'],
                usage: 'userinfo [user]',
            },
            category: 'information',
            aliases: ['user', 'userstats', 'ui'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to get information about',
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
              .setTitle(`**Fetching user's information...** ${emojis.loading}`)
              .setColor(colors.main)
            ]
          });

        if (!target) {
            return errorEmbed(ctx, 'The specified user is not in this server!', 'edit');
        }

        const isBot = target.bot ? `${emojis.success} Yes` : `${emojis.error} No`;
        const createdAt = `<t:${moment.utc(target.createdAt).format('X')}:R>`;
        const joinedAt = `<t:${moment.utc(ctx.guild.members.cache.get(target.id).joinedAt).format('X')}:R>`;
        // const roles = ctx.guild.members.cache.get(target.id).roles.cache.filter(r => r.id !== ctx.guild.id).map(r => r).join(', ') || 'None';
        const inAVC = ctx.guild.members.cache.get(target.id).voice.channel ? `${emojis.success} Yes` : `${emojis.error} No`;
        const timedOut = ctx.guild.members.cache.get(target.id).voice.serverMute ? `${emojis.success} Yes` : `${emojis.error} No`;

        // make a badges array that shows badges with custom emoji instead of badges names
        const badges = target.flags.toArray().map(badge => {
            if (badge === 'HypeSquadOnlineHouse3') return `${emojis.badges.balance}`;
            if (badge === 'HypeSquadOnlineHouse2') return `${emojis.badges.bravery}`;
            if (badge === 'HypeSquadOnlineHouse1') return `${emojis.badges.brilliance}`;
            if (badge === 'VerifiedDeveloper') return `${emojis.badges.verified_dev}`;
            if (badge === 'Staff') return `${emojis.badges.dc_employee}`;
            if (badge === 'Partner') return `${emojis.badges.dc_partner}`;
            if (badge === 'Hypersquad') return `${emojis.badges.hypesquad_events}`;
            if (badge === 'BugHunterLevel1') return `${emojis.badges.bughunter_1}`;
            if (badge === 'BugHunterLevel2') return `${emojis.badges.bughunter_2}`;
            if (badge === 'PremiumEarlySupporter') return `${emojis.badges.early_supporter}`;
            if (badge === 'TeamPseudoUser') return `${emojis.badges.team_user}`;
            if (badge === 'VerifiedBot') return `${emojis.badges.verified_bot}`;
            if (badge === 'ActiveDeveloper') return `${emojis.badges.active_dev}`;
            if (badge === 'CertifiedModerator') return `${emojis.badges.certified_mod}`;
        }).join(' ');

        const arr = [
            `${emojis.dot} **Name:** ${target.username}#${target.discriminator}`,
            `${emojis.dot} **ID:** ${target.id}`,
            `${emojis.dot} **Nickname:** ${ctx.guild.members.cache.get(target.id).nickname || 'None'}`,
            `${emojis.dot} **Is Bot?:** ${isBot}`,
            `${emojis.dot} **Badges:** ${badges || 'None'}`,
            `${emojis.dot} **Created At:** ${createdAt}`,
            `${emojis.dot} **Joined At:** ${joinedAt}`,
            // `${emojis.dot} **Roles** → ${roles}`,
            `${emojis.dot} **In A VC:** ${inAVC}`,
            `${emojis.dot} **Timed Out:** ${timedOut}`,
        ];
      
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

        let totalroles = ctx.guild.members.cache.get(target.id).roles.cache.filter(r => r.id !== ctx.guild.id).map(r => r).length || '0';
        // make a highest role variable that mentions the highest role instead of role name
        let highestRole = ctx.guild.members.cache.get(target.id).roles.highest || 'None';
        // check if the highest role is the everyone role then set name to none
        if(highestRole === ctx.guild.roles.everyone) highestRole = 'None';
        if(highestRole !== 'None') highestRole = `<@&${highestRole.id}>`;
        // make a color role variable that mentions the color role instead of role name
        let colorRole = ctx.guild.members.cache.get(target.id).roles.color || 'None';
        // check if the color role is the everyone role then set name to none
        if(colorRole === ctx.guild.roles.everyone) colorRole = 'None';
        if(colorRole !== 'None') colorRole = `<@&${colorRole.id}>`;

        let hoistRole = ctx.guild.members.cache.get(target.id).roles.hoist || 'None';
        // check if the hoist role is the everyone role then set name to none
        if(hoistRole === ctx.guild.roles.everyone) hoistRole = 'None';
        if(hoistRole !== 'None') hoistRole = `<@&${hoistRole.id}>`;

        const arr2 = [
            // `${emojis.dot} **Total Roles** → ${totalroles}`,
            `${emojis.dot} **Highest Role:** ${highestRole}`,
            `${emojis.dot} **Hoist Role:** ${hoistRole}`,
            `${emojis.dot} **Color Role:** ${colorRole}`,
            `${emojis.dot} **Mentionable?:** ${ctx.guild.members.cache.get(target.id).roles.cache.find(r => r.mentionable) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
            // `${emojis.dot} **Roles:** ${roles}`,
        ];

        const totalperms = ctx.guild.members.cache.get(target.id).permissions.toArray().length || '0';
        const isAdmin = ctx.guild.members.cache.get(target.id).permissions.has(PermissionFlagsBits.Administrator) ? `${emojis.success} Yes` : `${emojis.error} No`;
        const isOwner = ctx.guild.ownerId === target.id ? `${emojis.success} Yes` : `${emojis.error} No`;
        
        const arr3 = [
            `${emojis.dot} **Total Permissions:** ${totalperms}`,
            `${emojis.dot} **Is Administrator?:** ${isAdmin}`,
            `${emojis.dot} **Is Server Owner?:** ${isOwner}`,
        ];

        const data = await axios
          .get(`https://discord.com/api/users/${target.id}`, {
            headers: {
              Authorization: `Bot ${token}`,
            },
          })
          .then((d) => d.data);

        let embedcolor = colors.main;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${userTag}'s Information`,
                iconURL: avatar,
            })
            .setThumbnail(avatar)
            .setColor(embedcolor)
            .addFields({
                name: `${emojis.members} **__General Information__**`,
                value: arr.join('\n'),
            },
            {
                name: `${emojis.plus} **__Roles Information [${totalroles}]__**`,
                value: arr2.join('\n'),
            },
            {
                name: `${emojis.mod} **__Key Permissions [${totalperms}]__**`,
                value: arr3.join('\n'),
            })
            .setFooter({
                text: `Requested by ${author.tag}`,
                iconURL: author.displayAvatarURL({ dynamic: true }),
            });
            if(data.banner) {
                let bannerurl = data.banner.startsWith("a_") ? ".gif?size=4096" : ".png?size=4096";
                bannerurl = `https://cdn.discordapp.com/banners/${target.id}/${data.banner}${bannerurl}`;
                embed.setImage(bannerurl);
            };

         ctx.editMessage({ embeds: [embed] });
        
        } catch (err) {
            console.log(err)
            errorEmbed(ctx, "There was an error while executing this command!", 'edit');
        }
    }
}

module.exports = Userinfo;