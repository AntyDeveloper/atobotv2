const Component = require("../../structure/Component");
const config = require("../../config");
const {
  acceptTicket,
  closeTicket,
  manageTicket,
} = require("../../lib/tickets/ticketActions");

module.exports = new Component({
  customId: "ticket-modmenu",
  type: "select",
  /**
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

    const action = interaction.values[0];
    if (action === "accept-ticket") {
      await acceptTicket(interaction);
    } else if (action === "close-ticket") {
      await closeTicket(interaction);
    } else if (action === "manage-ticket") {
      await manageTicket(interaction);
    }
  },
}).toJSON();
