const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");

function RecrtierEmebed(channel, client) {
  const embedtoSend = new EmbedBuilder();
  embedtoSend.setDescription(
    "> Aby stworzyć formularz rekrutacyjny kliknij przycisk poniżej.\n> Pamiętaj, że na raz możesz mieć otwarty tylko jeden formularz!"
  );
  embedtoSend.setFooter({
    text: client.user.username + " - System rekrutacji",
    iconURL: client.user.displayAvatarURL(),
  });
  embedtoSend.setColor("#00ff16");

  const button = new ButtonBuilder()
    .setCustomId("recrutier-open-modal")
    .setLabel("OTWÓRZ ZGŁOSZENIE")
    .setEmoji("📋")
    .setStyle("Secondary");

  const row = new ActionRowBuilder().addComponents(button);

  channel.send({ embeds: [embedtoSend], components: [row] });
}

module.exports = { RecrtierEmebed };
