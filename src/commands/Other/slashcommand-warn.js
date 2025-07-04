const {
  ChatInputCommandInteraction,
  PermissionsBitField,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const AdminProfile = require("../../schemas/adminProfileSchema");

module.exports = new ApplicationCommand({
  command: {
    name: "adminwarn",
    description: "Nadaj ostrzeżenie administratorowi",
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
          warnings: { reason, from: interaction.user.id, date: new Date() },
        },
      },
      { upsert: true }
    );
    // Wyślij embed na kanał logów
    const logChannel = interaction.guild.channels.cache.get(
      "1369828440647274548"
    );
    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Nowe ostrzeżenie administratora")
            .setDescription(
              `📛 Ostrzeznie ` +
                `> Ostrzeżenie dla <@${user.id}> od <@${interaction.user.id}> \n` +
                `> Powód: ${reason}`
            )
            .setColor("#FF0000")
            .setFooter({
              text: client.user.username + " - System ostrzeżeń",
              iconURL: client.user.displayAvatarURL(),
            })
            .setTimestamp(),
        ],
      });
    }
    await interaction.reply({
      content: "Ostrzeżenie nadane.",
      ephemeral: true,
    });
  },
}).toJSON();
