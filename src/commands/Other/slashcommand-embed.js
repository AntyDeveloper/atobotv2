const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: "embed",
    description: "Komenda do wysyłania embedów",
    type: 1,
    default_member_permissions: Permissions.FLAGS.ADMINISTRATOR,
    options: [
      {
        name: "title",
        description: "Tytuł osadzenia",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "description",
        description: "Opis osadzenia",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "color",
        description: "Kolor osadzenia (hex)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "attachment",
        description: "URL załącznika",
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "buttons",
        description:
          "Przyciski (Przykład: ['buttonName', 'customId1'], ['buttonName', 'customId1'])",
        type: ApplicationCommandOptionType.String,
        required: false,
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
    let title = interaction.options.getString("title");
    let description = interaction.options.getString("description");
    let color = interaction.options.getString("color");
    let attachment = interaction.options.getString("attachment");
    let buttons = interaction.options.getString("buttons");

    let components = null;

    if (description === null) {
      description = null;
    }

    if (attachment === null) {
      attachment = null;
    }

    if (buttons) {
      // Parse the string to convert it into an array of arrays
      buttons = buttons.split("], [").map((item) => {
        item = item.replace("[", "").replace("]", "").replace(/'/g, "").trim();
        return item.split(", ").map((str) => str.trim());
      });

      components = buttons.map(([label, custom_id]) => ({
        type: 2, // Button
        custom_id: custom_id,
        label: label,
        style: Math.random(1, 3), // Default style
      }));
    }

    const embedtoSend = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color || "#18CFE0")
      .setImage(attachment);

    await interaction.channel.send({
      embeds: [embedtoSend],
      components: {
        type: 1,
        components,
      },
    });
  },
}).toJSON();
