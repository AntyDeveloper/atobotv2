const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "rules-embed",
    description: "Add or remove admin roles.",
    type: 1,
    default_member_permission: "0x0000000000000008",
    options: [
      {
        name: "channel",
        description: "Podaj kanał, w którym chcesz wysłać embed z regulaminem.",
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

    const rulesEmbedLinks = new EmbedBuilder()
      .setColor("#00fa0a")
      .setDescription(`## 📄 Regulaminy`)
      .setFooter({
        text: client.user.username + " - System moderacji",
        iconURL: client.user.displayAvatarURL(),
      });
    const rulesEmbedLinksRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Regulamin serwera")
        .setURL("https://atomc.pl/regulamin")
        .setEmoji({ id: "1370198365568110733", name: "64005web" })
        .setStyle(5), // LINK
      new ButtonBuilder()
        .setLabel("Regulamin discorda")
        .setURL("https://atomc.pl/discord-regulamin")
        .setEmoji({ id: "1370198239919472650", name: "75219regles" })
        .setStyle(5) // LINK
    );

    await channel.send({
      embeds: [rulesEmbedLinks],
      components: [rulesEmbedLinksRow],
    });
  },
}).toJSON();
