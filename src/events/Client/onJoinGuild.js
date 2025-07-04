const Event = require("../../structure/Event");
const Config = require("../../config");
const createUser = require("../../lib/points/createUser");
const lobbyEmbedMessage = require("../../lib/events/guildAddMember/embeds/lobbyEmbedMessage");
const welcomeEmbedMessage = require("../../lib/events/guildAddMember/embeds/welcomeEmbedMessage");
const pointsEmbedMessage = require("../../lib/events/guildAddMember/embeds/pointsEmbedMessage");
module.exports = new Event({
  event: "guildMemberAdd",
  once: false,
  /**
   *
   * @param {DiscordBot} client
   * @param {GuildMember} member
   */
  run: async (client, member) => {
    if (member.user.bot) return;
    if (member.user.id === Config.ownerId) return;

    await lobbyEmbedMessage(member.guild, member);
    await welcomeEmbedMessage(member.guild, member);

    await pointsEmbedMessage(member.guild, member);
    createUser(user.id).catch((err) => {
      console.log("Błąd podczas tworzenia użytkownika:", err);
    });
  },
}).toJSON();
