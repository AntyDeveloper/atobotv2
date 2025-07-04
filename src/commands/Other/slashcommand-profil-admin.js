const {
  ChatInputCommandInteraction,
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const AdminProfile = require("../../schemas/adminProfileSchema");

module.exports = new ApplicationCommand({
  command: {
    name: "adminprofil",
    description: "Wyświetl profil administratora",
    type: 1,
    options: [
      {
        name: "user",
        description: "Administrator",
        type: 6,
        required: true,
      },
    ],
    default_member_permissions:
      PermissionsBitField.Flags.ManageGuild.toString(),
  },
  options: {
    cooldown: 5000,
  },
  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    const profile = (await AdminProfile.findOne({ userId: user.id })) || {
      warnings: [],
      praises: [],
    };
    const now = Date.now();
    const activeWarnings = profile.warnings.filter(
      (w) => now - new Date(w.date).getTime() < 30 * 24 * 60 * 60 * 1000
    );

    const embed = new EmbedBuilder()
      .setTitle(`Profil administratora: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Ranga", value: member.roles.highest.name, inline: false },

        { name: "ID", value: user.id, inline: true },
        {
          name: "Data dołączenia",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
        },
        {
          name: "Aktywne ostrzeżenia",
          value: `${activeWarnings.length}`,
          inline: true,
        },
        { name: "Pochwały", value: `${profile.praises.length}`, inline: true }
      );

    const row = new ActionRowBuilder();
    if (
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`admin_warns_${user.id}_1`)
          .setLabel("Lista ostrzeżeń")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`admin_praises_${user.id}_1`)
          .setLabel("Lista pochwał")
          .setStyle(ButtonStyle.Success)
      );
    }

    await interaction.reply({
      embeds: [embed],
      components: row.components.length ? [row] : [],
      ephemeral: true,
    });
  },
}).toJSON();
