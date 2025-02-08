const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const ticketSchemas = require("../../schemas/ticketSchemas");
const config = require("../../config");
const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const discordTranscripts = require("@johnbotapp/discord-html-transcripts");

module.exports = new Component({
  customId: "ticket-modmenu",
  type: "select",
  /**
   *
   * @param {DiscordBot} client
   * @param {import("discord.js").AnySelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has(config.tickets.roles.support)) {
      return interaction.reply({
        content:
          "Nie masz uprawnień do zamykania zgłoszeń.\n Tylko adminitrator może zamknać zgłoszenie.",
        ephemeral: true,
      });
    }

    if (interaction.values[0] === "accept-ticket") {
      const openTicket = await ticketSchemas.findOne({
        channelId: interaction.channel.id,
      });
      if (openTicket.claimerId) {
        return interaction.reply({
          content: "Ticket został już przyjęty przez innego użytkownika",
          ephemeral: true,
        });
      }

      if (openTicket) {
        await ticketSchemas.findOneAndUpdate(
          { channelId: interaction.channel.id },
          { claimerId: interaction.user.id },
          { new: true }
        );

        const channel = interaction.channel;
        const embed = new EmbedBuilder()
          .setTitle("Twoje zgłoszenie zostało przyjęte")
          .setDescription(
            `Twoje zgłoszenie zostało przyjęte przez <@${interaction.user.id}>\n
               Daj nam chwilę na zapoznanie się z Twoim zgłoszeniem.`
          );
        await channel.send({ embeds: [embed] });

        await channel.setTopic("Opiekun ticketa: " + interaction.user.username);

        return interaction.reply({
          content: "Ticket został przyjęty.",
          ephemeral: true,
        });
      }
    } else if (interaction.values[0] === "close-ticket") {
      const channel = interaction.channel;
      const openTicket = await ticketSchemas.findOne({
        channelId: interaction.channel.id,
      });

      if (openTicket) {
        setTimeout(
          () => channel.delete().catch((err) => console.log(err)),
          5 * 1000
        );
        const transcript = await discordTranscripts.createTranscript(channel, {
          limit: -1,
          returnBuffer: false,
          fileName: `Ticket-${channel.name}.html`,
        });

        await client.channels.cache
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
          .catch((err) => console.log(err));

        openTicket.closed = true;
        await openTicket.save();

        await interaction
          .reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`Trwa zamykanie zgłoszenia..`)
                .setColor("#FF0000"),
            ],
          })
          .catch((err) => console.log(err));
      } else {
        await interaction.reply({
          content:
            "Nie znaleziono ticketu w bazie danych. Otwórz nowy ticket. Kanał zostanie automatycznie zamknięty.",
          ephemeral: true,
        });
        setTimeout(
          () => channel.delete().catch((err) => console.log(err)),
          5 * 1000
        );
        return;
      }
    } else if (interaction.values[0] === "manage-ticket") {
      const openTicket = await ticketSchemas.findOne({
        channelId: interaction.channel.id,
      });

      if (openTicket) {
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
              .setEmoji("➖")
          );

        const actionRow = new ActionRowBuilder().addComponents(ticketModMenu);

        await interaction.reply({
          embeds: [embed],
          components: [actionRow],
          ephemeral: true,
        });
      }
    }
  },
}).toJSON();
