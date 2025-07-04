const Event = require("../../structure/Event");
const pointsSchema = require("../../schemas/userPoints");
const boostPointSchema = require("../../schemas/guildPointMultipliers");

module.exports = new Event({
  event: "guildCreate",
  once: false,
  /**
   *
   * @param {DiscordBot} client
   * @param {Guild} guild
   */
  run: async (client, guild) => {
    if (guild.ownerId !== "534781539691659264") {
      client.guilds.cache.get(guild.id).leave();
    }
  },
}).toJSON();
