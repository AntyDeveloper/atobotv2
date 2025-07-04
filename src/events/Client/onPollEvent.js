const Event = require("../../structure/Event");
const addPoints = require("../../lib/points/addPoints");
const removePoints = require("../../lib/points/removePoints");
module.exports = new Event({
  event: "messagePollVoteAdd",
  once: false,
  /**
   *
   * @param {DiscordBot} client
   * @param {Guild} guild
   */
  run: async (client, guild) => {
    if (guild.channelId !== "1343437749482553354") {
      return;
    }

    const chance = "0.001";
    const randomNumber = Math.random();
    if (randomNumber > chance) {
      const userId = guild.user.id;
      await addPoints(userId, 5, new Date());
    } else {
      const userId = guild.user.id;
      await addPoints(userId, 100, new Date());
      guild.user.send({
        content: "Gratulacje! Dostales 100 punktów za głosowanie w ankiecie!",
      });
    }
  },
}).toJSON();

module.exports = new Event({
  event: "messagePollVoteRemove",
  once: false,
  /**
   *
   * @param {DiscordBot} client
   * @param {Guild} guild
   */
  run: async (client, guild) => {
    if (guild.channelId !== "1343437749482553354") {
      return;
    }

    const userId = guild.user.id;
    await removePoints(userId, 5, new Date());
  },
}).toJSON();
