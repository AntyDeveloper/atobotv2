const Event = require("../../structure/Event");
const pointsSchema = require("../../schemas/userPoints");
const boostPointSchema = require("../../schemas/guildPointMultipliers");
const Config = require("../../config.js");
const { addPoints } = require("../../lib/points/addPoints");
const notifyRoles = Config.notifyRoles;

module.exports = new Event({
  event: "messageReactionAdd",
  once: false,
  run: async (client, reaction, user) => {
    if (user.bot) return;

    const message = reaction.message;
    const userId = user.id;

    if (reaction.message.channelId !== "1314278296170659882") return;

    const messageAge = Date.now() - message.createdTimestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (messageAge > twentyFourHours) return;

    const userPoints = await pointsSchema.findOne({ userId });
    if (!userPoints) return;

    if (
      userPoints.dailyRequiments.message.requirementMet &&
      !userPoints.reactionMessageIdList.includes(message.id)
    ) {
      userPoints.reactionMessageIdList.push(message.id);

      const basePoints = 2;
      const globalBoosts = await boostPointSchema.findOne();
      const boostedPoints = basePoints * (globalBoosts?.boosts?.reactions || 1);

      await addPoints(userId, boostedPoints, new Date());
      await userPoints.save();

      const mentionedRoles = message.mentions.roles;
      const roleIds = notifyRoles.map((role) => role.id);
      const mentionedNotifyRoles = mentionedRoles.filter((role) =>
        roleIds.includes(role.id)
      );

      if (mentionedNotifyRoles.size > 0) {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (now - message.createdTimestamp <= oneHour) {
          const member = await message.guild.members.fetch(user.id);
          const hasRole = mentionedNotifyRoles.some((role) =>
            member.roles.cache.has(role.id)
          );

          if (hasRole) {
            await addPoints(userId, 5, new Date());
          }
        }
      }
    }
  },
}).toJSON();
