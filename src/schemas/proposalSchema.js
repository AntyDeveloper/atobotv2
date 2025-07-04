const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  question: { type: String, required: true },
  date: { type: Date, default: Date.now },
  votesYes: { type: [String], default: [] }, // userId głosujących na TAK
  votesNo: { type: [String], default: [] }, // userId głosujących na NIE
});

module.exports = mongoose.model("Proposal", proposalSchema);
