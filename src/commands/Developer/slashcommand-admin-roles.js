const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "admin-roles",
    description: "Add or remove admin roles.",
    type: 1,
    options: [
      {
        name: "add",
        description: "Add an admin role.",
        type: 1,
        options: [
          {
            name: "user",
            description: "The user to add.",
            type: 6,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "Remove an admin role.",
        type: 1,
        options: [
          {
            name: "user",
            description: "The user to remove.",
            type: 6,
            required: true,
          },
        ],
      },
    ],
  },
  options: {},
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    const user = interaction.options.getUser("user");
    const guild = interaction.guild;
    const member = await guild.members.fetch(user.id);
    const roles = Object.values(config.supportBassedRoles);

    if (interaction.options.getSubcommand() === "add") {
      const rolesToAdd = roles.filter(
        (roleId) => !member.roles.cache.has(roleId)
      );
      if (rolesToAdd.length === 0) {
        return interaction.editReply({
          content: "This user already has all the specified roles.",
        });
      }

      await member.roles.add(rolesToAdd);

      await interaction.editReply({
        content: "Pomyślnie dodano użytkownikowi uprawnienia administratora.",
      });
    } else if (interaction.options.getSubcommand() === "remove") {
      const rolesToRemove = roles.filter((roleId) =>
        member.roles.cache.has(roleId)
      );
      if (rolesToRemove.length === 0) {
        return interaction.editReply({
          content: "This user does not have any of the specified roles.",
        });
      }

      await member.roles.remove(rolesToRemove);

      await interaction.editReply({
        content: "Pomyślnie usunięto użytkownikowi uprawnienia administratora.",
      });
    }
  },
}).toJSON();
