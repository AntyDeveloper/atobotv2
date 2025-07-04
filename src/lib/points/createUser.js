const pointsSchema = require("../../schemas/userPoints");

async function createUser(userId) {
  const user = await pointsSchema.findOne({ userId: userId });
  if (!user) {
    const newUser = new pointsSchema({
      userId: userId,
      points: 0,
      dailyRequiments: {
        message: {
          lastPointTime: null,
          messageCount: 0,
          lastMessage: null,
          lastMessageDate: null,
          requirementMet: false,
          requireMetDate: null,
          userStatus: false,
        },
      },
      reactionMessageIdList: [],
    });
    await newUser.save();
  }
}

module.exports = createUser;
