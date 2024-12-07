const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder, ChannelType, GuildFeature } = require('discord.js');
const { colors, emojis } = require('../../config.js');
const moment = require('moment') // npm i moment
moment.locale('ENG')

class Serverinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'serverinfo',
            description: {
                content: 'Shows the current server\'s information!',
                examples: ['serverinfo'],
                usage: 'serverinfo',
            },
            category: 'information',
            aliases: ['si', 'serverstats'],
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
            },
            slashCommand: true,
            options: [],
        });
    }

    async run(client, ctx) {
        try {
            await ctx.sendMessage({
                embeds: [
                  new EmbedBuilder()
                  .setTitle(`**Fetching server's information...** ${emojis.loading}`)
                  .setColor(colors.main)
                ]
              });

              let owner = await ctx.guild.fetchOwner();

              const general = [
                `${emojis.dot} **Name:** ${ctx.guild.name}`,
                `${emojis.dot} **ID:** ${ctx.guild.id}`,
                `${emojis.dot} **Owner:** ${owner.user.tag}`,
                `${emojis.dot} **Members:** ${ctx.guild.memberCount}`,
                `${emojis.dot} **Banned:** ${ctx.guild.bans.cache.size || '0'}`,
                `${emojis.dot} **Created At:** <t:${moment.utc(ctx.guild.createdAt).format('X')}:R>`,
                `${emojis.dot} **Total Boosts:** ${ctx.guild.premiumSubscriptionCount || '0'}`,
                // `${emojis.dot} **Boost Level:** ${ctx.guild.premiumTier || '0'}`,
                `${emojis.dot} **Verification Level:** ${ctx.guild.verificationLevel || '0'}`,
                `${emojis.dot} **Is Partnered?:** ${ctx.guild.partnered ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                `${emojis.dot} **Is Verified?:** ${ctx.guild.verified ? `${emojis.success} Yes` : `${emojis.error} No`}`,
              ];

              const features = [
                `${emojis.dot} **Community?:** ${ctx.guild.features.includes(GuildFeature.Community) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
                `${emojis.dot} **Discoverable?:** ${ctx.guild.features.includes(GuildFeature.Discoverable) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
                // `${emojis.dot} **Is Featurable?:** ${ctx.guild.features.includes('FEATURABLE') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Partnered?:** ${ctx.guild.features.includes('PARTNERED') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Verified?:** ${ctx.guild.features.includes('VERIFIED') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is VIP?:** ${ctx.guild.features.includes('VIP_REGIONS') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                `${emojis.dot} **Vanity URL?:** ${ctx.guild.features.includes(GuildFeature.VanityURL) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
                `${emojis.dot} **Welcome Screen?:** ${ctx.guild.features.includes(GuildFeature.WelcomeScreenEnabled) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
                // `${emojis.dot} **Is Ticketed Events Enabled?:** ${ctx.guild.features.includes('TICKETED_EVENTS_ENABLED') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                `${emojis.dot} **Monetization?:** ${ctx.guild.features.includes(GuildFeature.MonetizationEnabled) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
                // `${emojis.dot} **Is More Stickers Enabled?:** ${ctx.guild.features.includes('MORE_STICKERS') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Three Day Thread Archive Enabled?:** ${ctx.guild.features.includes('THREE_DAY_THREAD_ARCHIVE') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Seven Day Thread Archive Enabled?:** ${ctx.guild.features.includes('SEVEN_DAY_THREAD_ARCHIVE') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Private Threads Enabled?:** ${ctx.guild.features.includes('PRIVATE_THREADS') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Role Based Ticketing Enabled?:** ${ctx.guild.features.includes('ROLE_BASED_TICKETS') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                // `${emojis.dot} **Is Threaded Dynamic Threads Enabled?:** ${ctx.guild.features.includes('THREADS_ENABLED_TESTING') ? `${emojis.success} Yes` : `${emojis.error} No`}`,
                `${emojis.dot} **News Channels?:** ${ctx.guild.features.includes(GuildFeature.News) ? `${emojis.enabled}` : `${emojis.disabled}`}`,
              ];
              
            //   let lockedchannels = ctx.guild.channels.cache.filter(c => !c.permissionsFor(ctx.guild.roles.everyone).has(PermissionsBitField.Flags.ViewChannel)).size || '0';

              const channels = [
                `${emojis.dot} **Total Channels:** ${ctx.guild.channels.cache.size || '0'}`,
                // `${emojis.dot} **Total Threads:** ${ctx.guild.channels.cache.filter(c => c.type === 'GUILD_PUBLIC_THREAD' || c.type === 'GUILD_PRIVATE_THREAD').size || '0'}`,
                `${emojis.dot} **Channels:** ${emojis.text_channel} ${ctx.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size || '0'} | ${emojis.voice_channel} ${ctx.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size || '0'}`,
                // `${emojis.dot} **Categories:** ${ctx.guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size || '0'}`,
                // `${emojis.dot} **News Channels:** ${ctx.guild.channels.cache.filter(c => c.type === 'GUILD_NEWS').size || '0'}`,
                // `${emojis.dot} **Store Channels:** ${ctx.guild.channels.cache.filter(c => c.type === 'GUILD_STORE').size || '0'}`,
                // `${emojis.dot} **Stage Channels:** ${ctx.guild.channels.cache.filter(c => c.type === 'GUILD_STAGE_VOICE').size || '0'}`,
                `${emojis.dot} **Rules Channel:** ${ctx.guild.rulesChannel ? ctx.guild.rulesChannel : 'None'}`,
                `${emojis.dot} **System Channel:** ${ctx.guild.systemChannel ? ctx.guild.systemChannel : 'None'}`,
                // `${emojis.dot} **Public Updates Channel:** ${ctx.guild.publicUpdatesChannel ? ctx.guild.publicUpdatesChannel : 'None'}`,
            ];

            let maxemojis;
            if (ctx.guild.premiumSubscriptionCount >= 0) {
                maxemojis = 50;
            } else if (ctx.guild.premiumSubscriptionCount >= 2) {
                maxemojis = 100;
            } else if (ctx.guild.premiumSubscriptionCount >= 7) {
                maxemojis = 150;
            } else if (ctx.guild.premiumSubscriptionCount >= 14) {
                maxemojis = 250;
            };

            const emojiinfo = [
                `${emojis.dot} **Total Emojis:** ${ctx.guild.emojis.cache.size || '0'}`,
                `${emojis.dot} **Regular:** ${ctx.guild.emojis.cache.filter(e => !e.animated).size || '0'}/${maxemojis}`,
                `${emojis.dot} **Animated:** ${ctx.guild.emojis.cache.filter(e => e.animated).size || '0'}/${maxemojis}`,
            ];

            let totalroles = ctx.guild.roles.cache.filter(r => r.name !== '@everyone' && !r.managed);
            // check if roles are more then 20 then slice them
            if (totalroles.size > 20) {
                let array = totalroles.map(r => r).slice(0, 20);
                totalroles = `${array} and ${totalroles.size - 20} more...`
            };

            const roles = [
                `${totalroles || 'None'}`,
            ];

            // const serverbanner = ctx.guild.bannerURL({ dynamic: true });
            const servericon = ctx.guild.iconURL({ dynamic: true });
            // if (servericon) servericon = author.displayAvatarURL({ dynamic: true });

            let serverName = ctx.guild.name;
            if (serverName.length > 20) {
                serverName = ctx.guild.name.slice(0, 20) + '...';
            };

            let author;
            if (ctx.isInteraction) {
                author = ctx.interaction.user;
            } else {
                author = ctx.author;
            }

            const embed = new EmbedBuilder()
            .setAuthor({
                name: `${serverName}'s Information`,
                iconURL: servericon || client.user.displayAvatarURL({ dynamic: true }),
            })
            .setColor(colors.main)
            .addFields({
                name: `${emojis.home} **__General__**`,
                value: general.join('\n'),
            },
            {
                name: `${emojis.folder} **__Features__**`,
                value: features.join('\n'),
            },
            {
                name: `${emojis.info} **__Channels [${ctx.guild.channels.cache.size || '0'}]__**`,
                value: channels.join('\n'),
            },
            {
                name: `${emojis.addemoji} **__Emojis [${ctx.guild.emojis.cache.size || '0'}]__**`,
                value: emojiinfo.join('\n'),
            },
            {
                name: `${emojis.members} **__Roles [${ctx.guild.roles.cache.filter(r => r.name !== '@everyone' && !r.managed).size || '0'}]__**`,
                value: roles.join('\n'),
            }
            )
            .setFooter({
                text: `Requested by ${author.tag}`,
                iconURL: author.displayAvatarURL({ dynamic: true }),
            });
            if (servericon) {
                embed.setThumbnail(servericon);
            } else {
                embed.setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
            };
            // if (serverbanner) embed.setImage(serverbanner);

            ctx.editMessage({
                embeds: [embed]
            });
        } catch (err) {
           errorEmbed(ctx, "There was an error while executing this command!", "edit")
           console.log(err)
        }
    }
}

module.exports = Serverinfo;