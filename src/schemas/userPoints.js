const mongoose = require("mongoose");

const userPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    dailyRequiments: {
      dailyPoints: {
        type: Number,
        default: 0,
      },
      message: {
        lastPointTime: {},
        messageCount: {
          type: Number,
          required: true,
        },
        lastMessage: {
          type: Date,
          default: null,
        },
        lastMessageDate: {
          type: Date,
          default: null,
        },
        requirementMet: {
          type: Boolean,
          default: false,
        },
        requireMetDate: {
          type: Date,
        },
        userStatus: {
          type: Boolean,
          default: false,
        },
      },
    },
    reactionMessageIdList: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

userPointsSchema.statics.addPoints = async function (userId, amount) {
  const user = await this.findOne({ userId });
  if (!user) return null;

  user.points += amount;
  user.dailyRequiments.dailyPoints =
    (user.dailyRequiments.dailyPoints || 0) + amount;
  await user.save();
  return user;
};

userPointsSchema.statics.resetDailyPoints = async function () {
  try {
    await this.updateMany(
      {},
      {
        $set: {
          "dailyRequiments.dailyPoints": 0,
        },
      }
    );
    console.log("Zresetowano dailyPoints dla wszystkich użytkowników.");
  } catch (error) {
    console.error("Błąd podczas resetowania dailyPoints:", error);
  }
};

userPointsSchema.statics.checkAndUpdateRequirements = async function () {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    await this.updateMany(
      {
        "dailyRequiments.message.requirementMet": true,
        "dailyRequiments.message.requireMetDate": { $lte: twentyFourHoursAgo },
      },
      {
        $set: {
          "dailyRequiments.message.requirementMet": false,
          "dailyRequiments.message.requireMetDate": null,
          "dailyRequiments.message.messageCount": 0,
        },
      }
    );
    console.log("Zaktualizowano wymagania użytkowników.");
  } catch (error) {
    console.error("Błąd podczas aktualizacji wymagań:", error);
  }
};

module.exports = mongoose.model("UserPoints", userPointsSchema);
