const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('../../config.js');
const schema = require('../../schemas/VoucherCodes.js');
const moment = require('moment');
var voucher_codes = require('voucher-code-generator');

class Gencode extends Command {
    constructor(client) {
        super(client, {
            name: 'gencode',
            description: {
                content: 'Generate a code for premium users!',
                examples: ['gencode'],
                usage: 'gencode <time>',
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

    async run(client, ctx, args, user) {
        try {
          await ctx.sendMessage({
            embeds: [
              new EmbedBuilder()
              .setTitle(`**Generating premium code(s)...** ${emojis.loading}`)
              .setColor(colors.main)
            ]
          });

            let codes = [];

            const plan = args[0];
            const plans = ["1month", "3month", "1year", "lifetime"];

            if (!plan) return errorEmbed(ctx, "You need to specify a plan for premium!", "edit");
            if (!plans.includes(plan)) return errorEmbed(ctx, "The specified plan is invalid!", "edit");

            // time
            let time;
            if (plan === "1month") time = Date.now() + 86400000 * 30;
            if (plan === "3month") time = Date.now() + 86400000 * 90;
            if (plan === "1year") time = Date.now() + 86400000 * 365;
            if (plan === "lifetime") time = Date.now() + 86400000 * 365 * 3;

            // Generate the code with a pattern of 12 characters.
            let amount = args[1];
            if (!amount) amount = 1;

            for (var i = 0; i < amount; i++) {
                const codePremium = voucher_codes.generate({
                  pattern: '####-####-####-####',
                })
          
                // Save the Code to the database (within the redeem users profile)
                const code = codePremium.toString().toUpperCase()
          
                // Security check, check if the code already exists in the database.
                const find = await schema.findOne({
                  code: code
                })
          
                // If it does not exist, create it in the database.
                if (!find) {
                  schema.create({
                    code: code,
                    plan: plan,
                    expiresAt: time
                  })
          
                  codes.push(`\`${i + 1}- ${code}\``)
                }
              }

              const arr = [
                `**Plan:** ${plan}`,
                `**Expires at:** <t:${moment.utc(time).format("X")}:R>`,
                `${codes.join("\n")}`
              ];

                const embed = new EmbedBuilder()
                .setColor(colors.main)
                .setAuthor({
                    name: `Generated ${amount} codes(s)`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(arr.join("\n"))
                .setFooter({
                    text: `To redeem use ${client.config.prefix}redeem <code>`,
                    iconURL: ctx.author.displayAvatarURL()
                });

                ctx.editMessage({
                    embeds: [embed]
                });
        } catch (err) {
            console.log(err);
            errorEmbed(ctx, "There was an error while executing this command!", "edit");
        }
    }
}

module.exports = Gencode;