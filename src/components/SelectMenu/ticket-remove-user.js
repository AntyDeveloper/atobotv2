const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: "select-user-to-remove",
  type: "select",
  /**
   *
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has(config.tickets.roles.support)) {
      return interaction.reply({
        content:
          "Nie masz uprawnień do zamykania zgłoszeń.\n Tylko adminitrator może zamknać zgłoszenie.",
        ephemeral: true,
      });
    }

    const selectedUserId = interaction.values[0];
    const channel = interaction.channel;

    try {
      const member = await interaction.guild.members.fetch(selectedUserId);
      await channel.permissionOverwrites.delete(member);

      await interaction.reply({
        content: `Usunięto użytkownika ${member.user.tag} ze zgłoszenia.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Wystąpił błąd podczas usuwania użytkownika ze zgłoszenia.",
        ephemeral: true,
      });
    }
  },
}).toJSON();
