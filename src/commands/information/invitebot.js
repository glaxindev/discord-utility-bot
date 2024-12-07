const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { emojis, colors, links, desc } = require('../../config.js');

class Invitebot extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            description: {
                content: 'Invite me to your server!',
                examples: ['invite'],
                usage: 'invite',
            },
            category: 'information',
            aliases: ['inv', 'invbot'],
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
                  .setTitle(`**Loading invite link...** ${emojis.loading}`)
                  .setColor(colors.main)
                ]
              });

              let author;
              if (ctx.isInteraction) {
                  author = ctx.interaction.user;
              } else {
                  author = ctx.author;
              }

              const embed = new EmbedBuilder()
              .setAuthor({
                name: `Invite me to your server!`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setDescription(`> ${desc}`)
              .setColor(colors.main)
              .setThumbnail(client.user.displayAvatarURL())
              .setImage(links.banner)
              .setFooter({ text:"Made with love by glaxin1772", iconURL:author.displayAvatarURL({ dynamic: true }) });
            
              const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(`Invite me to your server!`)
                .setEmoji(emojis.plus)
                .setURL(links.botinvite),
              );

              ctx.editMessage({
                embeds: [embed],
                components: [row],
              });
        } catch (err) {
            errorEmbed(ctx, "There was an error while executing this command!", "edit");
        }
    }
}

module.exports = Invitebot;