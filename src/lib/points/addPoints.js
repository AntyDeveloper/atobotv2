const pointsSchema = require("../../schemas/userPoints.js");

/**
 * Przyznaje punkty użytkownikowi i aktualizuje czas ostatniego przyznania punktów.
 * @param {string} userId - ID użytkownika
 * @param {number} points - Liczba punktów do przyznania
 * @param {Date} now - Aktualny czas
 * @returns {Promise<Object>} - Zaktualizowany dokument użytkownika
 */
async function addPoints(userId, points, now) {
  return pointsSchema.findOneAndUpdate(
    { userId },
    {
      $inc: {
        points,
        "dailyRequiments.dailyPoints": points,
      },
      $set: { "dailyRequiments.message.lastPointTime": now },
    },
    { new: true, upsert: true }
  );
}

module.exports = addPoints;
