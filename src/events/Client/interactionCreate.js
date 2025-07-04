const Event = require("../../structure/Event");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const AdminProfile = require("../../schemas/adminProfileSchema");
const Proposal = require("../../schemas/proposalSchema");
const userPartnershipSchema = require("../../schemas/partnershipUser");
const Config = require("../../config");
const { pointsEmbedMessage } = require("../../components/Embeds/points-embeds");
module.exports = new Event({
  event: "interactionCreate",
  once: false,
  /**
   * @param {DiscordBot} client
   * @param {import('discord.js').Interaction} interaction
   */
  run: async (client, interaction) => {
    // Obsługa buttonów do ostrzeżeń i pochwał admina (główne i paginacja)

    if (
      (interaction.isButton() &&
        interaction.customId === "partnershipWithdrawAtocoins") ||
      interaction.customId === "partnershipWithdrawPLN"
    ) {
      const userId = interaction.user.id;
      const userPartnership = await userPartnershipSchema.findOne({
        userId,
      });
      if (!userPartnership) {
        return interaction.reply({
          content: "Nie znaleziono uzytkownika.",
          ephemeral: true,
        });
      }

      // Ustal typ wypłaty
      const withdrawType =
        interaction.customId === "partnershipWithdrawPLN" ? "PLN" : "Atocoins";

      const modal = new ModalBuilder()
        .setCustomId(`partnershipWithdrawModal-${withdrawType}`)
        .setTitle("Wypłata");

      const withdrawInput = new TextInputBuilder()
        .setCustomId("withdrawAmount")
        .setLabel(`Kwota do wypłaty (Saldo: ${userPartnership.points})`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Podaj kwotę do wypłaty");

      const row = new ActionRowBuilder().addComponents(withdrawInput);

      if (withdrawType === "PLN") {
        const paymentInput = new TextInputBuilder()
          .setCustomId("paymentInfo")
          .setLabel("Numer BLIK lub email PayPal")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Podaj numer BLIK lub email PayPal");
        const row2 = new ActionRowBuilder().addComponents(paymentInput);
        modal.addComponents(row, row2);
      } else if (withdrawType === "Atocoins") {
        const nickInput = new TextInputBuilder()
          .setCustomId("gameNick")
          .setLabel("Nick z gry do wypłaty Atocoins")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Podaj swój nick z gry");
        const row2 = new ActionRowBuilder().addComponents(nickInput);
        modal.addComponents(row, row2);
      } else {
        modal.addComponents(row);
      }

      await interaction.showModal(modal);
    }

    // Obsługa MODALA - po wpisaniu kwoty
    if (interaction.isModalSubmit()) {
      if (!interaction.customId.startsWith("partnershipWithdrawModal-")) {
        return interaction.reply({
          content: "Nie znaleziono formularza.",
          ephemeral: true,
        });
      }

      const withdrawAmount =
        interaction.fields.getTextInputValue("withdrawAmount");
      const withdrawType = interaction.customId.split("-")[1];
      const userId = interaction.user.id;
      const userPartnership = await userPartnershipSchema.findOne({ userId });
      if (!userPartnership) {
        return interaction.reply({
          content: "Nie znaleziono uzytkownika.",
          ephemeral: true,
        });
      }
      const withdrawAmountParsed = parseInt(withdrawAmount, 10);
      if (isNaN(withdrawAmountParsed) || withdrawAmountParsed <= 0) {
        return interaction.reply({
          content: "Podano nieprawidłową kwotę.",
          ephemeral: true,
        });
      }
      if (withdrawAmountParsed > userPartnership.points) {
        return interaction.reply({
          content: "Nie masz wystarczającej ilości punktów.",
          ephemeral: true,
        });
      }

      // Pobierz info o płatności jeśli PLN, nick jeśli Atocoins
      let paymentInfo = "";
      let gameNick = "";
      if (withdrawType === "PLN") {
        paymentInfo = interaction.fields.getTextInputValue("paymentInfo");
        if (!paymentInfo) {
          return interaction.reply({
            content: "Musisz podać numer BLIK lub email PayPal.",
            ephemeral: true,
          });
        }
      }
      if (withdrawType === "Atocoins") {
        gameNick = interaction.fields.getTextInputValue("gameNick");
        if (!gameNick) {
          return interaction.reply({
            content: "Musisz podać nick z gry do wypłaty Atocoins.",
            ephemeral: true,
          });
        }
      }

      const confirmEmbed = new EmbedBuilder()
        .setColor("#00fa0a")
        .setDescription("Napewno chcesz wypłacić?")
        .addFields(
          {
            name: "Kwota do wypłaty",
            value:
              withdrawType === "Atocoins"
                ? `${withdrawAmountParsed} (${(
                    withdrawAmountParsed * 0.07
                  ).toFixed(2)} Atocoins)`
                : `${withdrawAmountParsed}`,
            inline: true,
          },
          { name: "Typ wypłaty", value: `${withdrawType}`, inline: true },
          { name: "Użytkownik", value: `<@${userId}>`, inline: true },
          ...(withdrawType === "PLN"
            ? [{ name: "BLIK/PayPal", value: paymentInfo, inline: true }]
            : []),
          ...(withdrawType === "Atocoins"
            ? [{ name: "Nick z gry", value: gameNick, inline: true }]
            : [])
        )
        .setFooter({
          text: client.user.username + " - System partnerstw",
          iconURL: client.user.displayAvatarURL(),
        });

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(
            `confirmWithdraw-${userId}-${withdrawAmountParsed}-${withdrawType}${
              withdrawType === "PLN"
                ? `-${encodeURIComponent(paymentInfo)}`
                : withdrawType === "Atocoins"
                ? `-${encodeURIComponent(gameNick)}`
                : ""
            }`
          )
          .setLabel("Zatwierdź wypłatę")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`cancelWithdraw-${userId}`)
          .setLabel("Anuluj wypłatę")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        ephemeral: true,
      });
      return;
    }

    // Obsługa BUTTONA - potwierdzenie wypłaty przez usera (wysyłka na kanał admina)
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("confirmWithdraw-")
    ) {
      const parts = interaction.customId.split("-");
      const userId = parts[1];
      const withdrawAmount = parts[2];
      const withdrawType = parts[3];
      const extraInfo =
        parts.length > 4 ? decodeURIComponent(parts.slice(4).join("-")) : null;

      const withdrawAmountParsed = parseInt(withdrawAmount, 10);
      const userPartnership = await userPartnershipSchema.findOne({ userId });
      if (!userPartnership) {
        return interaction.reply({
          content: "Nie znaleziono uzytkownika.",
          ephemeral: true,
        });
      }
      if (withdrawAmountParsed > userPartnership.points) {
        return interaction.reply({
          content: "Nie masz wystarczającej ilości punktów.",
          ephemeral: true,
        });
      }

      // Wyślij embed na kanał admina do akceptacji
      const adminEmbed = new EmbedBuilder()
        .setColor("#00fa0a")
        .setTitle("Nowa prośba o wypłatę")
        .setDescription(
          `> **Kwota:** ${withdrawAmountParsed} ${
            withdrawType === "Atocoins"
              ? `(${(withdrawAmountParsed * 0.07).toFixed(2)} Atocoins)`
              : ""
          }\n` +
            `> **Użytkownik:** <@${userId}>\n` +
            (withdrawType === "PLN"
              ? `> **BLIK/PayPal:** ${extraInfo}\n`
              : withdrawType === "Atocoins"
              ? `> **Nick z gry:** ${extraInfo}\n`
              : "")
        )
        .setFooter({
          text: client.user.username + " - System partnerstw",
          iconURL: client.user.displayAvatarURL(),
        });

      const adminRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(
            `adminAcceptWithdraw-${userId}-${withdrawAmountParsed}-${withdrawType}${
              extraInfo ? `-${encodeURIComponent(extraInfo)}` : ""
            }`
          )
          .setLabel("Akceptuj wypłatę")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`adminRejectWithdraw-${userId}`)
          .setLabel("Odrzuć wypłatę")
          .setStyle(ButtonStyle.Danger)
      );

      const logChannel = await client.channels.fetch(
        Config.partnership.withdraws.acceptedChannelId
      );
      if (logChannel) {
        await logChannel.send({
          embeds: [adminEmbed],
          components: [adminRow],
        });
      }

      await interaction.reply({
        content:
          "Twoja prośba o wypłatę została przesłana do administracji. Oczekuj na akceptację.",
        ephemeral: true,
      });
      return;
    }

    // Obsługa BUTTONA - odrzucenie przez admina
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("adminRejectWithdraw-")
    ) {
      const userId = interaction.customId.split("-")[1];
      await interaction.reply({
        content: `Wypłata dla <@${userId}> została odrzucona przez administrację.`,
        ephemeral: false,
      });
      // Możesz też powiadomić usera na DM
      try {
        const user = await client.users.fetch(userId);
        await user.send(`Twoja wypłata została odrzucona przez administrację.`);
      } catch {}
      return;
    }
    // Obsługa BUTTONA - anulowanie wypłaty
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("cancelWithdraw-")
    ) {
      const userId = interaction.customId.split("-")[1];
      const partnershiper = client.users.cache.get(userId);
      if (partnershiper) {
        partnershiper.send({
          content: `Wypłata została anulowana przez administratora.`,
        });
      }
      await interaction.reply({
        content: `Wypłata dla <@${userId}> została anulowana.`,
        ephemeral: true,
      });
      return;
    }

    if (
      interaction.isButton() &&
      interaction.customId === "partnershipWithdrawCheckBalance"
    ) {
      const userId = interaction.user.id;
      const userPartnership = await userPartnershipSchema.findOne({
        userId,
      });
      if (!userPartnership) {
        return interaction.reply({
          content: "Nie znaleziono uzytkownika.",
          ephemeral: true,
        });
      }
      const points = userPartnership.points || 0;
      const embed = new EmbedBuilder()
        .setColor("#00fa0a")
        .setDescription(`Twoje saldo wynosi: **${points}** punktów.`)
        .setFooter({
          text: client.user.username + " - System partnerstw",

          iconURL: client.user.displayAvatarURL(),
        });
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    if (
      interaction.isButton() &&
      (interaction.customId === "proposal_yes" ||
        interaction.customId === "proposal_no")
    ) {
      const proposal = await Proposal.findOne({
        messageId: interaction.message.id,
      });
      if (!proposal)
        return interaction.reply({
          content: "Nie znaleziono propozycji.",
          ephemeral: true,
        });

      // Usuń głos z drugiej opcji jeśli był
      proposal.votesYes = proposal.votesYes.filter(
        (id) => id !== interaction.user.id
      );
      proposal.votesNo = proposal.votesNo.filter(
        (id) => id !== interaction.user.id
      );

      // Dodaj głos
      if (interaction.customId === "proposal_yes") {
        proposal.votesYes.push(interaction.user.id);
      } else {
        proposal.votesNo.push(interaction.user.id);
      }
      await proposal.save();

      // Oblicz procenty
      const yesCount = proposal.votesYes.length;
      const noCount = proposal.votesNo.length;
      const total = yesCount + noCount;
      const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 100;
      const noPercent = total > 0 ? Math.round((noCount / total) * 100) : 100;

      const yesEmoji = "84893checkmark:1370198242880520202";
      const noEmoji = "26643crossmark:1370198259825508433";

      // Zaktualizuj embed i przyciski
      const author = await interaction.guild.members
        .fetch(proposal.userId)
        .catch(() => null);
      const embed = new EmbedBuilder()
        .setThumbnail(author ? author.user.displayAvatarURL() : null)
        .setDescription(
          `> **Propozycja od** ${
            author ? author.user.username : "Nieznany użytkownik"
          }\n\n` +
            `> **Treść propozycji:**\n${proposal.question}\n` +
            `\n > **Status glosow**\n` +
            `> <:${yesEmoji}> ${yesCount} (${yesPercent}%) \n> <:${noEmoji}> ${noCount} (${noPercent}%)`
        )
        .setFooter({
          text: client.user.username + " - System propozycji",
          iconURL: author ? author.user.displayAvatarURL() : undefined,
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("proposal_yes")
          .setLabel(`${yesCount} (${yesPercent}%)`)
          .setEmoji(yesEmoji)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("proposal_no")
          .setLabel(`${noCount} (${noPercent}%)`)
          .setEmoji(noEmoji)
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.update({ embeds: [embed], components: [row] });
    }

    if (
      interaction.isButton() &&
      (interaction.customId.startsWith("admin_warns_") ||
        interaction.customId.startsWith("admin_praises_"))
    ) {
      const [type, userId, pageStr] = interaction.customId.split("_").slice(1);
      const page = parseInt(pageStr, 10) || 1;
      const profile = (await AdminProfile.findOne({ userId })) || {
        warnings: [],
        praises: [],
      };
      const items = type === "warns" ? profile.warnings : profile.praises;
      const perPage = 5;
      const maxPage = Math.max(1, Math.ceil(items.length / perPage));
      const pageItems = items.slice((page - 1) * perPage, page * perPage);

      const embed = new EmbedBuilder()
        .setTitle(type === "warns" ? "Ostrzeżenia" : "Pochwały")
        .setDescription(
          pageItems.length
            ? pageItems
                .map(
                  (w, i) =>
                    `**${(page - 1) * perPage + i + 1}.** ${
                      w.reason
                    }\n*Od:* <@${w.from}> • *Data:* <t:${Math.floor(
                      new Date(w.date).getTime() / 1000
                    )}:D>${type === "warns" && w.expired ? " *(wygasłe)*" : ""}`
                )
                .join("\n\n")
            : "Brak danych do wyświetlenia."
        )
        .setFooter({ text: `Strona ${page}/${maxPage}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`admin_${type}_${userId}_${page - 1}`)
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId(`admin_${type}_${userId}_${page + 1}`)
          .setLabel("➡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= maxPage),
        new ButtonBuilder()
          .setCustomId(`admin_back_${userId}`)
          .setLabel("Wstecz")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.update({
        embeds: [embed],
        components: [row],
      });
      return;
    }

    // Obsługa przycisku "Wstecz" do profilu admina
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("admin_back_")
    ) {
      const userId = interaction.customId.split("_")[2];
      const user = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);
      if (!user) {
        return interaction.update({
          content: "Nie znaleziono użytkownika.",
          embeds: [],
          components: [],
        });
      }
      const profile = (await AdminProfile.findOne({ userId })) || {
        warnings: [],
        praises: [],
      };
      const now = Date.now();
      const activeWarnings = profile.warnings.filter(
        (w) => now - new Date(w.date).getTime() < 30 * 24 * 60 * 60 * 1000
      );

      const embed = new EmbedBuilder()
        .setTitle(`Profil administratora: ${user.user.tag}`)
        .setThumbnail(user.user.displayAvatarURL())
        .addFields(
          { name: "Ranga", value: user.roles.highest.name, inline: false },
          { name: "ID", value: user.id, inline: true },
          {
            name: "Data dołączenia",
            value: `<t:${Math.floor(user.joinedTimestamp / 1000)}:D>`,
            inline: true,
          },
          { name: "\u200B", value: "\u200B" },
          {
            name: "Aktywne ostrzeżenia",
            value: `${activeWarnings.length}`,
            inline: true,
          },
          { name: "Pochwały", value: `${profile.praises.length}`, inline: true }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`admin_warns_${user.id}_1`)
          .setLabel("Lista ostrzeżeń")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`admin_praises_${user.id}_1`)
          .setLabel("Lista pochwał")
          .setStyle(ButtonStyle.Success)
      );

      await interaction.update({
        embeds: [embed],
        components: [row],
      });
      return;
    }

    if (interaction.isSelectMenu()) {
      if (interaction.customId === "selectQuestion") {
        const selectedValue = interaction.values[0];

        if (selectedValue === "how-to-get-points") {
          const embed = await pointsEmbedMessage(client);

          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (selectedValue === "is-recruitment-open") {
          const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(
              `**Rekrutacja jest otwarta!**\n` +
                `- Sprawdź nasze ogłoszenia, aby dowiedzieć się więcej.`
            )
            .setFooter({
              text: client.user.username + " - System rekrutacji",
              iconURL: client.user.displayAvatarURL(),
            });

          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (selectedValue === "when-server-start") {
          const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(
              `**Start serwera juz niedlugo!**\n` + `- Bądź gotowy na start!`
            )
            .setFooter({
              text: client.user.username + " - System startu serwera",
              iconURL: client.user.displayAvatarURL(),
            });

          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (selectedValue === "won-contest-what-next") {
          const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(
              `**Gratulacje za wygraną w konkursie!**\n` +
                `- Skontaktuj się z administracją za pomocą <#1314582351677886505>, aby odebrać nagrodę.`
            )
            .setFooter({
              text: client.user.username + " - System konkursów",
              iconURL: client.user.displayAvatarURL(),
            });

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    }
  },
}).toJSON();
