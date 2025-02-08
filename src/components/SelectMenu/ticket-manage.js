const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const ticketSchemas = require("../../schemas/ticketSchemas");
const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");

module.exports = new Component({
  customId: "ticket-mod-manage",
  type: "select",
  /**
   *
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has(config.tickets.roles.support)) {
      return interaction.reply({
        content:
          "Nie masz uprawnień do zamykania zgłoszeń.\n Tylko adminitrator może zamknać zgłoszenie.",
        ephemeral: true,
      });
    }

    if (interaction.values[0] === "add-user") {
      const selectMenu = new UserSelectMenuBuilder()
        .setCustomId("selected-user-to-add")
        .setPlaceholder("Wybierz użytkownika");

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: "Wybierz użytkownika do dodania",
        components: [row],
        ephemeral: true,
      });
    } else if (interaction.values[0] === "remove-user") {
      const selectMenu = new UserSelectMenuBuilder()
        .setCustomId("select-user-to-remove")
        .setPlaceholder("Wybierz użytkownika");

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: "Wybierz użytkownika do usunięcia",
        components: [row],
        ephemeral: true,
      });
    }
  },
}).toJSON();
