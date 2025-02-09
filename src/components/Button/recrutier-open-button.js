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
const recrutierSchema = require("../../models/recrutierSchema");

module.exports = new Component({
  customId: "open-recruiter-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const interactionUserId = interaction.user.id;
    const openRecruiter = await recrutierSchema.findOne({
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
          content:
            "Masz już otwarty formularz rekrutacyjny. Poczkej na odpowiedź.",
          ephemeral: true,
        });
      }

      if (openRecruiter.status[0].accept) {
        return interaction.reply({
          content: "Twoje zgłoszenie zostało zaakceptowane.",
          ephemeral: true,
        });
      }
    }

    const openModal = new ModalBuilder()
      .setCustomId("recruiter-modal")
      .setTitle("Formularz rekrutacyjny");

    const styleMap = {
      SHORT: TextInputStyle.Short,
      PARAGRAPH: TextInputStyle.Paragraph,
    };

    config.question.forEach((question, index) => {
      const textInput = new TextInputBuilder()
        .setCustomId(question.id)
        .setLabel(question.label)
        .setPlaceholder(question.placeholder)
        .setRequired(true)
        .setStyle(styleMap[question.style]);

      const actionRow = new ActionRowBuilder().addComponents(textInput);
      openModal.addComponents(actionRow);
    });

    await interaction.showModal(openModal);
  },
}).toJSON();
