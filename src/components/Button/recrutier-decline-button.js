const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const recrutierSchema = require("../../models/recrutierSchema");

module.exports = new Component({
  customId: "recrutier-decline-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const messageID = interaction.message.id;
    const recrutier = await recrutierSchema.findOne({ messageId: messageID });

    if (!recrutier) {
      return interaction.reply({
        content: "Nie znaleziono zgłoszenia!",
        ephemeral: true,
      });
    }

    const user = await client.users.fetch(recrutier.userId);
    const embed = new EmbedBuilder();
    embed.setTitle("Zgłoszenie odrzucone");
    embed.setDescription(
      "> Twoje zgłoszenie zostało odrzucone.\n > Nie martw się, spróbuj ponownie za jakiś czas lub skontaktuj się z rekruterem, aby dowiedzieć się dlaczego zostało odrzucone."
    );
    embed.setColor("RED");
    await user.send({ embeds: [embed] });

    await recrutierSchema.findOneAndUpdate(
      { userId: recrutier.userId },
      { $set: { "status.0.open": false, "status.0.declined": true } }
    );

    return interaction.reply({
      content: "Zgłoszenie zostało odrzucone.",
      ephemeral: true,
    });
  },
}).toJSON();
