const Event = require("../../structure/Event");
const userPoints = require("../../schemas/userPoints");
const boostPointSchema = require("../../schemas/guildPointMultipliers");
let clientF = null;
module.exports = new Event({
  event: "presenceUpdate",
  once: false,
  /**
   *
   * @param {DiscordBot} client
   * @param {Presence} oldPresence
   * @param {Presence} newPresence
   */
  run: async (client, oldPresence, newPresence) => {
    clientF = client;
    if (!newPresence || !newPresence.user) return;

    const userId = newPresence.user.id;
    const activities = newPresence.activities;

    const customStatus = activities.find((activity) => activity.type === 4);

    let userStatus = "";
    if (customStatus && customStatus.name === "Custom Status") {
      if (
        customStatus.state === "dc/atomc" ||
        customStatus.state === "dc.gg/atomc" ||
        customStatus.state === ".gg/atomc"
      ) {
        userStatus = "true";
      } else {
        userStatus = "false";
      }
    } else {
      userStatus = "false";
    }

    // Możesz tu zapisać userStatus do bazy lub innego miejsca, np.:
    await userPoints.updateOne(
      { userId },
      { $set: { userStatus } },
      { upsert: true }
    );

    // Jeśli chcesz tylko logować:
    // console.log(`User ${userId} status: ${userStatus}`);
  },
}).toJSON();
