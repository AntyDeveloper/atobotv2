const mongoose = require("mongoose");
const { warn } = require("../utils/Console");

const userPartnershipSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      default: 0.5,
    },
    points: {
      type: Number,
      default: 0,
    },
    roleId: {
      type: String,
      default: null,
    },
    lastPartnership: {
      type: Date,
      default: null,
    },
    warnings: {
      warningsCount: {
        type: Number,
        default: 0,
      },
      lastWarning: {
        type: Date,
        default: null,
      },
    },
    vacation: {
      vacationDate: {
        type: Date,
        default: null,
      },
      reason: {
        type: String,
        default: null,
      },
    },
    ratePenalty: {
      isActive: { type: Boolean, default: false },
      since: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPartnership", userPartnershipSchema);
