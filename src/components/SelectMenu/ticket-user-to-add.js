const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { PermissionsBitField } = require("discord.js");
const config = require("../../config");

module.exports = new Component({
  customId: "selected-user-to-add",
  type: "select",
  /**
   *
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has(config.tickets.roles.support)) {
      return interaction.reply({
        content: "Nie masz uprawnien.",
        ephemeral: true,
      });
    }

    const selectedUserId = interaction.values[0];
    const channel = interaction.channel;

    try {
      const member = await interaction.guild.members.fetch(selectedUserId);
      await channel.permissionOverwrites.create(member, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.reply({
        content: `Dodano użytkownika ${member.user.tag} do zgłoszenia.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Wystąpił błąd podczas dodawania użytkownika do zgłoszenia.",
        ephemeral: true,
      });
    }
  },
}).toJSON();
