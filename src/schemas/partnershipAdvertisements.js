const mongoose = require("mongoose");

const partnershipAdvertisementSchema = new mongoose.Schema({
  serverId: { type: String, required: true }, // ID reklamowanego serwera
  executorId: { type: String, required: true }, // ID realizatora partnerstwa
  advertisedAt: { type: Date, default: Date.now }, // Data reklamy

  channelId: { type: String }, // Kanał, gdzie zrealizowano partnerstwo
  messageId: { type: String }, // ID wiadomości z reklamą
  withdrawn: { type: Boolean, default: false },
  withdrawnAt: { type: Date },
});

module.exports = mongoose.model("PartnershipAdvertisement", partnershipAdvertisementSchema);