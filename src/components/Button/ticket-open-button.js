const {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const ticketSchemas = require("../../schemas/ticketSchemas");
module.exports = new Component({
  customId: "ticketopenembed",
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

    if (openTicketsCount >= 2) {
      await interaction.reply({
        content:
          "Masz już otwarte dwa tickety. Zamknij jeden z nich, aby otworzyć nowy.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Wybierz kategorię")
      .setDescription("Wybierz kategorię, aby otworzyć ticket.")
      .setColor("#5865F2")
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("ticketcategory")
      .setPlaceholder("Wybierz kategorię")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Błąd serwera")
          .setEmoji("🛠️")
          .setDescription("Jeśli napotkałeś problem z serwerem")
          .setValue("help"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Zgłoszenie błędu")
          .setEmoji("🐛")
          .setDescription("Jeśli znalazłeś błąd serwera")
          .setValue("bug"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Problem z płatnością")
          .setDescription("Jeśli masz problem z płatnością")
          .setEmoji("💳")
          .setValue("payment"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Mam pytanie")
          .setEmoji("❓")
          .setDescription("Jeśli masz pytanie")
          .setValue("question")
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      components: [row],
      ephemeral: true,
    });
  },
}).toJSON();
