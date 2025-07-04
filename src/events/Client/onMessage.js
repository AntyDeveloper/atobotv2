const Event = require("../../structure/Event");
const Config = require("../../config");
const ticketSchema = require("../../schemas/guildTicket");
const {
  addPoints,
  checkUserStatus,
  getLastMessageTime,
} = require("../../lib/points/pointsUtils");
const pointsSchema = require("../../schemas/userPoints");
const Proposal = require("../../schemas/proposalSchema");
const { closeTicket } = require("../../lib/tickets/ticketActions");
const {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require("discord.js");
const createUser = require("../../lib/points/createUser");

module.exports = new Event({
  event: "messageCreate",
  once: false,
  /**
   * @param {DiscordBot} client
   * @param {Message} message
   */
  run: async (client, message) => {
    if (message.author.bot) return;

    const PLUS_REP_CHANNEL_ID = "1370248136127418389"; // <-- podmień na docelowy kanał

    if (
      message.member?.roles.cache.has("1321785361264939040") &&
      message.content.toLowerCase().includes("zamknij")
    ) {
      await closeTicket({
        channel: message.channel,
        user: message.author,
        member: message.member,
        reply: (...args) => message.reply(...args),
      });
    }

    if (
      message.content.startsWith("+rep ") ||
      message.content.startsWith("-rep ")
    ) {
      const isPraise = message.content.startsWith("+rep ");
      const repType = isPraise ? "Pochwała" : "Skarga";
      const color = isPraise ? "#00ff00" : "#ff0000";

      // Wyciągnij wzmiankowanego użytkownika i treść
      const mentionMatch = message.content.match(
        /^(\+rep|\-rep)\s+<@!?(\d+)>\s+(.+)/i
      );
      if (!mentionMatch) {
        return message.reply(
          "Poprawny format: `+rep @użytkownik treść` lub `-rep @użytkownik treść`"
        );
      }
      const mentionedId = mentionMatch[2];
      const repContent = mentionMatch[3];

      const repEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(repType)
        .setDescription(
          `**Typ:** ${repType}\n**Od:** <@${message.author.id}>\n**Dla:** <@${mentionedId}>\n\n\`\`\`\n${repContent}\n\`\`\``
        )
        .setTimestamp();
      const repChannel = await message.guild.channels
        .fetch(PLUS_REP_CHANNEL_ID)
        .catch(() => null);
      if (repChannel && repChannel.isTextBased()) {
        await repChannel.send({ embeds: [repEmbed] });
        await message.reply(`${repType} została wysłana na odpowiedni kanał!`);
      } else {
        await message.reply(
          "Nie udało się znaleźć kanału do wysyłki pochwały/skargi."
        );
      }
      return;
    }

    const PROPOSAL_CHANNEL_ID = "1314582708038537256";
    if (
      message.channel.id === PROPOSAL_CHANNEL_ID &&
      !message.author.bot &&
      message.content
    ) {
      const lastProposal = await Proposal.findOne({
        userId: message.author.id,
      }).sort({ createdAt: -1 });
      if (
        lastProposal &&
        Date.now() - new Date(lastProposal.createdAt).getTime() <
          PROPOSAL_COOLDOWN
      ) {
        const timeLeft = Math.ceil(
          (PROPOSAL_COOLDOWN -
            (Date.now() - new Date(lastProposal.createdAt).getTime())) /
            60000
        );
        return message.reply(
          `Musisz odczekać ${timeLeft} min przed wysłaniem kolejnej propozycji.`
        );
      }

      const yesEmoji = "84893checkmark:1370198242880520202";
      const noEmoji = "26643crossmark:1370198259825508433";

      // Utwórz embed i przyciski
      const embed = new EmbedBuilder()
        .setThumbnail(message.author.displayAvatarURL())
        .setDescription(
          `> **Propozycja od** ${message.author.username}\n\n` +
            `> **Treść propozycji:**\n\`\`\`\n${message.content}\n\`\`\`\n` +
            `\n > **Status glosow**\n` +
            `> <:${yesEmoji}> 0 (100%) \n> <:${noEmoji}> 0 (100%)`
        )
        .setImage(
          "https://cdn.discordapp.com/attachments/1314577316281847819/1370431871556517898/propozycja.png?ex=681f79a3&is=681e2823&hm=23d7e83473c495427fcec1b2827c560b4258f446252a3cf4457d5661b4ab73be&"
        )
        .setFooter({
          text: client.user.username + " - System propozycji",
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("proposal_yes")
          .setLabel(`0 (100%)`)
          .setEmoji(yesEmoji)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("proposal_no")
          .setLabel(`0 (100%)`)
          .setEmoji(noEmoji)
          .setStyle(ButtonStyle.Danger)
      );

      const sent = await message.channel.send({
        embeds: [embed],
        components: [row],
      });

      // Utwórz wątek do propozycji (jeśli chcesz)
      await sent.startThread({
        name: `Propozycja od ${message.author.username}`,
        reason: "Propozycja od użytkownika",
      });

      // Zapisz propozycję do bazy
      await Proposal.create({
        messageId: sent.id,
        channelId: sent.channel.id,
        userId: message.author.id,
        question: message.content,
      });

      // Usuń oryginalną wiadomość
      await message.delete().catch(() => {});
    }
    const userId = message.author.id;
    const now = new Date();

    const lowerContent = message.content.toLowerCase();

    if (
      lowerContent.includes("kiedy live") ||
      lowerContent.includes("aspi kiedy live") ||
      lowerContent.includes("kiedy aspi live") ||
      lowerContent.includes("kiedy live aspi") ||
      lowerContent.includes("asp kiedy live") ||
      lowerContent.includes("kiedy live asp")
    ) {
      return message.reply("Nie wiem, ale na pewno będzie! :D");
    }

    if (
      lowerContent.includes("kiedy serwer") ||
      lowerContent.includes("kiedy serwer asp")
    ) {
      return message.reply("Na 5000% na 500 osób na discordzie! :D");
    }

    if (
      message.channel.parentId === "1314352293885509753" ||
      message.channel.parentId === "1341240425826095144"
    ) {
      await ticketSchema.findOneAndUpdate(
        { channel: message.channel.id },
        { $set: { lastActivity: now } },
        { new: true }
      );
    }

    // Sprawdź, czy użytkownik spełnia warunki do zdobywania punktów
    const isEligible = await checkUserStatus(userId, now);
    if (!isEligible) return;

    // Przyznaj punkty, jeśli spełnione są warunki czasowe
    const lastMessageTime = await getLastMessageTime(userId);
    if (now - lastMessageTime >= 45000) {
      const randomPoints = Math.floor(Math.random() * (4 - 2 + 1)) + 2; // Losowe punkty od 2 do 4
      await addPoints(userId, randomPoints, now);

      // Zaktualizuj czas ostatniej wiadomości
      await pointsSchema.findOneAndUpdate(
        { userId },
        { $set: { "dailyRequiments.message.lastMessage": now } },
        { new: true }
      );
    }
  },
}).toJSON();
