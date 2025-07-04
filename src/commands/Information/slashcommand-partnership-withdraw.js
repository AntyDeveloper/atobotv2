const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const {
  getAllPartnerships,
} = require("../../lib/partnerships/partnershipUtils");
const PartnershipServer = require("../../schemas/partnershipAdvertisements");

module.exports = new ApplicationCommand({
  command: {
    name: "partnerwplata",
    description: "Wyświetla partnerstwa użytkownika i umożliwia wypłatę.",
    type: 1,
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    options: [
      {
        name: "uzytkownik",
        description: "Użytkownik do wypłaty",
        type: 6,
        required: true,
      },
    ],
  },
  run: async (client, interaction) => {
    const user = interaction.options.getUser("uzytkownik");
    if (!user) {
      return interaction.reply({
        content: "Musisz podać użytkownika.",
        ephemeral: true,
      });
    }

    // Pobierz partnerstwa tego użytkownika, które nie są wypłacone
    const partnerships = await PartnershipServer.find({
      executorId: user.id,
      withdrawn: { $ne: true },
    }).sort({ advertisedAt: 1 });

    if (!partnerships.length) {
      return interaction.reply({
        content: "Brak partnerstw do wypłaty dla tego użytkownika.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Partnerstwa do wypłaty dla ${user.tag}`)
      .setDescription(
        `Liczba partnerstw do wypłaty: **${partnerships.length}**`
      )
      .setColor("#2F3136");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`withdraw_all_${user.id}`)
        .setLabel("Wypłać wszystko")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`withdraw_amount_${user.id}`)
        .setLabel("Wypłać ilość")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    // Collector na buttony
    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === `withdraw_all_${user.id}` ||
        i.customId === `withdraw_amount_${user.id}`);

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60_000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (i.customId === `withdraw_all_${user.id}`) {
        // Oznacz wszystkie jako wypłacone
        await PartnershipServer.updateMany(
          { executorId: user.id, withdrawn: { $ne: true } },
          { $set: { withdrawn: true, withdrawnAt: new Date() } }
        );
        await i.reply({
          content: `Wypłacono **${partnerships.length}** partnerstw dla <@${user.id}>.`,
          ephemeral: true,
        });
      } else if (i.customId === `withdraw_amount_${user.id}`) {
        // Otwórz modal z ilością
        const modal = new ModalBuilder()
          .setCustomId(`withdraw_modal_${user.id}`)
          .setTitle("Wypłać określoną ilość partnerstw");

        const amountInput = new TextInputBuilder()
          .setCustomId("amount")
          .setLabel("Ilość do wypłaty")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
        await i.showModal(modal);

        // Modal collector
        const modalFilter = (m) =>
          m.customId === `withdraw_modal_${user.id}` &&
          m.user.id === interaction.user.id;

        i.awaitModalSubmit({ filter: modalFilter, time: 60_000 })
          .then(async (modalInteraction) => {
            const amount = parseInt(
              modalInteraction.fields.getTextInputValue("amount"),
              10
            );
            if (isNaN(amount) || amount < 1 || amount > partnerships.length) {
              return modalInteraction.reply({
                content: "Podano nieprawidłową ilość.",
                ephemeral: true,
              });
            }
            // Oznacz najstarsze partnerstwa jako wypłacone
            const idsToUpdate = partnerships.slice(0, amount).map((p) => p._id);
            await PartnershipServer.updateMany(
              { _id: { $in: idsToUpdate } },
              { $set: { withdrawn: true, withdrawnAt: new Date() } }
            );
            await modalInteraction.reply({
              content: `Wypłacono **${amount}** partnerstw dla <@${user.id}>.`,
              ephemeral: true,
            });
          })
          .catch(() => {});
      }
    });
  },
}).toJSON();
