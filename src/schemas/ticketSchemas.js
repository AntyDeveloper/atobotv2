const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
    },
    openerId: {
      type: String,
      required: true,
    },
    claimerId: {
      type: String,
      default: null,
    },
    openReason: {
      type: String,
      required: true,
    },
    closed: {
      type: Boolean,
      default: false,
    },
    usersAddedToTicket: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("guildTicketSchema", ticketSchema);
