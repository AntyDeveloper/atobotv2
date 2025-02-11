const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");

function TicketEmbed(channel, client) {
  const embedtoSend = new EmbedBuilder();
  embedtoSend.setDescription(
    "> Aby stworzyć Ticket kliknij przycisk poniżej z wybranym trybem.\n> Pamiętaj, że na raz możesz mieć otworzony tylko jeden Ticket!\n> W Tickecie prosimy o nie oznaczanie administracji."
  );
  embedtoSend.setFooter({
    text: client.user.username + " - System ticketów",
    iconURL: client.user.displayAvatarURL(),
  });
  embedtoSend.setColor("#00ff16");

  const button = new ButtonBuilder()
    .setCustomId("ticket-accept-terms-button")
    .setLabel("OTWÓRZ TICKET")
    .setEmoji("🎫")
    .setStyle("Secondary");

  const row = new ActionRowBuilder().addComponents(button);

  channel.send({ embeds: [embedtoSend], components: [row] });
}

module.exports = { TicketEmbed };
