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
  embedtoSend.setImage(
    "https://cdn.discordapp.com/attachments/1106613112783773696/1341100072129134625/Zamowienie2.png?ex=67b4c445&is=67b372c5&hm=bea41be9d832f641cc0b5f4fab24a096d531b57b40578a8eb737889feb7d4c0c&"
  );

  const button = new ButtonBuilder()
    .setCustomId("ticket-accept-terms-button")
    .setLabel("OTWÓRZ TICKET")
    .setEmoji("🎫")
    .setStyle("Secondary");

  const row = new ActionRowBuilder().addComponents(button);

  channel.send({ embeds: [embedtoSend], components: [row] });
}

module.exports = { TicketEmbed };
