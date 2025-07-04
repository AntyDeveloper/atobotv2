const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const config = require("../../config");
const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");
const { redirectTicket } = require("../../lib/tickets/ticketActions");

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
        content: "Nie masz uprawnien.",
        ephemeral: true,
      });
    }
    const value = interaction.values[0];

    if (value === "add-user") {
      const selectMenu = new UserSelectMenuBuilder()
        .setCustomId("selected-user-to-add")
        .setPlaceholder("Wybierz użytkownika");

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: "Wybierz użytkownika do dodania",
        components: [row],
        ephemeral: true,
      });
    } else if (value === "remove-user") {
      const selectMenu = new UserSelectMenuBuilder()
        .setCustomId("select-user-to-remove")
        .setPlaceholder("Wybierz użytkownika");

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: "Wybierz użytkownika do usunięcia",
        components: [row],
        ephemeral: true,
      });
    } else if (value === "redirect-manager") {
      await redirectTicket(
        interaction,
        config.tickets.roles.manager,
        "Manager"
      );
    } else if (value === "redirect-owner") {
      await redirectTicket(interaction, config.tickets.roles.owner, "Owner");
    }
  },
}).toJSON();
