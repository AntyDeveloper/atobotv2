const { EmbedBuilder } = require("discord.js");

async function pointsEmbedMessage(client) {
  const pointsEmbed = new EmbedBuilder()
    .setColor("#90da6d")
    .setTitle("🏆 SYSTEM PUNKTÓW – ZDOBYWAJ NAGRODY! 🏆")
    .setDescription(
      "Nasz **system zdobywania punktów** już działa! Zbieraj je i wymieniaj na **niesamowite nagrody** na serwerze (i nie tylko)! 🎁"
    )
    .addFields(
      {
        name: "⭐ Jak zdobywać punkty?",
        value:
          "🎯 **Reakcja pod ogłoszeniem** – `+2 punkty`\n" +
          "🎯 **30 minut na kanale głosowym** *(min. 2 osoby)* – `+4 punkty`\n" +
          "🎯 **Status `.gg/atomc`** – `+4 punkty za każdą godzinę`\n" +
          "🎯 **Wysyłanie wiadomości** *(co 45s)* – `+2–4 punktów (losowo)`" +
          "🎯 Oddanie głosu w ankiecie – +3 punkty",
      },
      {
        name: "🔐 Specjalne wymagania",
        value:
          "⚠️ Aby zdobywać **jakiekolwiek punkty**, musisz:\n" +
          "✅ Mieć ustawiony **status `.gg/atomc`**\n" +
          "🔝 Najaktywniejsza osoba (najwięcej wiadomości) otrzyma **SUPER NAGRODĘ!** 🎁\n" +
          "📊 Sprawdź swoje postępy: **`/punkty`**",
      },
      {
        name: "📢 Dodatkowe informacje",
        value:
          "🎉 Weź udział w **rekrutacji na pomocnika** na **#rekrutacja**\n" +
          "🎯 Sprawdź **konkursy i wyzwania** na **#konkursy**!",
      }
    )
    .setFooter({
      text: client.user.username + " – System punktów",
      iconURL: client.user.displayAvatarURL(),
    });

  return pointsEmbed;
}

module.exports = {
  pointsEmbedMessage,
};
