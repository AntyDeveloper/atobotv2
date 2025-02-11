const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const recruiterSchema = require("../../schemas/recrutierSchema");

module.exports = new Component({
  customId: "recruiter-accept-button",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const messageID = interaction.message.id;
    const recruiter = await recruiterSchema.findOne({ messageId: messageID });

    if (!recruiter) {
      return interaction.reply({
        content: "Nie znaleziono zgłoszenia!",
        ephemeral: true,
      });
    }

    const user = await client.users.fetch(recruiter.userId);

    const embed = new EmbedBuilder();
    embed.setTitle("Zgłoszenie zaakceptowane");
    embed.setDescription(
      "> Gratulacje! Twoje zgłoszenie zostało zaakceptowane!\n > Otwórz ticket aby skontaktować się z rekruterem, który poinformuje Cię o dalszych krokach."
    );
    embed.setColor("#00FF00");

    await user.send({ embeds: [embed] });

    await recruiterSchema.findOneAndUpdate(
      { userId: recruiter.userId },
      { $set: { "status.0.open": false, "status.0.accept": true } }
    );

    await interaction.message.edit({
      components: [], // Usuwa wszystkie komponenty (przyciski) z wiadomości
    });

    return interaction.reply({
      content: "Zgłoszenie zostało zaakceptowane.",
      ephemeral: true,
    });
  },
}).toJSON();
