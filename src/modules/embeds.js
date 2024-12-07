const { EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const config = require('../config.js');
const { emojis } = config;

module.exports = class Embeds {
    static errorEmbed(ctx, des, type) {
        let authorIconURL;
        if (ctx instanceof ChatInputCommandInteraction) {
            authorIconURL = ctx.user.displayAvatarURL({ dynamic: true });
        } else {
            authorIconURL = ctx.author.displayAvatarURL({ dynamic: true });
        };

        const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setAuthor({
            name: des,
            iconURL: authorIconURL,
        });

        if (type === 'send') {
            ctx.sendMessage({ embeds: [embed], ephemeral: true });
        } else {
            ctx.editMessage({ embeds: [embed] });
        };
    }

    static async missingBotPermissions(ctx, perms, type) {
        let authorIconURL;
        if (ctx instanceof ChatInputCommandInteraction) {
            authorIconURL = ctx.user.displayAvatarURL({ dynamic: true });
        } else {
            authorIconURL = ctx.author.displayAvatarURL({ dynamic: true });
        };

        const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setDescription(`${emojis.blocked} I am missing the \`${perms}\` permission(s)!`);

        if (type === 'send') {
            ctx.sendMessage({ embeds: [embed], ephemeral: true });
        } else {
            ctx.editMessage({ embeds: [embed] });
        };
    }

    static async missingUserPermissions(ctx, perms, type) {
        let authorIconURL;
        if (ctx instanceof ChatInputCommandInteraction) {
            authorIconURL = ctx.user.displayAvatarURL({ dynamic: true });
        } else {
            authorIconURL = ctx.author.displayAvatarURL({ dynamic: true });
        };

        const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setDescription(`${emojis.blocked} You are missing the \`${perms}\` permission(s)!`);

        if (type === 'send') {
            ctx.sendMessage({ embeds: [embed], ephemeral: true });
        } else {
            ctx.editMessage({ embeds: [embed] });
        };
    }
}