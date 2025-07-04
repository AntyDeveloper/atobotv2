const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: "recruiter-declaine-terms-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.reply({
      content:
        "Nie zaakceptowałeś warunków, więc nie możesz utworzyć zgłoszenia.",
      ephemeral: true,
    });
  },
}).toJSON();
