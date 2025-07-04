const mongoose = require("mongoose");

    const guildTicketSchema = new mongoose.Schema(
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
        closeBypass: {
          type: Boolean,
          default: false,
        },
        closed: {
          type: Boolean,
          default: false,
        },
        usersAddedToTicket: {
          type: Array,
          default: [],
        },
        lastActivity: {
          type: Date,
          default: Date.now,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
      { timestamps: true }
    );

    module.exports = mongoose.model("GuildTicket", guildTicketSchema);