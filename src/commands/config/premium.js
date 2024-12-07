const { Command } = require('../../structures/index.js');
const { errorEmbed, missingUserPermissions } = require('../../modules/embeds.js');
const { EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { emojis, colors, prefix, links } = require('../../config.js');
const schema = require('../../schemas/VoucherCodes.js');
const User = require('../../schemas/UserPremium.js');
const moment = require('moment');
const badgeSchema = require('../../schemas/UserBadges.js');

class Premium extends Command {
    constructor(client) {
        super(client, {
            name: 'premium',
            description: {
                content: 'Premium commands!',
                examples: ['premium'],
                usage: 'premium',
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
                    name: 'redeem',
                    description: 'Redeem a premium code!',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'code',
                            description: 'The premium code to redeem!',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'status',
                    description: 'Shows your premium status!',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'activate',
                    description: 'Activate premium on this server!',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'deactivate',
                    description: 'Deactivate premium on this server!',
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
        });
    }

    async run(client, ctx, args, user) {
        try {
            let subCommand;
            let code;
            if (ctx.isInteraction) {
                subCommand = ctx.interaction.options.data[0].name;
                code = ctx.interaction.options.data[0].options[0]?.value.toString();
            }
            else {
                subCommand = args[0];
                code = args[1];
            };
    
            let author;
            if (ctx.isInteraction) {
                author = ctx.interaction.user;
            } else {
                author = ctx.author;
            };

            switch (subCommand) {
                case 'redeem': {

                    await ctx.sendMessage({
                        embeds: [
                          new EmbedBuilder()
                          .setTitle(`**Redeeming premium code...** ${emojis.loading}`)
                          .setColor(colors.main)
                        ]
                      });

                    user = await User.findOne({
                        Id: author.id, // if you are using slash commands, swap message with interaction.
                      })
                  
                      // Check Users input for a valid code. Like `!redeem ABCD-EFGH-IJKL`
                      if (!code) return errorEmbed(ctx, 'Please provide a valid code to redeem!', "edit");
                      if (user && user.isPremium) return errorEmbed(ctx, 'You already have a active premium subscription!', "edit");
                      
                      const premium = await schema.findOne({
                        code: code.toUpperCase(),
                      });

                      if (!premium) return errorEmbed(ctx, 'This code is invalid or already been redeemed!', "edit");

                          let pp;
                          if (premium.plan === '1month') pp = 'Rhyton Monthly Plan';
                          if (premium.plan === '3month') pp = 'Rhyton Annually Plan';
                          if (premium.plan === '1year') pp = 'Rhyton Yearly Plan';
                          if (premium.plan === 'lifetime') pp = 'Rhyton Forever Plan';

                          let billing;
                          if (premium.plan === '1month') billing = client.config.premium.billing.monthly;
                          if (premium.plan === '3month') billing = client.config.premium.billing.annually;
                          if (premium.plan === '1year') billing = client.config.premium.billing.yearly;
                          if (premium.plan === 'lifetime') billing = client.config.premium.billing.lifetime;
                    
                          // Once the code is expired, we delete it from the database and from the users profile
                          user.isPremium = true
                          user.premium.redeemedBy.push(author)
                          user.premium.redeemedAt = Date.now()
                          user.premium.expiresAt = premium.expiresAt
                          user.premium.plan = pp;
                          user.premium.billing = billing;
                          
                          // Save the user to the database
                          user = await user.save({ new: true }).catch(() => {});
                          client.userSettings.set(author.id, user);
                          await premium.deleteOne().catch(() => {});

                          const badgesSchema = await badgeSchema.findOne({ UserId: author.id });
                          const badges = badgesSchema?.Badges;

                            badges.isPremiumUser = true;
                            badgesSchema.save();

                            const embed = new EmbedBuilder()
                            .setAuthor({
                                name: `Premium System`,
                                iconURL: client.user.displayAvatarURL(),
                            })
                            .setColor(colors.main)
                            .setDescription(`${emojis.dot} You have successfully redeemed a premium code!`)
                            // .setThumbnail(client.user.displayAvatarURL())
                            // .setFooter({
                            //     text: `Redeemed by ${author.tag}`,
                            //     iconURL: author.displayAvatarURL({ dynamic: true }),
                            // });

                            const supportserver = new ButtonBuilder()
                              .setStyle(ButtonStyle.Link)
                              // .setCustomId('bot-api')
                              .setLabel(`Join our Support Server`)
                              .setEmoji(emojis.home)
                              .setURL(links.supportserver);

                              const row = new ActionRowBuilder().addComponents(
                                supportserver,
                              );

                            ctx.editMessage({
                                embeds: [embed],
                                components: [row],
                            });
                            break;
                }
                case 'status': {
                   let user = await User.findOne({
                    Id: author.id, // if you are using slash commands, swap message with interaction.
                   });

                    if (!user || !user?.isPremium) return errorEmbed(ctx, 'You do not have a active premium subscription!', "send");
                    let premium = user.premium;

                    const userinfo = [
                        `${emojis.dot} **Active Plan:** ${premium.plan}`,
                        `${emojis.dot} **Billing Amount:** ${premium.billing}`,
                        `${emojis.dot} **Redeemed By:** ${author}`,
                        `${emojis.dot} **Redeemed At:** <t:${moment.utc(premium.redeemedAt).format("X")}:R>`,
                        `${emojis.dot} **Expires At:** <t:${moment.utc(premium.expiresAt).format("X")}:R>`,
                    ];

                    let serverinfo = [];
                    let guild = client.guilds.cache.get(user.guild.id) || 'null';

                    if (user.guild.id !== null) {
                        serverinfo.push(`${emojis.dot} **Server Name:** ${guild.name}`)
                        serverinfo.push(`${emojis.dot} **Active Plan:** ${premium.plan}`);
                        serverinfo.push(`${emojis.dot} **Activated By:** <@${user.guild.activatedBy}>`);
                        serverinfo.push(`${emojis.dot} **Is Premium?:** ${user.guild.isPremium ? emojis.enabled : emojis.disabled}`);
                    };

                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Premium System`,
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor(colors.main)
                    .addFields(
                        {
                          name: `${emojis.settings} **__Subscriptions__**`,
                          value: userinfo.join('\n'),
                        },
                      )
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter({
                        text: `Requested by ${author.tag}`,
                        iconURL: author.displayAvatarURL({ dynamic: true }),
                    });

                    if (user.guild.id !== null) {
                        embed.addFields(
                            {
                                name: `${emojis.settings} **__Server Premium__**`,
                                value: serverinfo.join('\n'),
                            },
                        )
                    };

                    const supportserver = new ButtonBuilder()
                      .setStyle(ButtonStyle.Link)
                      // .setCustomId('bot-api')
                      .setLabel(`Join our Support Server`)
                      .setEmoji(emojis.home)
                      .setURL(links.supportserver);

                    const row = new ActionRowBuilder().addComponents(
                      supportserver
                    );

                    ctx.sendMessage({
                        embeds: [embed],
                        components: [row],
                    });
                    break;
                }
                case 'activate': {

                    // check user permissions
                    if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                        return missingUserPermissions(ctx, "Manage Server", "send");
                    };

                    // check if the user is premium
                    let user = await User.findOne({
                        Id: author.id, // if you are using slash commands, swap message with interaction.
                    });
                    if (!user || !user?.isPremium) return errorEmbed(ctx, 'You do not have a active premium subscription!', "send");
                    // check if server does not have premium
                   
                    if (user.guild.id !== null && user.guild.id !== ctx.guild.id) return errorEmbed(ctx, 'You have already activated premium on another server!', "send");
                    if (user.guild.id === ctx.guild.id) return errorEmbed(ctx, 'This server already have active premium subscription!', "send");

                    // set the user premium
                    user.guild.id = ctx.guild.id;
                    user.guild.isPremium = true;
                    user.guild.activatedBy = author.id;

                    // save the user
                    user = await user.save({ new: true }).catch(() => {});
                    client.userSettings.set(author.id, user);

                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Premium System`,
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor(colors.main)
                    .setDescription(`${emojis.dot} You have successfully activated premium on this server!`)
                    // .setThumbnail(client.user.displayAvatarURL())
                    // .setFooter({
                    //     text: `Redeemed by ${author.tag}`,
                    //     iconURL: author.displayAvatarURL({ dynamic: true }),
                    // });

                    const supportserver = new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        // .setCustomId('bot-api')
                        .setLabel(`Join our Support Server`)
                        .setEmoji(emojis.home)
                        .setURL(links.supportserver);

                    const row = new ActionRowBuilder().addComponents(
                        supportserver,
                    );

                    ctx.sendMessage({
                        embeds: [embed],
                        components: [row],
                    });
                    break;
                }
                case 'deactivate': {

                    // check user permissions
                    if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                        return missingUserPermissions(ctx, "Manage Server", "send");
                    };

                    // check if the user is premium
                    let user = await User.findOne({
                        Id: author.id, // if you are using slash commands, swap message with interaction.
                    });
                    if (!user || !user?.isPremium) return errorEmbed(ctx, 'You do not have a active premium subscription!', "send");
                    // check if server does not have premium
                   
                    // if (user.guilds.count = 1 && user.guilds.id !== ctx.guild.id) return errorEmbed(ctx, 'You have already activated premium on another server!', "send");
                    if (user.guild.id !== null && user.guild.id !== ctx.guild.id) return errorEmbed(ctx, 'This server does not have active premium subscription!', "send");

                    // set the user premium
                    user.guild.id = null;
                    user.guild.isPremium = false;
                    user.guild.activatedBy = null;

                    // save the user
                    user = await user.save({ new: true }).catch(() => {});
                    client.userSettings.set(author.id, user);

                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Premium System`,
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor(colors.main)
                    .setDescription(`${emojis.dot} You have successfully deactivated premium on this server!`)
                    // .setThumbnail(client.user.displayAvatarURL())
                    // .setFooter({
                    //     text: `Redeemed by ${author.tag}`,
                    //     iconURL: author.displayAvatarURL({ dynamic: true }),
                    // });

                    const supportserver = new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        // .setCustomId('bot-api')
                        .setLabel(`Join our Support Server`)
                        .setEmoji(emojis.home)
                        .setURL(links.supportserver);

                    const row = new ActionRowBuilder().addComponents(
                        supportserver,
                    );

                    ctx.sendMessage({
                        embeds: [embed],
                        components: [row],
                    });
                    break;
                }
                default: {
                let p;
                if (ctx.isInteraction) {
                    p = '/';
                } else {
                    p = prefix;
                };

                const arr = [
                    `${emojis.dot} \`${p}premium redeem <code>\``,
                    `> Redeem a premium code!`,
                    `\n${emojis.dot} \`${p}premium status\``,
                    `> Shows your premium status!`,
                ];

                const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Premium System`,
                    iconURL: client.user.displayAvatarURL(),
                })
                .setColor(colors.main)
                .setDescription(arr.join('\n'))
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({
                    text: `${client.config.default.footer}`,
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

module.exports = Premium;