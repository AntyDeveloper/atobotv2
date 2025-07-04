const ticketSchemas = require("../../schemas/guildTicket");
const config = require("../../config");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const discordTranscripts = require("@johnbotapp/discord-html-transcripts");

// ID roli realizatora partnerstw
const PARTNERSHIP_REALIZER_ROLE_ID = "1321785361264939040";

const ticketParentId = config.tickets.category;

async function checkChannelParentId(interaction) {
  const channel = interaction.channel;
  const parentId = channel.parentId;

  if (parentId !== ticketParentId) {
    return interaction.reply({
      content: "Ten kanał nie jest tickietem.",
      ephemeral: true,
    });
  }
}

async function redirectTicket(interaction, roleId, roleName) {
  const channel = interaction.channel;
  const ticketRoleId = config.supportBassedRoles.tickets;

  // Pobierz dokument ticketa, aby znać autora
  const openTicket = await ticketSchemas.findOne({
    channelId: channel.id,
  });
  if (!openTicket) {
    return interaction.reply({
      content: "Nie znaleziono ticketa.",
      ephemeral: true,
    });
  }

  checkChannelParentId(interaction);

  await channel.permissionOverwrites.edit(ticketRoleId, {
    ViewChannel: false,
    SendMessages: false,
  });

  await channel.permissionOverwrites.edit(openTicket.openerId, {
    ViewChannel: true,
    SendMessages: true,
  });

  await channel.permissionOverwrites.edit(roleId, {
    ViewChannel: true,
    SendMessages: true,
  });

  await channel.send({
    content: `Ticket został przekierowany do <@&${roleId}> przez <@${interaction.user.id}>.`,
  });
}

async function acceptTicket(interaction) {
  const openTicket = await ticketSchemas.findOne({
    channelId: interaction.channel.id,
  });
  checkChannelParentId(interaction);
  if (!openTicket) {
    return interaction.reply({
      content: "Nie znaleziono ticketa.",
      ephemeral: true,
    });
  }
  if (openTicket.claimerId) {
    return interaction.reply({
      content: "Ticket został już przyjęty przez innego użytkownika",
      ephemeral: true,
    });
  }

  await ticketSchemas.findOneAndUpdate(
    { channelId: interaction.channel.id },
    { claimerId: interaction.user.id },
    { new: true }
  );

  await interaction.channel.setTopic(
    "Opiekun ticketa: " + interaction.user.username
  );

  await interaction.reply({
    content: "Ticket został przyjęty.",
    ephemeral: true,
  });

  const embed = new EmbedBuilder()
    .setTitle("Twoje zgłoszenie zostało przyjęte")
    .setDescription(
      `Twoje zgłoszenie zostało przyjęte przez <@${interaction.user.id}>\nDaj nam chwilę na zapoznanie się z Twoim zgłoszeniem.`
    );
  await interaction.channel.send({ embeds: [embed] });
}

async function closeTicket(interaction) {
  const channel = interaction.channel;
  const member = interaction.member;

  // Pozwól zamykać ticket supportowi lub realizatorowi partnerstw
  const isSupport = member.roles.cache.has(config.tickets.roles.support);
  const isPartnershipRealizer = member.roles.cache.has(
    PARTNERSHIP_REALIZER_ROLE_ID
  );

  checkChannelParentId(interaction);

  if (!isSupport && !isPartnershipRealizer) {
    return interaction.reply({
      content: "Nie masz uprawnień do zamknięcia tego ticketa.",
      ephemeral: true,
    });
  }

  const openTicket = await ticketSchemas.findOne({
    channelId: channel.id,
  });

  if (!openTicket) {
    await interaction.reply({
      content:
        "Nie znaleziono ticketu w bazie danych. Otwórz nowy ticket. Kanał zostanie automatycznie zamknięty.",
      ephemeral: true,
    });
    setTimeout(() => channel.delete().catch(() => {}), 5 * 1000);
    return;
  }

  setTimeout(() => channel.delete().catch(() => {}), 5 * 1000);

  const transcript = await discordTranscripts.createTranscript(channel, {
    limit: -1,
    returnBuffer: false,
    fileName: `Ticket-${channel.name}.html`,
  });

  await interaction.client.channels.cache
    .get(config.tickets.logChannelId)
    .send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Zamknięto zgłoszenie")
          .addFields(
            {
              name: "Zamknięte przez",
              value: `<@${interaction.user.id}>`,
            },
            {
              name: "Data zamknięcia zgłoszenia",
              value: `${new Date().toLocaleString()}`,
            }
          )
          .setColor("#00FF00"),
      ],
      files: [transcript],
    })
    .catch(() => {});

  openTicket.closed = true;
  await openTicket.save();

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`Trwa zamykanie zgłoszenia..`)
        .setColor("#FF0000"),
    ],
  });
}

