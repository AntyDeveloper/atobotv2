const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "roles-embed",
    description: "Add or remove admin roles.",
    type: 1,
    default_member_permission: "0x0000000000000008",
    options: [
      {
        name: "channel",
        description: "Poda kanał do wysłania wiadomości.",
        type: 7,
      },
    ],
  },
  options: {},
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    const { options } = interaction;
    const notifyRoles = config.notifyRoles;

    const notifyRolesOptions = notifyRoles.map((role) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(role.name)
        .setDescription(role.description)
        .setValue(role.id);
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Wybierz role powiadomień" })
      .setDescription(
        "Wybierz role, które Cię interesują, aby otrzymywać powiadomienia o konkretnych wydarzeniach na serwerze.\n\nAby usunąć rolę, wybierz ją ponownie z menu!"
      )
      .setImage(
        `https://cdn.discordapp.com/attachments/1106613112783773696/1343442054235291760/asp_grafika.png?ex=67bd4969&is=67bbf7e9&hm=8e9b4a495484e6770f8c41ba4ad92100083a3a880217d6e0db7671c583d77639&`
      )
      .setColor("#00fa0a")
      .setFooter({
        text: client.user.username + " - System powiadomień",
        iconURL: client.user.displayAvatarURL(),
      });

    const select = new StringSelectMenuBuilder()
      .setCustomId("selectNotifyRole")
      .setPlaceholder("Wybierz role powiadomień!")
      .setMinValues(1)
      .setMaxValues(4)
      .addOptions(notifyRolesOptions);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.channel.send({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
}).toJSON();
