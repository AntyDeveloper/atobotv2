const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

async function sendFaqEmbed(channel, client) {
  // Check if the interaction is a command

  const faqEmbed = new EmbedBuilder()
    .setColor("#00fa0a")
    .setDescription(
      `## 📄 FAQ\n` +
        `Szukasz odpowiedzi na swoje pytanie?\n` +
        `Sprawdź nasze FAQ, aby znaleźć odpowiedzi na najczęściej zadawane pytania!\n`
    )
    .setImage(
      "https://cdn.discordapp.com/attachments/1314577316281847819/1370362997863743599/faq.png?ex=681f397e&is=681de7fe&hm=ce5df44e1fa1a28ff9ab43850328d0f0490ad808d628cdf3e5eeb22815f9d1b3&"
    )
    .setFooter({
      text: client.user.username + " - System moderacji",
      iconURL: client.user.displayAvatarURL(),
    });

  const selectQuestion = new StringSelectMenuBuilder()
    .setCustomId("selectQuestion")
    .setPlaceholder("Wybierz pytanie")
    .addOptions([
      new StringSelectMenuOptionBuilder()
        .setLabel("Jak zdobywac punkty?")
        .setValue("how-to-get-points")
        .setEmoji("💎"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Czy jest otwarta rekrutacja?")
        .setValue("is-recruitment-open")
        .setEmoji("📝"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Kiedy start serwera?")
        .setValue("when-server-start")
        .setEmoji("⏰"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Wygralem konkurs, co dalej?")
        .setValue("won-contest-what-next")
        .setEmoji("🏆"),
    ]);
  const row = new ActionRowBuilder().addComponents(selectQuestion);

  await channel.send({
    embeds: [faqEmbed],
    components: [row],
  });
}

module.exports = {
  sendFaqEmbed,
};
