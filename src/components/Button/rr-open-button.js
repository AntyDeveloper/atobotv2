const {
  ButtonInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const config = require("../../config");
const recruiterSchema = require("../../schemas/recruitmentApplications");

module.exports = new Component({
  customId: "recruiter-open-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const interactionUserId = interaction.user.id;
    const openRecruiter = await recruiterSchema.findOne({
      userId: interactionUserId,
    });

    if (openRecruiter) {
      const lastSubmissionTime = new Date(openRecruiter.updatedAt);
      const currentTime = new Date();
      const timeDifference = currentTime - lastSubmissionTime;
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference < 12) {
        return interaction.reply({
          content:
            "Musisz poczekać 12 godzin od ostatniego zgłoszenia, zanim będziesz mógł złożyć nowe.",
          ephemeral: true,
        });
      }

      if (openRecruiter.status[0].open) {
        return interaction.reply({
          content: "Masz już otwarte zgłoszenie.",
          ephemeral: true,
        });
      }
    }

    const modal = new ModalBuilder()
      .setCustomId("recruiter-modal")
      .setTitle("Formularz rekrutacyjny");

    config.question.forEach((question) => {
      let style;
      switch (question.style.toUpperCase()) {
        case "SHORT":
          style = TextInputStyle.Short;
          break;
        case "PARAGRAPH":
          style = TextInputStyle.Paragraph;
          break;
        default:
          throw new Error(`Invalid style: ${question.style}`);
      }

      // Skróć etykietę, jeśli przekracza 45 znaków
      let label = question.label;
      if (label.length > 45) {
        label = label.substring(0, 42) + "...";
      }

      const input = new TextInputBuilder()
        .setCustomId(question.id)
        .setLabel(label)
        .setPlaceholder(question.placeholder)
        .setStyle(style);

      const actionRow = new ActionRowBuilder().addComponents(input);
      modal.addComponents(actionRow);
    });

    await interaction.showModal(modal);
  },
}).toJSON();