async function autoCloseTicketBypassing(interaction) {
  const channel = interaction.channel;
  const member = interaction.member;

  ticketSchemas.findOneAndUpdate(
    { channelId: channel.id },
    async (err, ticket) => {
      if (err) {
        return interaction.reply({
          content: "Wystąpił błąd podczas próby aktualizacji ticketa.",
          ephemeral: true,
        });
      }
      if (!ticket) {
        return interaction.reply({
          content: "Nie znaleziono ticketa.",
          ephemeral: true,
        });
      }

      ticket.closeBypass = true;
      await ticket.save();
    }
  );
}
async function autoCloseTicket(client) {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const ticketsToClose = await ticketSchemas.find({
    closed: false,
    closeBypass: { $ne: true },
    createdAt: { $lte: twoWeeksAgo },
    lastActivity: { $lte: oneWeekAgo },
  });

  for (const ticket of ticketsToClose) {
    // Pomijaj tickety z closeBypass === null lub createdAt === null
    if (ticket.closeBypass === null || ticket.createdAt === null) {
      continue;
    }
    try {
      // Zamknij ticket w bazie
      ticket.closed = true;
      await ticket.save();

      // Spróbuj usunąć kanał jeśli istnieje
      const guild = client.guilds.cache.get(ticket.guildId);
      if (guild) {
        const channel = guild.channels.cache.get(ticket.channelId);
        if (channel) {
          await channel.delete(
            "Ticket zamknięty automatycznie po 2 tygodniach i braku aktywności przez tydzień."
          );
        }
      }
    } catch (err) {
      console.error(
        `Błąd przy automatycznym zamykaniu ticketa ${ticket.channelId}:`,
        err
      );
    }
  }
}

async function manageTicket(interaction) {
  const {
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
  } = require("discord.js");
  const openTicket = await ticketSchemas.findOne({
    channelId: interaction.channel.id,
  });

  if (!openTicket) {
    return interaction.reply({
      content: "Nie znaleziono ticketa.",
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle("Zarządzanie ticketem")
    .setDescription("Wybierz jedną z opcji poniżej")
    .setColor("#00FF00");

  const ticketModMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket-mod-manage")
    .setPlaceholder("Wybierz opcję")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Dodaj użytkownika")
        .setValue("add-user")
        .setDescription("Dodaj użytkownika do ticketu")
        .setEmoji("➕"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Usuń użytkownika")
        .setValue("remove-user")
        .setDescription("Usuń użytkownika z ticketu")
        .setEmoji("➖"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Przekieruj do managera")
        .setValue("redirect-manager")
        .setDescription("Przekieruj ticket do managera")
        .setEmoji("🛡️"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Przekieruj do ownera")
        .setValue("redirect-owner")
        .setDescription("Przekieruj ticket do właściciela")
        .setEmoji("👑")
    );

  const actionRow = new ActionRowBuilder().addComponents(ticketModMenu);

  await interaction.reply({
    embeds: [embed],
    components: [actionRow],
    ephemeral: true,
  });
}

// Obsługa wyboru przekierowania w ticket-mod-manage
async function handleTicketManageSelect(interaction) {
  const value = interaction.values[0];
  if (value === "redirect-manager") {
    await redirectTicket(interaction, config.tickets.roles.manager, "Manager");
  } else if (value === "redirect-owner") {
    await redirectTicket(interaction, config.tickets.roles.owner, "Owner");
  }
  // Dodaj obsługę add-user, remove-user itd. jeśli potrzebujesz
}

async function handleTicketManageSelect(interaction) {
  const value = interaction.values[0];
  if (value === "redirect-manager") {
    await redirectTicket(interaction, config.tickets.roles.manager, "Manager");
  } else if (value === "redirect-owner") {
    await redirectTicket(interaction, config.tickets.roles.owner, "Owner");
  } else if (value === "redirect-partnership") {
    await redirectTicket(
      interaction,
      PARTNERSHIP_REALIZER_ROLE_ID,
      "Realizator Partnerstw"
    );
  }
  // Dodaj obsługę add-user, remove-user itd. jeśli potrzebujesz
}

module.exports = {
  acceptTicket,
  closeTicket,
  manageTicket,
  handleTicketManageSelect,
  autoCloseTicket,
  autoCloseTicketBypassing,
  redirectTicket,
};
