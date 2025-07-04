const Event = require("../../structure/Event");
const Config = require("../../config");
const pointsSchema = require("../../schemas/userPoints");
require("dotenv").config();
const AdminProfile = require("../../schemas/adminProfileSchema");

const cron = require("node-cron");
const {
  addBoostedPoints,
  addPointsForRole,
  checkUserStatus,
} = require("../../lib/points/pointsUtils");
const generateAndSendMinecraftPoll = require("../../lib/poll/genereatePoll");
const {
  updateHelpCenterChannel,
  openHelpCenterChannel,
  closeHelpCenterChannel,
} = require("../../lib/helpcenter/helpCenterUtils");
const boostPointSchema = require("../../schemas/guildPointMultipliers");
const {
  checkAndWarnAllPartnershipUsers,
} = require("../../lib/partnerships/partnershipUtils");
const createUser = require("../../lib/points/createUser");

module.exports = new Event({
  event: "ready",
  once: true,
  run: async (client) => {
    console.log(`${client.user.tag} is now online!`);
    const notifyRoles = Config.notifyRoles;

    async function expireAdminWarnings() {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await AdminProfile.updateMany(
        { "warnings.date": { $lte: monthAgo }, "warnings.expired": false },
        { $set: { "warnings.$[elem].expired": true } },
        {
          arrayFilters: [
            { "elem.date": { $lte: monthAgo }, "elem.expired": false },
          ],
        }
      );
    }
    await expireAdminWarnings();

    boostPointSchema.find({ guildId: "1312084655473950821" }).then((boosts) => {
      boostPointSchema
        .findOne({ guildId: "1312084655473950821" })
        .then((boosts) => {
          if (!boosts) {
            const newBoosts = new boostPointSchema({
              guildId: "1312084655473950821",
              multipliers: {
                status: 10, // +10 punktów dziennie za status
                poll: 5, // +5 punktów za udział w ankiecie
                announcements: 2, // +2 punkty za reakcję pod ogłoszeniem
                message: 3, // domyślnie środek zakresu 1–5, możesz losować przy przyznawaniu
                voice: 1, // +1 punkt co 5 minut na VC
                reactions: 2, // +1 punkt za reakcję na wiadomość
              },
            });
            newBoosts.save();
          }
        });
    });
    const { autoCloseTicket } = require("../../lib/tickets/ticketActions");
    setInterval(
      autoCloseTicket,
      checkAndWarnAllPartnershipUsers(
        client.guilds.cache.get("1312084655473950821"),
        Config.tickets.roles.partnershipMaker
      ),
      24 * 60 * 60 * 1000
    ); // raz na dobę
    cron.schedule("0 16 * * *", async () => {
      const guild = client.guilds.cache.get("1312084655473950821");
      if (!guild) return;
      generateAndSendMinecraftPoll(client);
    });

    cron.schedule("0 * * * *", async () => {
      console.log("Sprawdzanie requirementMet co 60 minut");
      await pointsSchema.checkAndUpdateRequirements();
    });

    cron.schedule("0 0 * * *", async () => {
      console.log("Dodawanie punktów za posiadanie roli raz na 24h");
      const guild = client.guilds.cache.get("1312084655473950821");
      if (!guild) return;
      for (const roleData of notifyRoles) {
        await addPointsForRole(guild, roleData.id, 1);
      }
    });

    cron.schedule("* * * * *", async () => {
      // Co minutę sprawdź status użytkowników z userStatus: true
      const guild = client.guilds.cache.get("1312084655473950821");
      if (!guild) return;

      const users = await pointsSchema.find({
        "dailyRequiments.message.userStatus": true,
      });

      for (const user of users) {
        try {
          const member = await guild.members
            .fetch(user.userId)
            .catch(() => null);
          if (!member) continue;

          const activities = member.presence?.activities || [];
          const customStatus = activities.find(
            (activity) => activity.type === 4
          );

          const isActive =
            !!customStatus &&
            customStatus.name === "Custom Status" &&
            customStatus.state &&
            [".gg/atomc", "dc.gg/atomc", "dc/atomc"].some((s) =>
              customStatus.state.toLowerCase().includes(s)
            );

          if (!isActive) {
            await pointsSchema.findOneAndUpdate(
              { userId: user.userId },
              { $set: { "dailyRequiments.message.userStatus": false } }
            );
          }
        } catch (err) {
          continue;
        }
      }
    });

    cron.schedule("0 0 * * *", async () => {
      console.log("Dodawanie punktów za status .gg/atomc raz na 24h");
      const guild = client.guilds.cache.get("1312084655473950821");
      if (!guild) return;

      const boost = await boostPointSchema.findOne({ guildId: guild.id });
      const statusPoints = boost?.multipliers?.status ?? 10;

      // Pobierz użytkowników spełniających wymagania
      const users = await pointsSchema.find({
        "dailyRequiments.message.requirementMet": true,
        "dailyRequiments.message.userStatus": true,
      });

      for (const user of users) {
        await pointsSchema.findOneAndUpdate(
          { userId: user.userId },
          { $inc: { points: statusPoints } }
        );
      }
    });

    await updateHelpCenterChannel(client, Config);

    // Schedule opening the channel
    cron.schedule(
      `${Config.helpCenter.helpCenterTime.open.split(":")[1]} ${
        Config.helpCenter.helpCenterTime.open.split(":")[0]
      } * * *`,
      async () => {
        await openHelpCenterChannel(client, Config);
      },
      { timezone: "Europe/Warsaw" }
    );

    // Schedule closing the channel
    cron.schedule(
      `${Config.helpCenter.helpCenterTime.close.split(":")[1]} ${
        Config.helpCenter.helpCenterTime.close.split(":")[0]
      } * * *`,
      async () => {
        await closeHelpCenterChannel(client, Config);
      },
      { timezone: "Europe/Warsaw" }
    );
  },
}).toJSON();
