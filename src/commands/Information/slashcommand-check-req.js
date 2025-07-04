const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const pointsSchema = require("../../schemas/userPoints");

module.exports = new ApplicationCommand({
  command: {
    name: "punkty",
    description: "Sprawdź swój profil punktowy, topkę i zasady punktów",
    type: 1,
    options: [
      {
        name: "sprawdz",
        description: "Sprawdź punkty użytkownika",
        type: 1,
        options: [
          {
            name: "user",
            description: "Użytkownik, którego punkty chcesz sprawdzić",
            type: 6,
            required: false,
          },
        ],
      },
      {
        name: "leaderboard",
        description: "Wyświetl tabelę wyników",
        type: 1,
      },
    ],
  },
  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();

    // --- TOPKA ---
    if (subcommand === "leaderboard") {
      const topUsers = await pointsSchema.find().sort({ points: -1 }).limit(10);

      const leaderboard = topUsers
        .map(
          (user, index) =>
            `*${index + 1}.* <@${
              user.userId
            }> - <:emerald:1342160816237183087> ${user.points} punktów`
        )
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setAuthor({
          name: "<:GD_Trophy:1342169479249137674> Leaderboard",
          iconURL: client.user.displayAvatarURL(),
        })
        .setDescription(leaderboard)
        .setFooter({
          text: client.user.username + " - System punktów",
          iconURL: client.user.displayAvatarURL(),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // --- PROFIL UŻYTKOWNIKA ---
    const user = interaction.options.getUser("user") || interaction.user;
    const userId = user.id;
    const userPoints = await pointsSchema.findOne({ userId });

    const points = userPoints?.points || 0;
    const messageCount =
      userPoints?.dailyRequiments?.message?.messageCount || 0;
    const requirementMet = userPoints?.dailyRequiments?.message?.userStatus
      ? "✅"
      : "❌";
    const requireMetDate = userPoints?.dailyRequiments?.message?.requireMetDate
      ? userPoints.dailyRequiments.message.requireMetDate
          .toISOString()
          .split("T")[0]
      : "Brak";

    const pointsToday = userPoints?.dailyRequiments.dailyPoints || 0;

    const profileEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setAuthor({
        name: `Profil - ${user.username}`,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(
        `**Liczba punktów:** <:emerald:1342160816237183087> ${points}\n` +
          `**Liczba punktów dziś zdobyta:** ${pointsToday}\n` +
          `` +
          `**Wiadomości dzisiaj:** ${messageCount}\n` +
          `**Czy masz aktywny status (.gg/atomc):** ${requirementMet}\n`
      )
      .setFooter({
        text: client.user.username + " - System punktów",
        iconURL: client.user.displayAvatarURL(),
      });
    // Przyciski
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("punkty_leaderboard")
        .setLabel("Sprawdź topkę")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("punkty_za_co")
        .setLabel("Za co otrzymuje się punkty?")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [profileEmbed],
      components: [row],
      ephemeral: true,
    });

    // Collector na kliknięcia przycisków
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "punkty_leaderboard") {
        const topUsers = await pointsSchema
          .find()
          .sort({ points: -1 })
          .limit(10);
        const leaderboard = topUsers
          .map(
            (user, idx) =>
              `*${idx + 1}.* <@${
                user.userId
              }> - <:emerald:1342160816237183087> ${user.points} punktów`
          )
          .join("\n");

        const lbEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setAuthor({
            name: "<:GD_Trophy:1342169479249137674> Leaderboard",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(leaderboard)
          .setFooter({
            text: client.user.username + " - System punktów",
            iconURL: client.user.displayAvatarURL(),
          });

        await i.update({
          embeds: [lbEmbed],
          components: [row],
          ephemeral: true,
        });
      } else if (i.customId === "punkty_za_co") {
        const infoEmbed = new EmbedBuilder()
          .setColor("#90da6d")
          .setTitle("🏆 SYSTEM PUNKTÓW – ZDOBYWAJ NAGRODY! 🏆")
          .setDescription(
            "Nasz **system zdobywania punktów** już działa! Zbieraj je i wymieniaj na **niesamowite nagrody** na serwerze (i nie tylko)! 🎁"
          )
          .addFields(
            {
              name: "⭐ Jak zdobywać punkty?",
              value:
                "🎯 **Reakcja pod ogłoszeniem** – 2 punkty\n" +
                "🎯 **30 minut na kanale głosowym** (min. 2 osoby) – 4 punkty\n" +
                "🎯 **Status .gg/atomc** – 4 punkty za każdą godzinę\n" +
                "🎯 **Wysyłanie wiadomości** – od 2 do 6 punktów (losowo, co jakiś czas)",
            },
            {
              name: "❓ Czy są specjalne wymagania?",
              value:
                "✅ Aby system liczył Twoje punkty, musisz wysłać **przynajmniej 10 wiadomości w ciągu 24h**.\n" +
                "✅ **Najaktywniejsza osoba** (z największą liczbą wiadomości) otrzyma **SUPER SPECJALNĄ NAGRODĘ!** 🎁\n" +
                "✅ **Sprawdź swoje postępy** komendą **`/punkty`**!",
            }
          )
          .setFooter({
            text: client.user.username + " - System punktów",
            iconURL: client.user.displayAvatarURL(),
          });

        await i.update({
          embeds: [infoEmbed],
          components: [row],
          ephemeral: true,
        });
      }
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch {}
    });
  },
}).toJSON();
