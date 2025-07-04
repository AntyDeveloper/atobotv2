const Component = require("../../structure/Component");
const openTicket = require("../../lib/tickets/openTicket");
const config = require("../../config");

module.exports = new Component({
  customId: "ticketcategory",
  type: "select",
  /**
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    await openTicket(interaction);
  },
}).toJSON();
