const pointsSchema = require("../../schemas/userPoints");

function removePoints(userId, points) {
  return pointsSchema.findOneAndUpdate(
    { userId: userId },
    { $inc: { points: -points } },
    { new: true, upsert: true }
  );
}

module.exports = removePoints;
