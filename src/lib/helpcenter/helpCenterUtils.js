const moment = require("moment-timezone");

/**
 * Ustawia uprawnienia do kanału help center w zależności od czasu.
 */
async function updateHelpCenterChannel(client, config) {
  const openTime = config.helpCenter.helpCenterTime.open;
  const closeTime = config.helpCenter.helpCenterTime.close;
  const channelId = config.helpCenter.helpCenterChannel;
  const roleId = "1314272720027914363";
  const timezone = "Europe/Warsaw";

  const [openHour, openMinute] = openTime.split(":");
  const [closeHour, closeMinute] = closeTime.split(":");

  const now = moment().tz(timezone);
  const openMoment = moment.tz(`${openHour}:${openMinute}`, "HH:mm", timezone);
  const closeMoment = moment.tz(
    `${closeHour}:${closeMinute}`,
    "HH:mm",
    timezone
  );

  const channel = await client.channels.fetch(channelId);
  if (channel) {
    const role = channel.guild.roles.cache.get(roleId);
    if (role) {
      if (now.isBetween(openMoment, closeMoment)) {
        await channel.permissionOverwrites.edit(role, { Connect: true });
        console.log(`Kanał ${channel.name} został otwarty.`);
      } else {
        await channel.permissionOverwrites.edit(role, { Connect: false });
        console.log(`Kanał ${channel.name} został zamknięty.`);
      }
    }
  }
}

/**
 * Otwiera kanał help center.
 */
async function openHelpCenterChannel(client, config) {
  const channelId = config.helpCenter.helpCenterChannel;
  const roleId = "1314272720027914363";
  const timezone = "Europe/Warsaw";
  const now = moment().tz(timezone).format("HH:mm");

  const channel = await client.channels.fetch(channelId);
  if (channel) {
    const role = channel.guild.roles.cache.get(roleId);
    if (role) {
      await channel.permissionOverwrites.edit(role, { Connect: true });
      console.log(`Kanał ${channel.name} został otwarty o ${now}.`);
    }
  }
}

/**
 * Zamyka kanał help center.
 */
async function closeHelpCenterChannel(client, config) {
  const channelId = config.helpCenter.helpCenterChannel;
  const roleId = "1314272720027914363";
  const timezone = "Europe/Warsaw";
  const now = moment().tz(timezone).format("HH:mm");

  const channel = await client.channels.fetch(channelId);
  if (channel) {
    const role = channel.guild.roles.cache.get(roleId);
    if (role) {
      await channel.permissionOverwrites.edit(role, { Connect: false });
      console.log(`Kanał ${channel.name} został zamknięty o ${now}.`);
    }
  }
}

module.exports = {
  updateHelpCenterChannel,
  openHelpCenterChannel,
  closeHelpCenterChannel,
};
