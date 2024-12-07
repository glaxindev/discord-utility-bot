const { Collection, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Context, Event } = require('../../structures/index.js');
const NoPrefixSchema = require('../../schemas/NoPrefix.js');
const BlacklistSchema = require('../../schemas/Blacklist.js');
const PrefixSchema = require('../../schemas/Prefix.js');
const User = require('../../schemas/UserPremium.js');
const IgnoreChannelSchema = require('../../schemas/IgnoreChannel.js');
const IgnoreBypassSchema = require('../../schemas/IgnoreBypass.js');
const UserBadges = require('../../schemas/UserBadges.js');

class MessageCreate extends Event {
    constructor(client, file) {
        super(client, file, {
            name: 'messageCreate',
        });
    }
    async run(message) {
        if (message.author.bot) return;

        // Auto react when someone pings the developers
        const dev = this.client.config.owners;
        if (message.mentions.users.some((u) => dev.includes(u.id))) {
            await message.react(this.client.config.emojis.crown);
        };

        // Ignore Channel
        const IgnoreChannel = await IgnoreChannelSchema.findOne({
            guildId: message.guildId,
        });
        const IgnoreBypass = await IgnoreBypassSchema.findOne({ Id: message.author.id });

        if (IgnoreChannel?.channelIds.includes(message.channelId) && !IgnoreBypass) return;

        this.client.dokdo.run(message);

        // // No prefix
        const noPrefix = await NoPrefixSchema.findOne({ targetId: message.author.id });
        // if (noPrefix) prefix = "";

        // // if the user has no prefix enabled and message contains prefix then it should work as normal
        // if (noPrefix && message.content.startsWith(prefix)) 

        // Prefix

        let pp = this.client.config.prefix;
        const prefixData = await PrefixSchema.findOne({ guildID: message.guildId });
        if (prefixData) {
            pp = prefixData.prefix;
        };

        // premium user
        const userPremium = await User.findOne({ Id: message.author.id });

        let prefix =
          (noPrefix || userPremium?.isPremium) &&
          !message.content.startsWith(pp)
            ? ""
            : pp;

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content))
            return;
        const [matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        const command = this.client.commands.get(cmd) ||
            this.client.commands.get(this.client.aliases.get(cmd));
        if (!command)
            return;

        // Premium
        
        let user = this.client.userSettings.get(message.author.id);

        if (!user) {
          const findUser = await User.findOne({ Id: message.author.id });
          if (!findUser) {
            const newUser = await User.create({ Id: message.author.id });
            this.client.userSettings.set(message.author.id, newUser);
            user = newUser;
          } else return;
        };

         // Blacklist
        const blacklist = await BlacklistSchema.findOne({ targetId: message.author.id });
        if (command && blacklist) {
            return;
        };

        // User Badges
        const userBadges = await UserBadges.findOne({ UserId: message.author.id });
        if (!userBadges) {
           await UserBadges.create({ UserId: message.author.id });
        };

        const ctx = new Context(message, args);
        ctx.setArgs(args);
        let dm = message.author.dmChannel;
        if (typeof dm === 'undefined')
            dm = await message.author.createDM();
        if (!message.inGuild() ||
            !message.channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.ViewChannel))
            return;
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages))
            return;
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.EmbedLinks)) {
            const arr = [];
            await arr.push(`${emojis.error} I am missing the following permission(s):`);
            await arr.push(`> \`EMBED_LINKS\``);

            return await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(this.client.config.colors.error)
                        .setAuthor({
                            name: `Missing Permissions`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription(arr.join("\n"))
                        .setTimestamp()
                ],
                ephemeral: true,
            });
        };
        if (command.permissions) {
            if (command.permissions.dev) {
                if (this.client.config.owners) {
                    const findDev = this.client.config.owners.find(x => x === message.author.id);
                    if (!findDev)
                        return;
                }
            }
        }
        if (command.args) {
            if (!args.length) {
                const arr = [];
                await arr.push(`${this.client.config.emojis.error} You are missing the required arguments!`);
                await arr.push(`> \`${command.description.usage}\``);

                return await message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.config.colors.error)
                            .setAuthor({
                                name: `Missing Arguments`,
                                iconURL: message.author.displayAvatarURL({ dynamic: true }),
                            })
                            .setDescription(arr.join("\n"))
                            .setTimestamp()
                    ],
                    ephemeral: true,
                });
            }
        }
        if (!this.client.cooldown.has(cmd)) {
            this.client.cooldown.set(cmd, new Collection());
        }
        const now = Date.now();
        const timestamps = this.client.cooldown.get(cmd);
        const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;
        if (!timestamps.has(message.author.id)) {
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }
        else {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            const timeLeft = (expirationTime - now) / 1000;
            if (now < expirationTime && timeLeft > 0.9) {
                return await message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.config.colors.error)
                            .setAuthor({
                                name: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the command!`,
                                iconURL: message.author.displayAvatarURL({ dynamic: true }),
                            })
                    ],
                    ephemeral: true,
                });
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }
        if (args.includes('@everyone') || args.includes('@here'))
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(this.client.config.colors.error)
                        .setAuthor({
                            name: `You can't use this command with everyone or here!`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true }),
                        })
                ],
                ephemeral: true,
            });
        try {
            return command.run(this.client, ctx, ctx.args, user);
        }
        catch (error) {
            this.client.logger.error(error);
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(this.client.config.colors.error)
                        .setAuthor({
                            name: `There was an error while executing this command!`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true }),
                        })
                ],
                ephemeral: true,
            });
            return;
        }
    }
}

module.exports = MessageCreate;