const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const partnershipSchema = require("../../schemas/partnershipAdvertisements");
const UserPartnership = require("../../schemas/partnershipUser"); // poprawka tutaj

module.exports = new ApplicationCommand({
  command: {
    name: "partnerstwainfo",
    description:
      "Informacje o zrealizowanych partnerstwach lub zarządzanie ostrzeżeniami",
    type: 1,

    options: [
      {
        type: 1,
        name: "info",
        description: "Informacje o zrealizowanych partnerstwach",
        options: [
          {
            name: "user",
            description: "Użytkownik, którego partnerstwa chcesz sprawdzić",
            type: 6,
            required: false,
          },
        ],
      },
      {
        type: 1,
        name: "usunwarn",
        description: "Zdejmij ostrzeżenie użytkownikowi partnerstw",
        options: [
          {
            name: "user",
            description: "Użytkownik",
            type: 6,
            required: true,
          },
        ],
      },
    ],
  },
  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub === "info") {
      const userId =
        interaction.options.getUser("user")?.id || interaction.user.id;
      const userPartnerships = await partnershipSchema.findOne({ userId });

      if (!userPartnerships) {
        return interaction.reply({
          content: "Nie znaleziono danych dla tego użytkownika.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Liczba partnerstw")
        .setDescription(
          `Użytkownik <@${userId}> ma ${userPartnerships.partnershipCount} partnerstw.`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === "usunwarn") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          content: "Brak uprawnień.",
          ephemeral: true,
        });
      }
      const user = interaction.options.getUser("user");

      const profile = await UserPartnership.findOne({ userId: user.id });
      if (
        !profile ||
        !profile.warnings ||
        profile.warnings.warningsCount === 0
      ) {
        return interaction.reply({
          content: "Ten użytkownik nie ma ostrzeżeń.",
          ephemeral: true,
        });
      }

      // Resetuj ostrzeżenia
      profile.warnings.warningsCount = 0;
      profile.warnings.lastWarning = null;
      await profile.save();

      return interaction.reply({
        content: `Wszystkie ostrzeżenia zostały usunięte użytkownikowi <@${user.id}>.`,
        ephemeral: true,
      });
    }
  },
}).toJSON();
