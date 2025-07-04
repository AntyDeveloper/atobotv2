const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");

const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const boostPointSchema = require("../../schemas/guildPointMultipliers");

module.exports = new ApplicationCommand({
  command: {
    name: "setboost",
    description: "Ustaw boost punktów dla użytkownika",
    type: 1,
    options: [
      {
        name: "user",
        description: "Użytkownik, dla którego chcesz ustawić boost",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "type",
        description: "Typ boosta (general, reactions, announcements)",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "General", value: "general" },
          { name: "Reactions", value: "reactions" },
          { name: "Announcements", value: "announcements" },
        ],
      },
      {
        name: "value",
        description: "Wartość boosta",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const userId = interaction.options.getUser("user").id;
    const boostType = interaction.options.getString("type");
    const boostValue = interaction.options.getNumber("value");
    const guildId = interaction.guildId;

    let userBoosts = await boostPointSchema.findOne({ guildId });

    if (!userBoosts) {
      userBoosts = new boostPointSchema({
        guildId,
        boosts: {
          general: 1,
          reactions: 1,
          announcements: 1,
        },
      });
    }

    userBoosts.boosts[boostType] = boostValue;
    await userBoosts.save();

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setDescription(
        `Boost dla użytkownika <@${userId}> został ustawiony.\n` +
          `**Typ boosta:** ${boostType}\n` +
          `**Wartość boosta:** ${boostValue}`
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
}).toJSON();
