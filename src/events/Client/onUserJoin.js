const Event = require("../../structure/Event");
const Config = require("../../config");
const { MessageEmbed } = require("discord.js");

let queue = [];
let queueMessageId = null;

module.exports = new Event({
  event: "voiceStateUpdate",
  once: false,
  run: async (__client__, client, oldState, newState) => {
    const helpCenterChannelId = Config.helpCenter.helpCenterChannel;
    const announcementChannelId =
      Config.helpCenter.helpCenterAnnouncementChannel;
    const queueChannelId = "1337235482396065792";
    const premiumRoles = Config.helpCenter.helpCenterPremiumRoles;

    const updateQueueMessage = async () => {
      const queueChannel = await client.channels.fetch(queueChannelId);
      if (queue.length === 0) {
        if (queueMessageId) {
          const queueMessage = await queueChannel.messages.fetch(
            queueMessageId
          );
          if (queueMessage) {
            await queueMessage.delete();
            queueMessageId = null;
          }
        }
      } else {
        const embed = new MessageEmbed()
          .setTitle("Kolejka do Centrum Pomocy")
          .setDescription(
            queue.map((user, index) => `${index + 1}. <@${user.id}>`).join("\n")
          )
          .setColor("BLUE");

        if (queueMessageId) {
          const queueMessage = await queueChannel.messages.fetch(
            queueMessageId
          );
          if (queueMessage) {
            await queueMessage.edit({ embeds: [embed] });
          }
        } else {
          const queueMessage = await queueChannel.send({ embeds: [embed] });
          queueMessageId = queueMessage.id;
        }
      }
    };

    if (newState.channel && newState.channel.id === helpCenterChannelId) {
      const member = await newState.guild.members.fetch(newState.id);
      const userRoles = member.roles.cache.map((role) => role.id);
      const premiumRoleIndex = premiumRoles.findIndex((role) =>
        userRoles.includes(role)
      );

      if (premiumRoleIndex !== -1) {
        let insertIndex = queue.findIndex((user) => {
          const userMember = newState.guild.members.cache.get(user.id);
          if (!userMember) return false;
          const userPremiumRoleIndex = premiumRoles.findIndex((role) =>
            userMember.roles.cache.has(role)
          );
          return userPremiumRoleIndex > premiumRoleIndex;
        });
        if (insertIndex === -1) insertIndex = queue.length;
        queue.splice(insertIndex, 0, { id: newState.id, joinedAt: new Date() });
      } else {
        queue.push({ id: newState.id, joinedAt: new Date() });
      }

      if (queue.length >= 5) {
        await updateQueueMessage();
      } else {
        const announcementToSupport = await client.channels.fetch(
          announcementChannelId
        );
        if (announcementToSupport) {
          announcementToSupport.send(
            `${member.toString()} dołączył do kanału pomocy!\n <@&1314275853072601279>`
          );
        }
      }

      setTimeout(async () => {
        const channel = await client.channels.fetch(helpCenterChannelId);
        const member = channel.members.get(newState.id);
        if (member) {
          const announcementToSupport = await client.channels.fetch(
            announcementChannelId
          );

          if (announcementToSupport) {
            announcementToSupport.send(
              `${member.toString()} dołączył do kanału pomocy!\n <@&1314275853072601279>`
            );
          }

          const userInQueue = queue.find((user) => user.id === newState.id);
          if (userInQueue) {
            const user = await client.users.fetch(userInQueue.id);
            const position =
              queue.findIndex((user) => user.id === newState.id) + 1;

            let averageWaitTimeMessage = "";
            if (position > 1) {
              const totalWaitTime = queue.reduce((acc, user, index) => {
                if (index < position - 1) {
                  return acc + (new Date() - user.joinedAt);
                }
                return acc;
              }, 0);
              const averageWaitTime = totalWaitTime / (position - 1);
              const averageWaitTimeMinutes = Math.round(
                averageWaitTime / 60000
              );
              averageWaitTimeMessage = ` Średni czas oczekiwania to: ${averageWaitTimeMinutes} minut.\n`;
            }

            user.send(
              `Jesteś w kolejce do pomocy. Twoja pozycja w kolejce to: ${position}.${averageWaitTimeMessage} Proszę czekać na swoją kolej.`
            );
          }
        }
      }, 30000);
    }

    if (
      oldState.channel &&
      oldState.channel.id === helpCenterChannelId &&
      (!newState.channel || newState.channel.id !== helpCenterChannelId)
    ) {
      queue = queue.filter((user) => user.id !== oldState.id);

      for (const userInQueue of queue) {
        const user = await client.users.fetch(userInQueue.id);
        const position =
          queue.findIndex((user) => user.id === userInQueue.id) + 1;
        user.send(
          `Twoja pozycja w kolejce została zaktualizowana. Obecnie jesteś na pozycji: ${position}.`
        );
      }

      await updateQueueMessage();
    }
  },
}).toJSON();
