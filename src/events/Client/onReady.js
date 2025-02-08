const { success } = require("../../utils/Console");
const Event = require("../../structure/Event");
const mongoose = require("mongoose");
const Config = require("../../config");
const cron = require("node-cron");
const moment = require("moment-timezone");
const { PermissionsBitField } = require("discord.js");
require("dotenv").config();

module.exports = new Event({
  event: "ready",
  once: true,
  run: async (__client__, client) => {
    success(
      "Logged in as " +
        client.user.tag +
        ", took " +
        (Date.now() - __client__.login_timestamp) / 1000 +
        "s."
    );
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error(
        "Error: MONGO_URI is not defined in environment variables."
      );
      return;
    }

    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }

    // Schedule tasks to open and close the channel
    const timezone = "Europe/Warsaw";
    const openTime = Config.helpCenter.helpCenterTime.open;
    const closeTime = Config.helpCenter.helpCenterTime.close;
    const channelId = Config.helpCenter.helpCenterChannel;
    const userRoleId = Config.server.userRole;

    const [openHour, openMinute] = openTime.split(":");
    const [closeHour, closeMinute] = closeTime.split(":");

    // Check current time and adjust channel state
    const now = moment().tz(timezone);
    const openMoment = moment.tz(
      `${openHour}:${openMinute}`,
      "HH:mm",
      timezone
    );
    const closeMoment = moment.tz(
      `${closeHour}:${closeMinute}`,
      "HH:mm",
      timezone
    );

    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const role = channel.guild.roles.cache.get(userRoleId);
      if (role) {
        if (now.isBetween(openMoment, closeMoment)) {
          await channel.permissionOverwrites.edit(role, {
            Connect: true,
          });
        } else {
          await channel.permissionOverwrites.edit(role, {
            Connect: false,
          });
        }
      }
    }

    // Schedule opening the channel
    cron.schedule(
      `${openMinute} ${openHour} * * *`,
      async () => {
        const now = moment().tz(timezone).format("HH:mm");
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          const role = channel.guild.roles.cache.get(userRoleId);
          if (role) {
            channel.permissionOverwrites.edit(role, {
              Connect: true,
            });
          }
        }
      },
      {
        timezone: timezone,
      }
    );

    // Schedule closing the channel
    cron.schedule(
      `${closeMinute} ${closeHour} * * *`,
      async () => {
        const now = moment().tz(timezone).format("HH:mm");
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          const role = channel.guild.roles.cache.get(userRoleId);
          if (role) {
            channel.permissionOverwrites.edit(role, {
              Connect: false,
            });
          }
        }
      },
      {
        timezone: timezone,
      }
    );
  },
}).toJSON();
