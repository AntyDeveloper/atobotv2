const {
  ChatInputCommandInteraction,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const AdminProfile = require("../../schemas/adminProfileSchema");

module.exports = new ApplicationCommand({
  command: {
    name: "pochwala",
    description: "Nadaj pochwałę administratorowi",
    type: 1,
    options: [
      {
        name: "user",
        description: "Administrator",
        type: 6,
        required: true,
      },
      {
        name: "reason",
        description: "Powód",
        type: 3,
        required: true,
      },
    ],
    default_member_permissions:
      PermissionsBitField.Flags.Administrator.toString(),
  },

  /**
   * @param {import("../../client/DiscordBot")} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({ content: "Brak uprawnień.", ephemeral: true });
    }
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    await AdminProfile.updateOne(
      { userId: user.id },
      {
        $push: {
          praises: { reason, from: interaction.user.id, date: new Date() },
        },
      },
      { upsert: true }
    );
    // Wyślij embed na kanał logów
    const logChannel = interaction.guild.channels.cache.get(
      "1314351033639636993"
    );
    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `## ⚜️ Pochwala ` +
                `> Pochwała została nadana przez <@${interaction.user.id}> dla <@${user.id}> \n` +
                `> Treść: ${reason}`
            )
            .setThumbnail(user.displayAvatarURL())
            .setColor("#00FF00")
            .setFooter({
              text: client.user.username + " - System pochwał",
              iconURL: client.user.displayAvatarURL(),
            })
            .setTimestamp(),
        ],
      });
    }
    await interaction.reply({ content: "Pochwała nadana.", ephemeral: true });
  },
}).toJSON();
