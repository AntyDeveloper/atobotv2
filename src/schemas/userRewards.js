const mongoose = require("mongoose");

  const userRewardSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true, // Ensure userId is unique
    },
    lastUsages: [
      {
        tryb: { // Consider renaming 'tryb' to 'mode' or 'type' for better clarity in English
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
        },
      },
    ],
    rewards: [
      {
        tryb: { // Consider renaming 'tryb' to 'mode' or 'type'
          type: String,
          required: true,
        },
        rewardType: {
          type: String,
          required: true,
        },
        rewardDate: {
          type: Date,
          required: true,
        },
      },
    ],
  });

  const UserReward = mongoose.model("UserReward", userRewardSchema);

  module.exports = UserReward;