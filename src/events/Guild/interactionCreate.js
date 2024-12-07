const {
    Collection,
    CommandInteraction,
    InteractionType,
    PermissionFlagsBits,
    EmbedBuilder,
} = require('discord.js');
const { Context, Event } = require('../../structures/index.js');
const BlacklistSchema = require('../../schemas/Blacklist.js');
const User = require('../../schemas/UserPremium.js');
const UserBadges = require('../../schemas/UserBadges.js');
const IgnoreChannelSchema = require('../../schemas/IgnoreChannel.js');
const IgnoreBypassSchema = require('../../schemas/IgnoreBypass.js');

class InteractionCreate extends Event {
    constructor(client, file) {
        super(client, file, {
            name: 'interactionCreate',
        });
    }
    async run(interaction) {
        if (interaction instanceof CommandInteraction &&
            interaction.type === InteractionType.ApplicationCommand) {
              const { commandName } = interaction;
              const command = this.client.commands.get(interaction.commandName);
              if (!command) return;

              let user = this.client.userSettings.get(interaction.user.id);

              if (!user) {
                const findUser = await User.findOne({ Id: interaction.user.id });
                if (!findUser) {
                  const newUser = await User.create({ Id: interaction.user.id });
                  this.client.userSettings.set(interaction.user.id, newUser);
                  user = newUser;
                } else return;
              };

              const blacklist = await BlacklistSchema.findOne({
                targetId: interaction.user.id,
              });
              if (command && blacklist) {
                return;
              }

            const IgnoreChannel = await IgnoreChannelSchema.findOne({
                guildId: interaction.guild.id,
            });
            const IgnoreBypass = await IgnoreBypassSchema.findOne({ Id: interaction.user.id });
    
            if (IgnoreChannel?.channelIds.includes(interaction.channel.id) && !IgnoreBypass) return;

              const userBadges = await UserBadges.findOne({ UserId: interaction.user.id });
              if (!userBadges) {
                  await UserBadges.create({ UserId: interaction.user.id });
              };

              const ctx = new Context(interaction, interaction.options.data);
              ctx.setArgs(interaction.options.data);
              if (
                !interaction.inGuild() ||
                !interaction.channel
                  .permissionsFor(interaction.guild.members.me)
                  .has(PermissionFlagsBits.ViewChannel)
              )
                return;
              if (
                !interaction.guild.members.me.permissions.has(
                  PermissionFlagsBits.SendMessages
                )
              ) {
                return;
              }
              if (
                !interaction.guild.members.me.permissions.has(
                  PermissionFlagsBits.EmbedLinks
                )
              ) {
                const arr = [];
                await arr.push(
                  `${emojis.error} I am missing the following permission(s):`
                );
                await arr.push(`> \`EMBED_LINKS\``);

                const embed = new EmbedBuilder()
                  .setColor(config.colors.error)
                  .setAuthor({
                    name: `Missing Permissions`,
                    iconURL: interaction.user.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .setDescription(arr.join("\n"))
                  .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
              }
              if (command.permissions) {
                if (command.permissions.dev) {
                  if (this.client.config.owners) {
                    const findDev = this.client.config.owners.find(
                      (x) => x === interaction.user.id
                    );
                    if (!findDev) return;
                  }
                }
              }
              if (!this.client.cooldown.has(commandName)) {
                this.client.cooldown.set(commandName, new Collection());
              }
              const now = Date.now();
              const timestamps = this.client.cooldown.get(commandName);
              const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;
              if (!timestamps.has(interaction.user.id)) {
                timestamps.set(interaction.user.id, now);
                setTimeout(
                  () => timestamps.delete(interaction.user.id),
                  cooldownAmount
                );
              } else {
                const expirationTime =
                  timestamps.get(interaction.user.id) + cooldownAmount;
                const timeLeft = (expirationTime - now) / 1000;
                if (now < expirationTime && timeLeft > 0.9) {
                  const errEmbed = new EmbedBuilder()
                    .setColor(this.client.config.colors.error)
                    .setAuthor({
                      name: `Please wait ${timeLeft.toFixed(
                        1
                      )} more second(s) before reusing the command!`,
                      iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                      }),
                    });

                  return interaction.reply({
                    embeds: [errEmbed],
                    ephemeral: true,
                  });
                }
                timestamps.set(interaction.user.id, now);
                setTimeout(
                  () => timestamps.delete(interaction.user.id),
                  cooldownAmount
                );
              }
              if (
                interaction.options.data.some(
                  (option) =>
                    option.value &&
                    option.value.toString().includes("@everyone")
                ) ||
                interaction.options.data.some(
                  (option) =>
                    option.value && option.value.toString().includes("@here")
                )
              )
                return await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(this.client.config.colors.error)
                      .setAuthor({
                        name: `You can't use this command with everyone or here!`,
                        iconURL: interaction.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      }),
                  ],
                  ephemeral: true,
                });
              try {
                await command.run(this.client, ctx, ctx.args, user);
              } catch (error) {
                this.client.logger.error(error);
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(this.client.config.colors.error)
                      .setAuthor({
                        name: `There was an error while executing this command!`,
                        iconURL: interaction.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      }),
                  ],
                  ephemeral: true,
                });
              }
            }
    }
}
module.exports = InteractionCreate;