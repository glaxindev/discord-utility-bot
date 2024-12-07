const { Command } = require('../../structures/index.js');
const { errorEmbed } = require('../../modules/embeds.js');
const os = require("os");
const { stripIndent } = require("common-tags");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, version } = require('discord.js');
const { emojis, colors, links, team } = require('../../config.js');
const moment = require('moment') // npm i moment
moment.locale('ENG')

class Botinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            description: {
                content: 'Shows rhyton\'s current statistics!',
                examples: ['botinfo'],
                usage: 'botinfo',
            },
            category: 'information',
            aliases: ['statistics', 'stats', 'about', 'bi'],
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
              // .setAuthor({
              //   name: `Loading Statistics... ${emojis.loading}`,
              //   iconURL: client.user.displayAvatarURL(),
              // })
              .setTitle(`**Loading Statistics...** ${emojis.loading}`)
              .setColor(colors.main)
            ]
          });

        const guilds = client.guilds.cache.size;
        const channels = client.channels.cache.size;
        const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);
        const platform = process.platform.replace(/win32/g, "Windows");
        // const architecture = os.arch();
        const cores = os.cpus().length;
        const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)}%`;
        const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
        const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
        const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;
  
        const totalSeconds = process.uptime();
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = Math.floor(totalSeconds) % 60;
        let uptime = `${hours}h ${minutes}m ${seconds}s`;

        if (seconds >= 1) {
            uptime = `${seconds} seconds`
        }

        if (minutes >= 1) {
            uptime = `${minutes} minutes`
        }

        if (hours >= 1) {
            uptime = `${hours} hours`
        }
      
        let desc = "";
        desc += `${emojis.dot} **Total guilds:** ${guilds}\n`;
        desc += `${emojis.dot} **Total users:** ${users}\n`;
        desc += `${emojis.dot} **Total channels:** ${channels}\n`;
        desc += "\n";

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `Rhyton Statistics`,
            iconURL: client.user.displayAvatarURL(),
          })
          .setTitle(`${emojis.folder} **__Statistics__**`)
          .setColor(colors.main)
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(desc)
          //   .setFooter({ text:"Made With Love by glaxin1772",iconURL:message.author.displayAvatarURL()})
          .addFields(
            {
              name: `${emojis.settings} **__API Stats__**`,
              value: stripIndent`
              ${emojis.dot} **Bot Ping:** ${
                client.ws.ping
              }ms
              ${emojis.dot} **Shard ID:** ${ctx.guild.shardId}
              ${emojis.dot} **Uptime:** ${uptime}
              `,
              inline: true,
            },
            {
              name: `${emojis.info} **__CPU Usage__**`,
              value: stripIndent`
              ${emojis.dot} **OS:** ${platform}
              ${emojis.dot} **Cores:** ${cores}
              ${emojis.dot} **Usage:** ${cpuUsage}
              `,
              inline: true,
            },
            {
              name: `${emojis.settings} **__RAM Usage__**`,
              value: stripIndent`
              ${emojis.dot} **Used:** ${botUsed}
              ${emojis.dot} **Available:** ${botAvailable}
              ${emojis.dot} **Usage:** ${botUsage}
              `,
              inline: true,
            },
            {
              name: `${emojis.info} **__Discord.js Version__**`,
              value: `${emojis.dot} ${version}`,
              inline: false,
            },
            {
              name: `${emojis.dev} **__Team Member(s)__**`,
              value: stripIndent`
              ${emojis.dot} **Developer(s):** ${team.developer}
              ${emojis.dot} **Contributor(s):** ${team.contributor}
              ${emojis.dot} **Special Thanks:** ${team.special_thanks}
              `,
              inline: false,
            }
          );

          const supportserver = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          // .setCustomId('bot-api')
          .setLabel(`Support Server`)
          .setEmoji(emojis.home)
          .setURL(links.supportserver);

          const invitebutton = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          // .setCustomId('bot-ping')
          .setLabel(`Invite me`)
          .setEmoji(emojis.plus)
          .setURL(links.botinvite);

          const deletebutton = new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setCustomId('delete')
          // .setLabel(`Delete`)
          .setEmoji(emojis.delete);
          
          const row = new ActionRowBuilder()
          .addComponents(
            supportserver,
            invitebutton,
            deletebutton
          );

          let msg = await ctx.editMessage({
            embeds: [embed],
            components: [row]
          });

          let author;
          if (ctx.isInteraction) {
              author = ctx.interaction.user;
          } else {
              author = ctx.author;
          }

          const filter = (interaction) => interaction.user.id === author.id;
          const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

          collector.on('collect', async (interaction) => {
            if (interaction.customId === 'delete') {
              await msg.delete().catch(() => {});
            }
          });

          collector.on('end', async () => {
            if (!msg.deleted) {
              const disabledrow = new ActionRowBuilder()
              .addComponents(
                supportserver.setDisabled(true),
                invitebutton.setDisabled(true),
                deletebutton.setDisabled(true)
              );

              await msg.edit({
                embeds: [embed],
                components: [disabledrow]
              }).catch(() => {});
            }
          });
        } catch (err) {
            // console.log(err)
            return errorEmbed(ctx, "There was an error while executing this command!", 'edit');
        }
    }
}

module.exports = Botinfo;