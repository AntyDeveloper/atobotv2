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
const config = require("../../config");
const discordTranscripts = require("@johnbotapp/discord-html-transcripts");
module.exports = new Component({
  customId: "ticket-close-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {},
}).toJSON();
