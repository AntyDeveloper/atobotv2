const {
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const recrutierSchema = require("../../models/recrutierSchema");

module.exports = new Component({
  customId: "recruiter-modal",
  type: "modal",
  /**
   *
   * @param {DiscordBot} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    const values = interaction.fields;
    const channel = interaction.channel;

    const embed = new EmbedBuilder();
    embed.setTitle("Formularz rekrutacyjny");
    embed.setColor("#00ff16");
    embed.setDescription(
      "Poniżej znajdziesz odpowiedzi na formularz rekrutacyjny."
    );

    client.config.question.forEach((question) => {
      const answer = values.getTextInputValue(question.id);
      embed.addFields({
        name: `**${question.label}**`,
        value: `\`\`\`${answer}\`\`\``,
      });
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("recrutier-decline-button")
        .setLabel("Odrzuć zgłoszenie")
        .setStyle("Danger"),
      new ButtonBuilder()
        .setCustomId("recrutier-accept-button")
        .setLabel("Akceptuj zgłoszenie")
        .setStyle("Success")
    );

    await channel.send({ embeds: [embed], components: [row] }).then((msg) => {
      recrutierSchema.create({
        messageId: msg.id,
        userId: interaction.user.id,
        status: [{ open: true, declined: false, accept: false }],
      });
    });

    await interaction.reply({
      content: "Pomyślnie wysłano formularz rekrutacyjny.",
      ephemeral: true,
    });
  },
}).toJSON();
