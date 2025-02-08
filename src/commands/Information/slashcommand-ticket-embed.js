const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require("discord.js");

const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const TicketEmbed = require("../components/embeds/ticket-embed");

module.exports = new ApplicationCommand({
  command: {
    name: "ticketembed",
    description: "Wysyła embeda z informacjami o ticketach",
    type: 1,
    options: [
      {
        name: "channel",
        description: "Kanał ticketowy",
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
    ],
  },
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const channel = interaction.options.getChannel("channel");

    TicketEmbed.TicketEmbed(channel, client);
  },
}).toJSON();
