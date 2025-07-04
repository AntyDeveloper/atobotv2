const Event = require("../../structure/Event");
const Config = require("../../config");
const pointsSchema = require("../../schemas/userPoints");
const boostPointSchema = require("../../schemas/guildPointMultipliers");

module.exports = new Event({
  event: "voiceStateUpdate",
  once: false,
  /**
   * @param {DiscordBot} client
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */
  run: async (client, oldState, newState) => {
    const helpCenterChannelId = Config.helpCenter.helpCenterChannel;
    const logChannelId = "1341911046453199030";

    // Sprawdzamy, czy użytkownik dołączył na help center
    if (
      oldState.channelId !== helpCenterChannelId &&
      newState.channelId === helpCenterChannelId
    ) {
      const logChannel = await client.channels.fetch(logChannelId);
      if (logChannel) {
        logChannel.send(
          `Użytkownik <@${newState.id}> dołączył do kanału help center.`
        );
      }
    }
    const excludedCategoryId = "1314284478205530153";
    setInterval(async () => {
      const guild = client.guilds.cache.get("1312084655473950821");
      const voiceChannels = guild.channels.cache.filter(
        (channel) =>
          channel.type === "GUILD_VOICE" &&
          channel.parentId !== excludedCategoryId
      );

      for (const [channelId, channel] of voiceChannels) {
        if (channel.members.size >= 2) {
          for (const [memberId, member] of channel.members) {
            let userPoints = await pointsSchema.findOne({ userId: memberId });

            // Używamy globalnego boosta
            const globalBoosts = await boostPointSchema.findOne();
            const generalBoost = globalBoosts?.boosts?.general || 1;

            if (userPoints.dailyRequiments.message.requirementMet) {
              const now = new Date();
              const lastVoicePointTime = new Date(
                userPoints.dailyRequiments.message.lastVoicePointTime || 0
              );
              const timeDifference = now - lastVoicePointTime;

              if (timeDifference >= 1800000) {
                const basePoints = 3;
                const boostedPoints = basePoints * generalBoost;

                await pointsSchema.findOneAndUpdate(
                  { userId: memberId },
                  {
                    $inc: { points: boostedPoints },
                    $set: { "dailyRequiments.message.lastVoicePointTime": now },
                  },
                  { new: true }
                );
              }
            }
          }
        }
      }
    }, 1800000);
  },
}).toJSON();
