const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // Ensure userId is unique
  },
  lastUsages: [
    {
      tryb: {
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
      tryb: {
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

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
