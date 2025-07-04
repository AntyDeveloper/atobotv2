const EmbedBuilder = require("discord.js").EmbedBuilder;
const { pointsEmbed } = require("../../../../components/Embeds/points-embeds");
async function pointsEmbedMessage(guild, member) {
  await member.user.send({ embeds: [pointsEmbed] });
}

module.exports = pointsEmbedMessage;
