const {
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const recrutierSchema = require("../../schemas/recrutierSchema");
const config = require("../../config");

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
    const channel = client.channels.cache.get(
      config.recruiter.recruiterFormsChannelId
    );

    const embed = new EmbedBuilder();
    embed.setTitle("Formularz rekrutacyjny");
    embed.setColor("#00ff16");

    const getAllDetails = await recrutierSchema.find({
      userId: interaction.user.id,
    });

    const allDeclined = getAllDetails.filter(
      (x) => x.status[0]?.declined || false
    );
    const allAccepted = getAllDetails.filter(
      (x) => x.status[0]?.accept || false
    );

    embed.setDescription(
      `Informacje o zgloszeniach użytkownika` +
        `\n\n` +
        `Zgłoszenia odrzucone: ${allDeclined.length || 0}` +
        `\n` +
        `Zgłoszenia zaakceptowane: ${allAccepted.length || 0}` +
        `\n\n` +
        "Poniżej znajdziesz odpowiedzi na formularz rekrutacyjny. \n Jeśli chcesz zaakceptować lub odrzucić zgłoszenie, skorzystaj z przycisków poniżej.\n\n"
    );
    config.question.forEach((question) => {
      const answer = values.getTextInputValue(question.id);
      embed.addFields({
        name: `**${question.label}**`,
        value: `\`\`\`${answer}\`\`\``,
      });
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("recrutier-accept-button")
        .setLabel("Akceptuj zgłoszenie")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("recruiter-decline-button")
        .setLabel("Odrzuć zgłoszenie")
        .setStyle("Danger")
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    await recrutierSchema.create({
      messageId: msg.id,
      userId: interaction.user.id,
      status: [{ open: true, declined: false, accept: false }],
    });

    const allRecruitersData = await recrutierSchema.countDocuments({});

    await channel.setTopic(`Ilość zgłoszeń: ${allRecruitersData}`);

    await interaction.reply({
      content: "Pomyślnie wysłano formularz rekrutacyjny.",
      ephemeral: true,
    });
  },
}).toJSON();
