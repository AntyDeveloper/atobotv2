const Event = require("../../structure/Event");

const userPartnershipSchema = require("../../schemas/partnershipUser");
const config = require("../../config");

module.exports = new Event({
  event: "roleUpdate",
  once: false,
  /**
   *
   * @param {DiscordBot} client
   * @param {Role} oldRole
   * @param {Role} newRole
   */
  run: async (client, oldRole, newRole) => {
    // Sprawdź czy to rola realizatora partnerstw
    const partnershipManagerRoleId = config.tickets.roles.partnershipMaker;
    if (oldRole.id !== partnershipManagerRoleId) return;

    // Jeśli rola została usunięta z serwera
    if (oldRole.deleted && !newRole) {
      // Usuń wszystkich z bazy partnershipUser, którzy mieli tę rolę
      await userPartnershipSchema.deleteMany({});
      // Możesz dodać dodatkowe logowanie lub powiadomienie admina
      console.log(
        "Rola realizatora partnerstw została usunięta. Wszyscy menedżerowie usunięci z bazy partnershipUser."
      );
    }
  },
}).toJSON();
