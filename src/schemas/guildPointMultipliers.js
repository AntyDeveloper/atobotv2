const mongoose = require("mongoose");

const guildPointMultiplierSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  multipliers: {
    status: { type: Number, default: 10 }, // +10 punktów dziennie za status
    poll: { type: Number, default: 5 }, // +5 punktów za udział w ankiecie
    announcements: { type: Number, default: 2 }, // +2 punkty za reakcję pod ogłoszeniem
    message: { type: Number, default: 3 }, // domyślnie środek zakresu 1–5
    voice: { type: Number, default: 1 }, // +1 punkt co 5 minut na VC
    reactions: { type: Number, default: 2 }, // +1 punkt za reakcję na wiadomość
  },
});

module.exports = mongoose.model(
  "GuildPointMultipliers",
  guildPointMultiplierSchema
);
