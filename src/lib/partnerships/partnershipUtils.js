const PartnershipServer = require("../../schemas/partnershipAdvertisements");
const UserPartnership = require("../../schemas/partnershipUser");
// Dodaj partnerstwo i sprawdź cooldown (48h cooldown)
const Config = require("../../config");
async function addPartnership(serverId, executorId, channelId, messageId) {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recent = await PartnershipServer.findOne({
    serverId,
    advertisedAt: { $gte: fortyEightHoursAgo },
  });
  if (recent) {
    return {
      success: false,
      reason: "Ten serwer był już reklamowany w ciągu ostatnich 48h.",
    };
  }

  await PartnershipServer.create({
    serverId,
    executorId,
    channelId,
    messageId,
  });

  return { success: true };
}

// Zwraca całkowitą liczbę partnerstw zrealizowanych przez danego realizatora
async function getExecutorStats(executorId) {
  return PartnershipServer.countDocuments({
    executorId,
  });
}

async function checkAndWarnAllPartnershipUsers(guild, partnershipRoleId) {
  // Pobierz wszystkich członków z daną rolą
  const membersWithRole = guild.members.cache.filter((m) =>
    m.roles.cache.has(partnershipRoleId)
  );

  for (const member of membersWithRole.values()) {
    // Sprawdź, czy user ma aktywny urlop (vacation)
    const vacation = await UserPartnership.findOne({
      userId: member.id,
      "vacation.vacationDate": { $ne: null },
    });
    if (vacation) continue; // pomiń usera na urlopie

    // Pobierz ostatnie partnerstwo użytkownika
    const lastPartnership = await UserPartnership.findOne({
      userId: member.id,
    }).sort({ date: -1 });

    // Jeśli brak daty partnerstwa, pomiń użytkownika
    if (!lastPartnership || !lastPartnership.date) continue;

    // Pobierz warningsy i ratePenalty
    const userData = await UserPartnership.findOne({ userId: member.id });
    let warningsCount = userData?.warnings?.warningsCount || 0;
    let lastWarning = userData?.warnings?.lastWarning || null;
    let ratePenalty = userData?.ratePenalty || {
      isActive: false,
      since: null,
    };

    const now = Date.now();
    let daysSince = Math.floor(
      (now - new Date(lastPartnership.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Pobierz kanał DM
    const dm = await member.createDM();

    // Ostrzeżenia wg liczby warningsCount
    // Sprawdź, czy ostrzeżenie już było wysłane (czyli czy lastWarning istnieje i jest nowsze niż 3 dni temu)
    if (
      daysSince >= 3 &&
      warningsCount === 0 &&
      (!lastWarning ||
        now - new Date(lastWarning).getTime() > 2 * 24 * 60 * 60 * 1000)
    ) {
      await dm.send(
        `Uwaga! \n Wykryliśmy, że nie realizujesz partnerstw od 3 dni.\n Dalsza nieaktywność będzie skutkowała usunięciem Cię z roli realizatora partnerstw! \n Jeśli to nie jest prawda, skontaktuj się z administratorem serwera.`
      );
      await UserPartnership.updateOne(
        { userId: member.id },
        {
          $set: { "warnings.lastWarning": new Date() },
          $inc: { "warnings.warningsCount": 1 },
        }
      );
      continue; // Po wysłaniu ostrzeżenia nie sprawdzaj kolejnych warunków
    } else if (daysSince >= 6 && warningsCount === 1) {
      await dm.send(
        `Uwaga! \n Wykryliśmy, że nie realizujesz partnerstw od 6 dni.\n Twoja stawka zostaje obniżona o 50%. Aby ją odzyskać, musisz przez tydzień codziennie realizować partnerstwa.`
      );
      await UserPartnership.updateOne(
        { userId: member.id },
        {
          $set: {
            "warnings.lastWarning": new Date(),
            "ratePenalty.isActive": true,
            "ratePenalty.since": new Date(),
          },
          $inc: { "warnings.warningsCount": 1 },
        }
      );
      continue;
    } else if (daysSince >= 9 && warningsCount === 2) {
      await dm.send(
        `Uwaga! \n Wykryliśmy, że nie realizujesz partnerstw od 9 dni.\n Zostajesz usunięty z roli realizatora partnerstw. \n Jeśli to nie jest prawda, skontaktuj się z administratorem serwera.`
      );
      if (member.roles.cache.has(partnershipRoleId)) {
        await member.roles.remove(
          partnershipRoleId,
          "Brak aktywności w partnerstwach przez 9 dni"
        );
      }
      await UserPartnership.updateOne(
        { userId: member.id },
        {
          $set: { "warnings.lastWarning": new Date() },
          $inc: { "warnings.warningsCount": 1 },
        }
      );
      continue;
    }

    // Przywracanie stawki po tygodniu aktywności
    if (ratePenalty.isActive) {
      // Sprawdź czy przez ostatnie 7 dni były partnerstwa każdego dnia
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const partnershipsLastWeek = await PartnershipServer.find({
        executorId: member.id,
        advertisedAt: { $gte: weekAgo },
      });

      // Sprawdź, czy jest co najmniej 7 partnerstw w 7 różnych dniach
      const days = new Set(
        partnershipsLastWeek.map((p) =>
          new Date(p.advertisedAt).toISOString().slice(0, 10)
        )
      );
      if (days.size >= 7) {
        await dm.send(
          `Gratulacje! Twoja stawka została przywrócona do normalnej po tygodniu aktywności.`
        );
        await UserPartnership.updateOne(
          { userId: member.id },
          {
            $set: {
              "ratePenalty.isActive": false,
              "ratePenalty.since": null,
              "warnings.warningsCount": 0,
              "warnings.lastWarning": null,
            },
          }
        );
      }
    }
  }
}
module.exports = {
  addPartnership,
  getExecutorStats,
  checkAndWarnAllPartnershipUsers,
};
