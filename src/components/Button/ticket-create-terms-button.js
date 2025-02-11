const {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: "ticket-accept-terms-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const acceptButton = new ButtonBuilder()
      .setLabel("Akceptuję przedstawione warunki")
      .setStyle("Success")
      .setCustomId("ticket-open-button");

    const declineButton = new ButtonBuilder()
      .setLabel("Odrzucam przedstawione warunki")
      .setStyle("Danger")
      .setCustomId("recruiter-declaine-terms-button");

    const actionRow = new ActionRowBuilder().addComponents(
      acceptButton,
      declineButton
    );

    await interaction.reply({
      content:
        "# Tworząc zgłoszenie, zgadzasz się z poniższymi warunkami:\n Przed utworzeniem zgłoszenia oświadczasz, że:\n- zapoznałeś się z obowiązującym regulaminem serwisu **AtoMc**.\n",
      ephemeral: true,
      components: [actionRow],
    });
  },
}).toJSON();
