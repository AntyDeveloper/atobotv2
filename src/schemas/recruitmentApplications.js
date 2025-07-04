const mongoose = require("mongoose");

const recrutierSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
    },
    status: {
      type: [
        {
          open: {
            type: Boolean,
            default: true,
          },
          declined: {
            type: Boolean,
            default: false,
          },
          accept: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [{}],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("recrutierSchema", recrutierSchema);
