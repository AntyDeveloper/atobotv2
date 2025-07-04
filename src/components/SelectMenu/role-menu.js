const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { PermissionsBitField } = require("discord.js");
const config = require("../../config");

module.exports = new Component({
  customId: "selectNotifyRole",
  type: "select",
  /**
   *
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    const notifyRoles = config.notifyRoles;
    const selectedData = notifyRoles
      .filter((item) => interaction.values.includes(item.id))
      .slice(0, 5);
    const roleIds = selectedData.map((item) => item.id);
    const rolesToAdd = [];
    const rolesToRemove = [];

    Promise.all(roleIds.map((roleId) => interaction.guild.roles.fetch(roleId)))
      .then((roles) => {
        roles.forEach((role) => {
          if (role) {
            // Check if the role is not null
            if (interaction.member.roles.cache.has(role.id)) {
              rolesToRemove.push(role);
            } else {
              rolesToAdd.push(role);
            }
          }
        });

        let replyMessage = "";

        if (rolesToAdd.length > 0) {
          replyMessage += `Pomyślnie dodano **${rolesToAdd
            .map((role) => role.name)
            .join(", ")}**. `;
        }

        if (rolesToRemove.length > 0) {
          replyMessage += `Pomyślnie usunięto **${rolesToRemove
            .map((role) => role.name)
            .join(", ")}**. `;
        }

        interaction.reply({
          content: replyMessage || "Nie wybrano żadnych ról.",
          ephemeral: true,
        });

        rolesToAdd.forEach((role) => interaction.member.roles.add(role));
        rolesToRemove.forEach((role) => interaction.member.roles.remove(role));
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
        interaction.reply({
          content: "Wystąpił błąd podczas przetwarzania ról.",
          ephemeral: true,
        });
      });
  },
}).toJSON();
