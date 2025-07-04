const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema({
  reason: String,
  date: { type: Date, default: Date.now },
  from: String, // ID osoby nadającej
  expired: { type: Boolean, default: false },
});

const praiseSchema = new mongoose.Schema({
  reason: String,
  date: { type: Date, default: Date.now },
  from: String, // ID osoby nadającej
});

const praiseFromUserSchema = new mongoose.Schema({
  reason: String,
  date: { type: Date, default: Date.now },
  from: String, // ID osoby nadającej
});

const warningFromUserSchema = new mongoose.Schema({
  reason: String,
  date: { type: Date, default: Date.now },
  from: String, // ID osoby nadającej
});

const adminProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  warnings: [warningSchema],
  praises: [praiseSchema],
  praisesFromUser: [praiseFromUserSchema],
  warningsFromUser: [warningFromUserSchema],
});

module.exports = mongoose.model("AdminProfile", adminProfileSchema);
