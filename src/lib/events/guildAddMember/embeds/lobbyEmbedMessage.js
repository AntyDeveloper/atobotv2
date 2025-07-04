const EmbedBuilder = require("discord.js").EmbedBuilder;
const ButtonBuilder = require("discord.js").ButtonBuilder;
const Config = require("../../../../config");

async function welcomeMessage(client, guild, member) {
  const channel = guild.channels.cache.find(
    (channel) =>
      channel.type === "GUILD_TEXT" &&
      channel.permissionsFor(guild.me).has("SEND_MESSAGES")
  );

  if (channel) {
    const lobbyEmbedMessage = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.tag}`,
        iconURL: member.user.displayAvatarURL(),
      })
      .setColor("#00fa0a")
      .setImage(
        "https://cdn.discordapp.com/attachments/1106613112783773696/1341102250021617775/asp_grafika_1_3.png?ex=67b9638c&is=67b8120c&hm=7b3616a094e5fa768b27c2f41480896c8733a566e32bb29e09d3b06169102a11&"
      )
      .setFooter({
        text: client.user.username + " - System lobby",
        iconURL: client.user.displayAvatarURL(),
      });

    const lobbyButton = new ButtonBuilder()
      .setCustomId("lobby-button")
      .setLabel("Witaj na AtoMC!")
      .setStyle("Success")
      .setDisabled(true)
      .setEmoji("cheesin:1368914586362970182");

    const lobbyChannel = await client.channels.fetch(Config.lobby.lobbyChannel);
    await lobbyChannel.send({
      embeds: [lobbyEmbedMessage],
      components: [lobbyButton],
    });
  }
}

module.exports = welcomeMessage;
