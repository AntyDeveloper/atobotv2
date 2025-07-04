const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  PermissionsBitField,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const userPartnershipSchema = require("../../schemas/partnershipUser");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "partnership-manager",
    description: "Zarządzaj menedżerami partnerstwa.",
    type: ApplicationCommandOptionType.ChatInput,
    options: [
      {
        name: "set",
        description:
          "Ustaw użytkownika jako menedżera partnerstwa i przypisz mu stawkę.",
        type: 1,
        options: [
          {
            name: "user",
            description: "Użytkownik, który ma zostać menedżerem partnerstwa.",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "rate",
            description:
              "Stawka partnerstwa dla użytkownika (np. 0.5 dla 50%).",
            type: ApplicationCommandOptionType.Number,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "Usuń użytkownika z bazy menedżerów partnerstwa.",
        type: 1,
        options: [
          {
            name: "user",
            description: "Użytkownik do usunięcia z bazy partnerstwa.",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },
  options: {
    permissions: PermissionsBitField.Flags.Administrator.toString(),
  },
  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.guild) {
      return interaction.reply({
        content: "Ta komenda może być użyta tylko na serwerze.",
        ephemeral: true,
      });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "set") {
      const targetUser = interaction.options.getUser("user");
      const rate = interaction.options.getNumber("rate");

      if (!targetUser) {
        return interaction.reply({
          content: "Musisz wskazać użytkownika.",
          ephemeral: true,
        });
      }

      if (rate === null || rate < 0) {
        return interaction.reply({
          content: "Musisz podać prawidłową, nieujemną stawkę.",
          ephemeral: true,
        });
      }

      const member = interaction.guild.members.cache.get(targetUser.id);
      if (!member) {
        return interaction.reply({
          content: "Wskazany użytkownik nie jest członkiem tego serwera.",
          ephemeral: true,
        });
      }

      const partnershipManagerRoleId = config.tickets.roles.partnershipManager;

      if (!partnershipManagerRoleId) {
        console.error("Partnership manager role ID is not defined in config");
        return interaction.reply({
          content:
            "Błąd konfiguracji: ID roli menedżera partnerstwa brakuje. Skontaktuj się z administratorem.",
          ephemeral: true,
        });
      }

      const role = interaction.guild.roles.cache.get(partnershipManagerRoleId);
      if (!role) {
        return interaction.reply({
          content: `Rola menedżera partnerstwa (ID: ${partnershipManagerRoleId}) nie została znaleziona. Sprawdź konfigurację.`,
          ephemeral: true,
        });
      }

      try {
        const existingPartnership = await userPartnershipSchema.findOne({
          userId: targetUser.id,
        });

        await member.roles.add(role);

        await userPartnershipSchema.findOneAndUpdate(
          { userId: targetUser.id },
          { userId: targetUser.id, rate: rate },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        let successMessage;
        if (existingPartnership) {
          successMessage = `Stawka dla menedżera partnerstwa ${
            targetUser.username
          } została zaktualizowana na ${rate * 100}%. Rola ${
            role.name
          } została przypisana/potwierdzona.`;
        } else {
          successMessage = `${
            targetUser.username
          } został ustawiony jako menedżer partnerstwa ze stawką ${
            rate * 100
          }% i przypisano mu rolę ${role.name}.`;
        }

        await interaction.reply({
          content: successMessage,
          ephemeral: false,
        });
      } catch (error) {
        console.error("Error setting partnership manager:", error);
        let errorMessage =
          "Wystąpił błąd podczas ustawiania menedżera partnerstwa.";
        if (error.code === 50013) {
          errorMessage =
            "Nie mam uprawnień do przypisania tej roli. Sprawdź hierarchię ról i moje uprawnienia.";
        }
        await interaction.reply({
          content: errorMessage,
          ephemeral: true,
        });
      }
    }

    if (sub === "remove") {
      const targetUser = interaction.options.getUser("user");
      if (!targetUser) {
        return interaction.reply({
          content: "Musisz wskazać użytkownika.",
          ephemeral: true,
        });
      }

      const partnershipManagerRoleId = config.tickets.roles.partnershipManager;
      const member = interaction.guild.members.cache.get(targetUser.id);

      try {
        // Usuń z bazy
        await userPartnershipSchema.deleteOne({ userId: targetUser.id });

        // Usuń rolę jeśli ją ma
        if (
          member &&
          partnershipManagerRoleId &&
          member.roles.cache.has(partnershipManagerRoleId)
        ) {
          await member.roles.remove(partnershipManagerRoleId);
        }

        await interaction.reply({
          content: `Użytkownik ${targetUser.username} został usunięty z bazy menedżerów partnerstwa i rola została odebrana (jeśli ją miał).`,
          ephemeral: false,
        });
      } catch (error) {
        console.error("Error removing partnership manager:", error);
        await interaction.reply({
          content: "Wystąpił błąd podczas usuwania menedżera partnerstwa.",
          ephemeral: true,
        });
      }
    }
  },
}).toJSON();
