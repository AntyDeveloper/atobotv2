const {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const ticketSchemas = require("../../schemas/guildTicket");
module.exports = new Component({
  customId: "ticket-open-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const openTicketsCount = await ticketSchemas.countDocuments({
      openerId: interaction.user.id,
      closed: false,
    });

    if (openTicketsCount >= 1) {
      await interaction.reply({
        content:
          "Masz już otwarty ticket. Zamknij jeden z nich, aby otworzyć nowy.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Wybierz kategorię")
      .setDescription("Wybierz kategorię, aby otworzyć ticket.")
      .setColor("#5865F2");

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("ticketcategory")
      .setPlaceholder("Wybierz kategorię")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Mam pytanie")
          .setEmoji("❓")
          .setDescription("Wybierz, jeśli masz pytanie")
          .setValue("question"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Zgłoszenie błędu")
          .setEmoji("🐛")
          .setDescription("Wybierz, jeśli znalazłeś błąd serwera")
          .setValue("bug"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Problem z płatnością")
          .setDescription("Wybierz, jeśli masz problem z płatnością")
          .setEmoji("💳")
          .setValue("payment"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Partnerstwo")
          .setEmoji("🤝")
          .setDescription("Wybierz, jeśli chcesz nawiązać partnerstwo")
          .setValue("partnership"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Wspołpraca")
          .setEmoji("🔰")
          .setDescription("Wybierz, jeśli chcesz nawiązać współpracę")
          .setValue("collaboration")
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
}).toJSON();
