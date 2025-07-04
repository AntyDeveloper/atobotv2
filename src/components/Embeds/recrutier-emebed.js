const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const recrutierSchema = require("../../schemas/recruitmentApplications");

function RecrtierEmebed(channel, client) {
  const embedtoSend = new EmbedBuilder();
  embedtoSend.setDescription(
    "> Aby stworzyć formularz rekrutacyjny kliknij przycisk poniżej."
  );
  embedtoSend.setFooter({
    text: client.user.username + " - System rekrutacji",
    iconURL: client.user.displayAvatarURL(),
  });
  embedtoSend.setColor("#00ff16");
  embedtoSend.setImage(
    "https://cdn.discordapp.com/attachments/1106613112783773696/1341101683719143566/asp_grafika_1_1.png?ex=67b4c5c5&is=67b37445&hm=87a381d78325fb1d59dadb3decc4f901f0f8252823bcd7f4426b30b6bc63a3c8&"
  );

  const button = new ButtonBuilder()
    .setLabel("OTWÓRZ PODANIE")
    .setURL("https://atomc.pl/podanie")
    .setEmoji("📋")

    .setStyle("Secondary");

  const row = new ActionRowBuilder().addComponents(button);

  channel.send({ embeds: [embedtoSend], components: [row] });
}

module.exports = { RecrtierEmebed };
