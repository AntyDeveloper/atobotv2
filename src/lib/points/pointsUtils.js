const pointsSchema = require("../../schemas/userPoints");
const boostPointSchema = require("../../schemas/guildPointMultipliers");
/**
 * Przyznaje punkty użytkownikowi.
 * @param {string} userId - ID użytkownika
 * @param {number} points - Liczba punktów do przyznania
 * @param {Date} now - Aktualny czas
 */
async function addPoints(userId, points, now) {
  await pointsSchema.findOneAndUpdate(
    { userId },
    {
      $inc: {
        points,
        "dailyRequiments.dailyPoints": points,
      },
      $set: { "dailyRequiments.message.lastPointTime": now },
    },
    { new: true }
  );
}

/**
 * Sprawdza i aktualizuje status custom statusu użytkownika.
 */
async function checkUserStatus(guild) {
  const users = await pointsSchema.find({});
  for (const user of users) {
    try {
      const member = await guild.members.fetch(user.userId).catch(() => null);
      if (!member) continue;

      const activities = member.presence?.activities || [];
      const customStatus = activities.find((activity) => activity.type === 4);

      // Sprawdź czy status jest aktywny i zawiera wymagany tekst
      const isActive =
        !!customStatus &&
        customStatus.name === "Custom Status" &&
        customStatus.state &&
        [".gg/atomc", "dc.gg/atomc", "dc/atomc"].some((s) =>
          customStatus.state.toLowerCase().includes(s)
        );

      // Aktualizuj status w bazie tylko jeśli się zmienił
      if (!!user.dailyRequiments?.message?.userStatus !== isActive) {
        await pointsSchema.findOneAndUpdate(
          { userId: user.userId },
          { $set: { "dailyRequiments.message.userStatus": isActive } }
        );
      }
    } catch (err) {
      // Pomijaj błędy dla użytkowników, których nie można pobrać
      continue;
    }
  }
}

/**
 * Resetuje status custom statusu użytkownika.
 * @param {string} userId - ID użytkownika
 * @param {Date} now - Aktualny czas
 */
async function resetUserStatus(userId, now) {
  await pointsSchema.findOneAndUpdate(
    { userId },
    {
      $set: {
        "dailyRequiments.message.userStatus": false,
        "dailyRequiments.message.lastMessage": now,
        "dailyRequiments.message.requireMetDate": null,
      },
    },
    { new: true }
  );
}

/**
 * Pobiera czas ostatniej wiadomości użytkownika.
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Date>} - Czas ostatniej wiadomości
 */
async function getLastMessageTime(userId) {
  const userPoints = await pointsSchema.findOne({ userId });
  return new Date(userPoints?.dailyRequiments?.message?.lastMessage || 0);
}

/**
 * Dodaje punkty użytkownikowi z uwzględnieniem boosta globalnego.
 */
async function addBoostedPoints(userId, basePoints, boostType) {
  const globalBoosts = await boostPointSchema.findOne();
  const boost = globalBoosts?.boosts?.[boostType] || 1;
  const boostedPoints = basePoints * boost;
  await pointsSchema.findOneAndUpdate(
    { userId },
    { $inc: { points: boostedPoints } },
    { upsert: true }
  );
  return boostedPoints;
}

/**
 * Dodaje punkty wszystkim użytkownikom posiadającym daną rolę.
 */
async function addPointsForRole(guild, roleId, basePoints = 1) {
  const role = guild.roles.cache.get(roleId);
  if (!role) return;
  for (const member of role.members.values()) {
    let userPoints = await pointsSchema.findOne({ userId: member.id });
    if (userPoints) {
      userPoints.points += basePoints;
      await userPoints.save();
    } else {
      await pointsSchema.create({ userId: member.id, points: basePoints + 4 });
    }
  }
}

/**
 * Sprawdza i aktualizuje status custom statusu użytkownika.
 */
async function checkUserStatus(guild) {
  const users = await pointsSchema.find({
    "dailyRequiments.message.userStatus": true,
  });
  for (const user of users) {
    const member = await guild.members.fetch(user.userId);
    const activities = member.presence?.activities || [];
    const customStatus = activities.find((activity) => activity.type === 4);
    if (
      !customStatus ||
      customStatus.name !== "Custom Status" ||
      !["dc/atomc", "dc.gg/atomc", ".gg/atomc"].includes(customStatus.state)
    ) {
      user.dailyRequiments.message.userStatus = false;
      await user.save();
    }
  }
}

module.exports = {
  addPoints,
  checkUserStatus,
  resetUserStatus,
  getLastMessageTime,
  addBoostedPoints,
  addPointsForRole,
  checkUserStatus,
};
