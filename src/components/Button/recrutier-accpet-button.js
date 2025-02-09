const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const recrutierSchema = require("../../models/recrutierSchema");

module.exports = new Component({
  customId: "recrutier-accept-button",
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
    embed.setTitle("Zgłoszenie zaakceptowane");
    embed.setDescription(
      "> Gratulacje! Twoje zgłoszenie zostało zaakceptowane!\n > Otwórz ticket aby skontaktować się z rekruterem, który poinformuje Cię o dalszych krokach."
    );
    embed.setColor("GREEN");

    await user.send({ embeds: [embed] });

    await recrutierSchema.findOneAndUpdate(
      { userId: recrutier.userId },
      { $set: { "status.0.open": false, "status.0.accept": true } }
    );

    return interaction.reply({
      content: "Zgłoszenie zostało zaakceptowane.",
      ephemeral: true,
    });
  },
}).toJSON();
