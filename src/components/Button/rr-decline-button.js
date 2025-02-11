const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const recrutierSchema = require("../../schemas/recrutierSchema");

module.exports = new Component({
  customId: "recruiter-decline-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const messageID = interaction.message.id;
    const recruiter = await recrutierSchema.findOne({ messageId: messageID });

    if (!recruiter) {
      return interaction.reply({
        content: "Nie znaleziono zgłoszenia!",
        ephemeral: true,
      });
    }

    const user = await client.users.fetch(recruiter.userId);
    const embed = new EmbedBuilder();
    embed.setTitle("Zgłoszenie odrzucone");
    embed.setDescription(
      "> Twoje zgłoszenie zostało odrzucone.\n > Nie martw się, spróbuj ponownie za jakiś czas lub skontaktuj się z rekruterem, aby dowiedzieć się dlaczego zostało odrzucone."
    );
    embed.setColor("#FF0000");
    await user.send({ embeds: [embed] });

    await recrutierSchema.findOneAndUpdate(
      { userId: recruiter.userId },
      { $set: { "status.0.open": false, "status.0.declined": true } }
    );

    await interaction.message.edit({
      components: [], // Usuwa wszystkie komponenty (przyciski) z wiadomości
    });

    await interaction.reply({
      content: "Zgłoszenie zostało odrzucone.",
      ephemeral: true,
    });
  },
}).toJSON();
