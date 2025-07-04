const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");
const { sendFaqEmbed } = require("../../components/Embeds/faq-embed");
module.exports = new ApplicationCommand({
  command: {
    name: "faq-embed",
    description: "Add or remove admin roles.",
    type: 1,
    default_member_permission: "0x0000000000000008",
    options: [
      {
        name: "channel",
        description: "Podaj kanał, w którym chcesz wysłać embed z faq.",
        type: 7,
      },
    ],
  },
  options: {},
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    const channel = interaction.options.getChannel("channel");

    sendFaqEmbed(client, channel);
  },
}).toJSON();
