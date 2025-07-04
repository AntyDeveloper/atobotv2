const {
  ChatInputCommandInteraction,
  PermissionsBitField,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { redirectTicket } = require("../../lib/tickets/ticketActions");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "przekierujticket",
    description: "Przekierowuje ticket do managera lub ownera.",
    type: 1,
    options: [
      {
        name: "rola",
        description: "Wybierz do kogo przekierować ticket",
        type: 3, // STRING
        required: true,
        choices: [
          { name: "Manager", value: "manager" },
          { name: "Owner", value: "owner" },
        ],
      },
    ],
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
    const role = interaction.options.getString("rola");
    if (role === "manager") {
      await redirectTicket(
        interaction,
        config.tickets.roles.manager,
        "Manager"
      );
    } else if (role === "owner") {
      await redirectTicket(interaction, config.tickets.roles.owner, "Owner");
    } else {
      await interaction.reply({
        content: "Nieprawidłowa rola.",
        ephemeral: true,
      });
    }
  },
}).toJSON();
