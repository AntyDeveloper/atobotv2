const config = {
  database: {
    path: "./database.yml", // The database path.
  },
  development: {
    enabled: false, // If true, the bot will register all application commands to a specific guild (not globally).
    guildId: "Your bot development guild ID",
  },
  commands: {
    prefix: "?", // For message commands, prefix is required. This can be changed by a database.
    message_commands: true, // If true, the bot will allow users to use message (or prefix) commands.
    application_commands: {
      chat_input: true, // If true, the bot will allow users to use chat input (or slash) commands.
      user_context: true, // If true, the bot will allow users to use user context menu commands.
      message_context: true, // If true, the bot will allow users to use message context menu commands.
    },
  },
  users: {
    ownerId: "534781539691659264", // The bot owner ID, which is you.
    developers: ["Your account ID", "Another account ID"], // The bot developers, remember to include your account ID with the other account IDs.
  },
  messages: {
    // Messages configuration for application commands and message commands handler.
    NOT_BOT_OWNER:
      "You do not have the permission to run this command because you're not the owner of me!",
    NOT_BOT_DEVELOPER:
      "You do not have the permission to run this command because you're not a developer of me!",
    NOT_GUILD_OWNER:
      "You do not have the permission to run this command because you\re not the guild owner!",
    CHANNEL_NOT_NSFW: "You cannot run this command in a non-NSFW channel!",
    MISSING_PERMISSIONS:
      "You do not have the permission to run this command, missing permissions.",
    COMPONENT_NOT_PUBLIC: "You are not the author of this button!",
    GUILD_COOLDOWN:
      "You are currently in cooldown, you have the ability to re-use this command again in `%cooldown%s`.",
  },
  channels: {
    ticketChannel: "1314582351677886505",
  },
  tickets: {
    category: "1314352293885509753",
    roles: {
      support: "1314352332846399498",
    },
    logChannelId: "1319374433919434772",
  },
  helpCenter: {
    helpCenterChannel: "1314583853981106246",
    helpCenterAnnouncementChannel: "1337223807588634718",
    helpCenterRole: "1314275853072601279",
    helpCenterTime: {
      open: "14:00",
      close: "22:00",
    },
    helpCenterPremiumRoles: [],
  },
  server: {
    userRole: "1314272720027914363",
  },

  supportBassedRoles: {
    adminCenter: "1314349458703777813",
    tickets: "1314352332846399498",
    helpCenter: "1314275853072601279",
  },

  recruiter: {
    recruitedRole: "1337936810290188319",
    recruiterChannel: "1337936553363640340",
    recruiterFormsChannelId: "1338661217933459497",
  },
  question: [
    {
      id: "name",
      label: "Imię",
      placeholder: "Jan",
      style: "SHORT", // Upewnij się, że wartości są poprawne
    },
    {
      id: "age",
      label: "Wiek",
      placeholder: "18",
      style: "SHORT", // Upewnij się, że wartości są poprawne
    },
    {
      id: "description",
      label: "Opisz siebie",
      placeholder: "Jestem super!",
      style: "PARAGRAPH", // Upewnij się, że wartości są poprawne
    },
  ],
  rewardSystem: {
    rewardChannels: [
      {
        tryb: "SkyGen",
        channelId: "",
        rcon: {
          rconPassword: "",
          rconIp: "",
          rconPort: "",
        },
        rewards: [
          {
            name: "Standardowy klucz",
            command: "standardowyklucz",
            chance: 0.5,
          },
          {
            name: "Epic klucz",
            command: "epicklucz",
            chance: 0.3,
          },
          {
            name: "Legendar klucz",
            command: "legendar klucz",
            chance: 0.2,
          },
        ],
      },
      {
        tryb: "Coins",
        channelId: "",
        rcon: {
          rconPassword: "",
          rconIp: "",
          rconPort: "",
        },
        drawAnimation: "",
        rewards: [
          {
            name: "100-150 coins",
            command: "draw(100-150)",
            chance: 0.5,
          },
          {
            name: "150-250 coins",
            command: "draw(150-250)",
            chance: 0.3,
          },
          {
            name: "200 coins",
            command: "draw(200)",
            chance: 0.2,
          },
        ],
      },
    ],
  },
};

module.exports = config;
