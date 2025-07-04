const {
  ChatInputCommandInteraction,
  PermissionsBitField,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { autoCloseTicketBypassing } = require("../../lib/tickets/ticketActions");

module.exports = new ApplicationCommand({
  command: {
    name: "bypassticket",
    description: "Ustawia bypass na automatyczne zamykanie tego ticketa.",
    type: 1,
    options: [],
    default_member_permissions:
      PermissionsBitField.Flags.ManageMessages.toString(),
  },
  options: {
    cooldown: 10000,
  },
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await autoCloseTicketBypassing(interaction);
    await interaction.reply({
      content: "Bypass na automatyczne zamykanie ticketa został ustawiony.",
      ephemeral: true,
    });
  },
}).toJSON();
