const {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const AdminProfile = require("../../schemas/adminProfileSchema");

module.exports = new Component({
  customId: /admin_(warns|praises)_.+_\d+/,
  type: "button",
  /**
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const [type, userId, pageStr] = interaction.customId.split("_").slice(1);
    const page = parseInt(pageStr, 10) || 1;
    const profile = (await AdminProfile.findOne({ userId })) || {
      warnings: [],
      praises: [],
    };
    const items = type === "warns" ? profile.warnings : profile.praises;
    const perPage = 5;
    const maxPage = Math.max(1, Math.ceil(items.length / perPage));
    const pageItems = items.slice((page - 1) * perPage, page * perPage);

    const embed = new EmbedBuilder()
      .setTitle(type === "warns" ? "Ostrzeżenia" : "Pochwały")
      .setDescription(
        pageItems.length
          ? pageItems
              .map(
                (w, i) =>
                  `**${(page - 1) * perPage + i + 1}.** ${w.reason}\n*Od:* <@${
                    w.from
                  }> • *Data:* <t:${Math.floor(
                    new Date(w.date).getTime() / 1000
                  )}:D>${type === "warns" && w.expired ? " *(wygasłe)*" : ""}`
              )
              .join("\n\n")
          : "Brak wpisów na tej stronie."
      )
      .setFooter({ text: `Strona ${page}/${maxPage}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`admin_${type}_${userId}_${page - 1}`)
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId(`admin_${type}_${userId}_${page + 1}`)
        .setLabel("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= maxPage)
    );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
}).toJSON();
