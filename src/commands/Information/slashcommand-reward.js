const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");
const rcon = require("rcon-client");
const rewardSchema = require("../../schemas/rewardSchema");

module.exports = new ApplicationCommand({
  command: {
    name: "nagroda",
    description: "Pozwala odebrać nagrodę",
    type: 1,
    options: [
      {
        name: "nick",
        description: "Podaj swój nick",
        type: 3,
        required: true,
      },
    ],
  },
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const channelId = interaction.channel.id;
    const rewardChannel = config.rewardSystem.rewardChannels.find(
      (channel) => channel.channelId === channelId
    );

    const nickname = interaction.options.getString("nick");

    if (!rewardChannel) {
      return interaction.reply({
        content: "To nie jest poprawny kanał do odbierania nagród.",
        ephemeral: true,
      });
    }

    const rconConfig = rewardChannel.rcon;

    const rconClient = await rcon.connect({
      host: rconConfig.rconIp,
      port: rconConfig.rconPort,
      password: rconConfig.rconPassword,
    });

    const listResponse = await rconClient.send("list");
    const isPlayerOnline = listResponse.includes(nickname);

    if (!isPlayerOnline) {
      await rconClient.end();
      return interaction.reply({
        content: "Nie jesteś obecnie na serwerze.",
        ephemeral: true,
      });
    }

    const userReward = await rewardSchema.findOne({
      userId: interaction.user.id,
    });

    const reward = rewardChannel.rewards.find((reward) => {
      const rewardDate = new Date();
      const cooldown = (reward.cooldown || 0) * 1000; // Convert cooldown to milliseconds

      if (userReward) {
        const lastUsage = userReward.lastUsages.find(
          (usage) => usage.tryb === rewardChannel.tryb
        );

        if (lastUsage) {
          const timeSinceLastUse = rewardDate - new Date(lastUsage.timestamp);
          if (timeSinceLastUse < cooldown) {
            const timeLeft = cooldown - timeSinceLastUse;
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            let timeLeftString = "";
            if (days > 0) timeLeftString += `${days} dni `;
            if (hours > 0) timeLeftString += `${hours} godzin `;
            if (minutes > 0) timeLeftString += `${minutes} minut `;
            timeLeftString += `${seconds} sekund`;

            return interaction.reply({
              content: `Musisz poczekać ${timeLeftString}.`,
              ephemeral: true,
            });
          }
        }
      }

      if (rewardChannel.tryb === "Coins") {
        const match = reward.command.match(/draw\((\d+)-(\d+)\)/);
        if (match) {
          const min = parseInt(match[1], 10);
          const max = parseInt(match[2], 10);
          const value = Math.floor(Math.random() * (max - min + 1)) + min;
          reward.command = `portfel give ${nickname} ${value}`;
        }
      }
      return Math.random() < reward.chance;
    });

    if (!reward) {
      await rconClient.end();
      return interaction.reply({
        content: "Nie udało się wylosować nagrody. Spróbuj ponownie.",
        ephemeral: true,
      });
    }

    const animationEmbed = new EmbedBuilder()
      .setTitle("Losowanie nagrody...")
      .setImage(rewardChannel.drawAnimation)
      .setColor("YELLOW");

    const message = await interaction.reply({
      embeds: [animationEmbed],
      ephemeral: true,
      fetchReply: true,
    });

    setTimeout(async () => {
      try {
        await rconClient.send(reward.command);
        await rconClient.end();
      } catch (error) {
        const errorChannel = client.channels.cache.get("1337969867583655978");
        if (errorChannel) {
          errorChannel.send(`Wystąpił błąd: ${error.message}\n\n\n
            Komenda: ${reward.command}
            Nick: ${nickname}
            Kanał: ${rewardChannel.tryb}\n
            Nagroda: ${reward.name}`);
        }
        console.error(error);

        return interaction.reply({
          content:
            "Wystąpił błąd podczas odbierania nagrody. \n Otrzymałeś nagrodę? Napisz do administracji.",
          ephemeral: true,
        });
      }

      const rewardEmbed = new EmbedBuilder()
        .setTitle("Otrzymałeś nagrodę!")
        .setDescription(`Nagroda: ${reward.name}`)
        .setColor("GREEN");

      await interaction.editReply({
        embeds: [rewardEmbed],
      });

      const rewardDate = new Date();

      if (userReward) {
        await rewardSchema.findOneAndUpdate(
          {
            userId: interaction.user.id,
            "lastUsages.tryb": rewardChannel.tryb,
          },
          {
            $push: {
              rewards: {
                tryb: rewardChannel.tryb,
                rewardType: reward.name,
                rewardDate: rewardDate,
              },
            },
            $set: {
              "lastUsages.$.timestamp": rewardDate,
            },
          },
          { upsert: true, new: true }
        );
      } else {
        await rewardSchema.create({
          userId: interaction.user.id,
          rewards: [
            {
              tryb: rewardChannel.tryb,
              rewardType: reward.name,
              rewardDate: rewardDate,
            },
          ],
          lastUsages: [
            {
              tryb: rewardChannel.tryb,
              timestamp: rewardDate,
            },
          ],
        });
      }
    }, 5000);
  },
}).toJSON();
