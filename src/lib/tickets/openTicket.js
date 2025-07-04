const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const ticketSchemas = require("../../schemas/guildTicket");
const config = require("../../config");

async function openTicket(interaction) {
  const selectedValue = interaction.values[0];
  const selectedOption = interaction.component.options.find(
    (option) => option.value === selectedValue
  );
  const selectedLabel = selectedOption ? selectedOption.label : "Inne";
  const selectedEmoji =
    selectedOption && selectedOption.emoji ? selectedOption.emoji.name : "";

  const openReason = selectedEmoji + " " + selectedLabel;

  const openTicketsCount = await ticketSchemas.countDocuments({
    openerId: interaction.user.id,
    closed: false,
  });

  if (openTicketsCount >= 1) {
    await interaction.reply({
      content:
        "Masz już otwarty ticket. Zamknij jeden z nich, aby otworzyć nowy.",
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setDescription(
      `## 📬 Dziękujemy za otwarcie ticketa!

    > Abyśmy mogli szybciej Ci pomóc, prosimy:
    
    📝 Napisz krótko, w jakiej sprawie się kontaktujesz.  
    👥 Nasz zespół wkrótce się Tobą zajmie!
    
    ## 📄 Informacje o tickecie
    
    **Powód otwarcia:** \`${openReason}\`  
    **Użytkownik:** <@${interaction.user.id}>  
    **Data otwarcia:** \`${Date.now()}\``
    )

    .setColor("#5865F2")
    .setFooter({
      text: interaction.client.user.username + " - System ticketów",
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  const ticketCount = (await ticketSchemas.countDocuments()) + 1;

  const ticketModMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket-modmenu")
    .setPlaceholder("Wybierz opcję")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Przyjmij ticket")
        .setValue("accept-ticket")
        .setDescription("Przyjmij ticket")
        .setEmoji("✅"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Zamknij ticket")
        .setValue("close-ticket")
        .setDescription("Zamknij ticket")
        .setEmoji("🔒"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Zarzadzaj ticketem")
        .setValue("manage-ticket")
        .setDescription("Zarzadzaj ticketem")
        .setEmoji("➕")
    );

  const actionRow = new ActionRowBuilder().addComponents(ticketModMenu);

  const channel = await interaction.guild.channels.create({
    name: "💌・" + interaction.user.displayName + `-` + ticketCount,
    type: ChannelType.GuildText,
    parent: config.tickets.category,
    permissionOverwrites: [
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        id: config.tickets.roles.support,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });

  if (selectedValue === "partnership") {
    const categoryId = "1341240425826095144";
    await channel.setParent(categoryId, { lockPermissions: false });

    const partnershipMakerRoleId = config.tickets.roles.partnershipMaker;
    const partnershipMakerRole = interaction.guild.roles.cache.get(
      partnershipMakerRoleId
    );

    if (partnershipMakerRole) {
      await channel.permissionOverwrites.create(partnershipMakerRole, {
        ViewChannel: true,
      });
      const supportRoleId = config.tickets.roles.support;
      const supportRole = interaction.guild.roles.cache.get(supportRoleId);

      if (supportRole) {
        await channel.permissionOverwrites.delete(supportRole);
      }
    }
  }

  await channel.send({
    embeds: [embed],
    components: [actionRow],
  });

  await interaction.reply({
    content: "Ticket został otwarty! <#" + channel.id + ">",
    ephemeral: true,
  });

  try {
    await ticketSchemas.create({
      channelId: channel.id,
      openerId: interaction.user.id,
      supportId: null,
      openReason: selectedLabel,
      closed: false,
      lastActivity: Date.now(),
      createdAt: Date.now(),
    });
    console.log("Ticket zapisany w bazie!");
  } catch (err) {
    console.error("Błąd przy zapisie ticketa:", err);
  }

  channel
    .send({
      content: `<@${interaction.user.id}>`,
    })
    .then((message) =>
      setTimeout(
        () => message.delete().catch((err) => console.log(err)),
        2 * 1000
      )
    );
}

module.exports = openTicket;
