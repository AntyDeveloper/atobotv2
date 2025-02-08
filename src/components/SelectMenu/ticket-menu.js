const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const config = require("../../config");
const ticketSchemas = require("../../schemas/ticketSchemas");
module.exports = new Component({
  customId: "ticketcategory",
  type: "select",
  /**
   *
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    const selectedValue = interaction.values[0];
    const selectedOption = interaction.component.options.find(
      (option) => option.value === selectedValue
    );
    const selectedLabel = selectedOption ? selectedOption.label : "Inne";
    const selectedEmoji =
      selectedOption && selectedOption.emoji ? selectedOption.emoji.name : "";

    const openReason = selectedEmoji + " " + selectedLabel;

    const embed = new EmbedBuilder()
      .setDescription(
        `## ` +
          openReason +
          "\n> Dziękujemy za utowrzenie ticketa!\n> Opisz w jakiej sprawie otworzyłeś ticket!\n"
      )
      .setColor("#5865F2")
      .setFooter({
        text: client.user.username + " - System ticketów",
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const ticketCount = (await ticketSchemas.countDocuments()) + 1;

    const ticketModMenu = new StringSelectMenuBuilder()
      .setCustomId("ticket-modmenu")
      .setPlaceholder("Wybierz opcję")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Przyjmij ticket")
          .setValue("accept-ticket")
          .setDescription("Przyjmij ticket")
          .setEmoji("✅"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Zamknij ticket")
          .setValue("close-ticket")
          .setDescription("Zamknij ticket")
          .setEmoji("🔒"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Zarzadzaj ticketem")
          .setValue("manage-ticket")
          .setDescription("Zarzadzaj ticketem")
          .setEmoji("➕")
      );

    const actionRow = new ActionRowBuilder().addComponents(ticketModMenu);

    await interaction.guild.channels
      .create({
        name: "💌・" + interaction.user.displayName + `-` + ticketCount,
        type: ChannelType.GuildText,
        parent: config.tickets.category,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: config.tickets.roles.support,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      })
      .then(async (channel) => {
        channel.send({
          embeds: [embed],
          components: [actionRow],
        });

        await interaction.reply({
          content: "Ticket został otwarty! <#" + channel.id + ">",
          ephemeral: true,
        });

        ticketSchemas.create({
          channelId: channel.id,
          openerId: interaction.user.id,
          supportId: null,
          openReason: selectedLabel,
          closed: false,
        });

        channel
          .send({
            content: `<@${interaction.user.id}>`,
          })
          .then((message) =>
            setTimeout(
              () => message.delete().catch((err) => console.log(err)),
              2 * 1000
            )
          );
      });
  },
}).toJSON();
