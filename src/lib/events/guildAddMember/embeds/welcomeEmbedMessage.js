const EmbedBuilder = require("discord.js").EmbedBuilder;
const Config = require("../../../../config");

async function welcomeMessage(client, guild, member) {
  const welcomeEmbed = new EmbedBuilder()
    .setColor("#00fa0a")
    .setAuthor({
      name: "👋 Witaj na serwerze! Cieszymy się, że do nas dołączyłeś! 🎉",
      iconURL: member.user.displayAvatarURL(),
    })
    .setDescription(
      `Dziękujemy, że jesteś z nami! 💖 Bardzo nas to cieszy i mamy nadzieję, że zobaczymy Cię na **starcie serwera**! 🚀\n\n` +
        `📌 **Zapisz nasz link, aby mieć do nas szybki dostęp:** [discord.gg/atomc](https://discord.gg/atomc) 🔗\n\n` +
        `📊 **System punktów już działa!** Możesz sprawdzić swoje punkty za pomocą komendy \`/punkty\`, a **ranking graczy** pod \`/punkty leaderboard\`. 🏆`
    )
    .setFooter({
      text: client.user.username + " - System lobby",
      iconURL: client.user.displayAvatarURL(),
    });

  await guild.members.fetch(member.id).then((member) => {
    const welcomeChannel = member.guild.channels.cache.find(
      (channel) =>
        channel.type === "GUILD_TEXT" &&
        channel.permissionsFor(member.guild.me).has("SEND_MESSAGES")
    );
    if (welcomeChannel) {
      welcomeChannel.send({ embeds: [welcomeEmbed] });
    }
  });

  const welcomeChannel = await client.channels.fetch(
    Config.welcome.welcomeChannelId
  );

  if (welcomeChannel) {
    const message = await welcomeChannel.send({
      content: `Witaj <@${member.id}>! Co tam słychać? 😄`,
    });

    message
      .react("<:9630peepowave:1368918601637167114>")
      .catch((err) =>
        console.error(
          `Nie można dodać reakcji do wiadomości powitalnej: ${err}`
        )
      );
  }
}

module.exports = welcomeMessage;
