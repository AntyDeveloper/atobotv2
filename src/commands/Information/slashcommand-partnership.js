const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  MessageCollector,
  PermissionFlagsBits,
} = require("discord.js");

const ApplicationCommand = require("../../structure/ApplicationCommand");
const { addPartnership } = require("../../lib/partnerships/partnershipUtils");

const partnershipUser = require("../../schemas/partnershipUser");

module.exports = new ApplicationCommand({
  command: {
    name: "partnerstwa",
    description: "Zrealizuj partnerstwo",
    type: 1,
    options: [
      {
        name: "partner",
        description: "Użytkownik, z którym chcesz zrealizować partnerstwo",
        type: 6,
        required: false,
      },
    ],
  },
  run: async (client, interaction) => {
    if (
      !interaction.member ||
      !interaction.member.roles.cache.has("1321785361264939040") ||
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "Nie masz permisji.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: "Podaj treść reklamy (zawierającą zaproszenie Discord).",
      ephemeral: true,
    });

    const filter = (msg) => msg.author.id === interaction.user.id;
    const collector = new MessageCollector(interaction.channel, {
      filter,
      time: 60000,
      max: 1,
    });
    const partner = interaction.options.getUser("partner");

    if (!partner) {
      return interaction.followUp({
        content: "Podaj użytkownika, z którym chcesz zrealizować partnerstwo.",
        ephemeral: true,
      });
    }

    collector.on("collect", async (msg) => {
      const messageContent = msg.content;
      const discordLinkRegex =
        /https?:\/\/(www\.)?discord\.gg\/([a-zA-Z0-9]+)/g;
      const keywordsRegex = /\b(discord:|dc:|discord.gg\/)\b/gi;
      const hiddenPingsRegex = /@(everyone|here)/g;

      // Remove Discord links and specific keywords
      let cleanedMessage = messageContent.replace(
        discordLinkRegex,
        "Link poniżej"
      );
      cleanedMessage = cleanedMessage.replace(keywordsRegex, "");
      cleanedMessage = cleanedMessage.replace(hiddenPingsRegex, "");

      // Extract Discord links to send below the embed
      const discordLinks = messageContent.match(discordLinkRegex) || [];

      // Pobierz serverId z zaproszenia (pierwszy link w wiadomości)
      let serverId = null;
      if (discordLinks.length > 0) {
        const inviteCode = discordLinks[0].split("/").pop();
        try {
          const invite = await client.fetchInvite(inviteCode);
          serverId = invite.guild?.id || null;
        } catch (err) {
          serverId = null;
        }
      }

      if (!serverId) {
        return interaction.followUp({
          content:
            "Nie udało się pobrać serverId z zaproszenia Discord. Upewnij się, że podałeś poprawny link.",
          ephemeral: true,
        });
      }

      // Sprawdź cooldown i dodaj partnerstwo
      const addResult = await addPartnership(
        serverId,
        interaction.user.id,
        msg.channel.id,
        msg.id
      );

      const user = await partnershipUser.findOne({
        userId: interaction.user.id,
      });
      const rent = user?.rent || 0;
      const currentPoints = user?.points || 0;

      await partnershipUser.findOneAndUpdate(
        { userId: interaction.user.id },
        {
          $set: {
            lastPartnership: new Date(),
            points: currentPoints + rent,
          },
        },
        { upsert: true }
      );
      // --- KONIEC DOPISYWANIA ---

      if (!addResult.success) {
        return interaction.followUp({
          content: addResult.reason,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#2F3136")
        .setAuthor({
          name: `${partner.username} | Partner`,
          iconURL: partner.displayAvatarURL(),
        })
        .setDescription(cleanedMessage)
        .setFooter({
          text: client.user.username + " - System partnerstw",
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const channel = await client.channels.fetch("1321786557115666504");
      await channel.send({ embeds: [embed] });
      await channel.send({ content: `Partner: <@${partner.id}>` });

      if (discordLinks.length > 0) {
        await channel.send({
          content: `Linki: ${discordLinks.join("\n")}`,
        });
      }

      await interaction.followUp({
        content: "Partnerstwo zostało zrealizowane i zapisane w systemie.",
        ephemeral: true,
      });

      const congratulationEmbed = new EmbedBuilder()
        .setColor("#2F3136")
        .setDescription(
          `Dziękujemy za zawarcie partnerstwa! \nUwaga po opuszczeniu serwera, partnerstwo zostanie anulowane i reklama usunieta!`
        )
        .setFooter({
          text: client.user.username + " - System partnerstw",
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();
      partner
        .send({
          embeds: [congratulationEmbed],
        })
        .catch((err) => {
          console.error(
            `Nie można wysłać wiadomości do użytkownika ${partner.tag}: ${err}`
          );
        });
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        interaction.followUp({
          content: "Nie wysłałeś wiadomości w odpowiednim czasie.",
          ephemeral: true,
        });
      }
    });
  },
}).toJSON();
