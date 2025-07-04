const {
  ChatInputCommandInteraction,
  AttachmentBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");
const pointsSchema = require("../../schemas/userPoints");

module.exports = new ApplicationCommand({
  command: {
    name: "reload",
    description: "Reload every command or reset user points.",
    type: 1,
    options: [
      {
        name: "userpoints",
        description:
          "Zresetuj wszystkie punkty użytkowników (zostawia userId, czyści resztę)",
        type: 1,
      },
    ],
  },
  options: {
    botDevelopers: true,
  },
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    const sub = interaction.options.getSubcommand(false);

    if (sub === "userpoints") {
      try {
        // Resetuje wszystkie pola poza userId
        await pointsSchema.updateMany(
          {},
          {
            $set: {
              points: 0,
              "dailyRequiments.dailyPoints": 0,
              "dailyRequiments.message.messageCount": 0,
              "dailyRequiments.message.lastPointTime": null,
              "dailyRequiments.message.lastMessage": null,
              "dailyRequiments.message.lastMessageDate": null,
              "dailyRequiments.message.requirementMet": false,
              "dailyRequiments.message.requireMetDate": null,
              "dailyRequiments.message.userStatus": false,
            },
            $unset: {
              reactionMessageIdList: "",
            },
          }
        );
        await interaction.editReply({
          content:
            "Wszystkie rekordy userPoints zostały zresetowane (userId zachowane).",
        });
      } catch (err) {
        await interaction.editReply({
          content: "Błąd podczas resetowania userPoints.",
          files: [
            new AttachmentBuilder(Buffer.from(`${err}`, "utf-8"), {
              name: "output.txt",
            }),
          ],
        });
      }
      return;
    }

    try {
      client.commands_handler.reload();
      await client.commands_handler.registerApplicationCommands(
        config.development
      );
      await interaction.editReply({
        content:
          "Successfully reloaded application commands and message commands.",
      });
    } catch (err) {
      await interaction.editReply({
        content: "Something went wrong.",
        files: [
          new AttachmentBuilder(Buffer.from(`${err}`, "utf-8"), {
            name: "output.ts",
          }),
        ],
      });
    }
  },
}).toJSON();
