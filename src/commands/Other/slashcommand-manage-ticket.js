const {
  ChatInputCommandInteraction,
  PermissionsBitField,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { manageTicket } = require("../../lib/tickets/ticketActions");

module.exports = new ApplicationCommand({
  command: {
    name: "ticketzarzadzaj",
    description: "Wyświetla select menu do zarządzania ticketem.",
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
    await manageTicket(interaction);
  },
}).toJSON();
