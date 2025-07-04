const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");

module.exports = new ApplicationCommand({
  command: {
    name: "gmroll",
    description: "Roll winner from message reactions.",
    type: 1,
    default_member_permission: "0x0000000000000008",
    options: [
      {
        name: "messageid",
        description:
          "Podaj ID wiadomości, z której chcesz wylosować zwycięzcę.",
        type: 3,
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

    const messageId = interaction.options.getString("messageid");
    const channel = interaction.channel;
    const message = await channel.messages.fetch(messageId);

    if (!message.reactions || message.reactions.cache.size === 0) {
      return interaction.editReply("Wiadomość nie ma żadnych reakcji.");
    }

    const reactions = message.reactions.cache;
    const users = await reactions.reduce(async (acc, reaction) => {
      const users = await reaction.users.fetch();
      return [...(await acc), ...users.values()];
    }, []);

    // Filter out duplicate users
    const uniqueUsers = [...new Set(users.map((user) => user.id))].map((id) =>
      users.find((user) => user.id === id)
    );

    if (uniqueUsers.length === 0) {
      return interaction.editReply(
        "Nie znaleziono żadnych unikalnych użytkowników."
      );
    }

    const winner = uniqueUsers[Math.floor(Math.random() * uniqueUsers.length)];

    await interaction.editReply(`The winner is: <@${winner.id}>`);
  },
}).toJSON();
