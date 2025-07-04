const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "partnership-withdraw-embed",
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

    const partnershipWithdrawEmbed = new EmbedBuilder()
      .setColor("#00fa0a")
      .setDescription(
        `## 📄 Informacje na temat wyplaty\n` +
          `Jeśli chcesz wypłacić swoje zarobki, nacisnij odpowiedni przycisk!\n` +
          `Pamiętaj, aby podać kwotę, którą chcesz wypłacić.\n` +
          `Wszystkie wypłaty są realizowane w ciągu 48 godzin.\n\n` +
          `Dziękujemy za współpracę!`
      )
      .setFooter({
        text: client.user.username + " - System moderacji",
        iconURL: client.user.displayAvatarURL(),
      });

    const partnershipWithdrawRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Wypłata na pln")
        .setCustomId("partnershipWithdrawPLN")
        .setEmoji("💰")
        .setDisabled(true)
        .setStyle(2),
      new ButtonBuilder()
        .setLabel("Wypłata na atocoinsy")
        .setEmoji({ id: "1370198239919472650", name: "75219regles" })
        .setCustomId("partnershipWithdrawAtocoins")
        .setStyle(3),
      new ButtonBuilder()
        .setLabel("Sprawdź saldo")
        .setEmoji("🪪")
        .setCustomId("partnershipWithdrawCheckBalance")
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      embeds: [partnershipWithdrawEmbed],
      components: [partnershipWithdrawRow],
    });
  },
}).toJSON();
