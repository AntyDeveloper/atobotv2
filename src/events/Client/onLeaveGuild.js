const Event = require("../../structure/Event");
const partnershipSchema = require("../../schemas/partnershipAdvertisements");

module.exports = new Event({
  event: "guildMemberRemove",
  once: false,
  /**
   * @param {DiscordBot} client
   * @param {import('discord.js').GuildMember} member
   */
  run: async (client, member) => {
    // Sprawdź, czy user widnieje w partnershipAdvertisements
    const partnership = await partnershipSchema.findOne({ userId: member.id });
    if (!partnership) return;

    // Pobierz kanał i usuń wiadomość przypisaną w bazie
    try {
      const channel = await client.channels.fetch(partnership.channelId);
      if (channel && channel.isTextBased()) {
        const msg = await channel.messages
          .fetch(partnership.messageId)
          .catch(() => null);
        if (msg) await msg.delete();
      }
    } catch (err) {
      console.error("Błąd przy usuwaniu wiadomości partnerstwa:", err);
    }

    // Usuń wpis z bazy
    await partnershipSchema.deleteOne({ userId: member.id });
  },
}).toJSON();
