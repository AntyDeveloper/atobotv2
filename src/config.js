const { WelcomeChannel } = require("discord.js");

const config = {
  database: {
    path: "./database.yml", // The database path.
  },
  development: {
    enabled: true, // If true, the bot will register all application commands to a specific guild (not globally).
    guildId: "1312084655473950821",
  },
  commands: {
    prefix: "?", // For message commands, prefix is required. This can be changed by a database.
    message_commands: false, // If true, the bot will allow users to use message (or prefix) commands.
    application_commands: {
      chat_input: true, // If true, the bot will allow users to use chat input (or slash) commands.
      user_context: true, // If true, the bot will allow users to use user context menu commands.
      message_context: true, // If true, the bot will allow users to use message context menu commands.
    },
  },
  users: {
    ownerId: "534781539691659264", // The bot owner ID, which is you.
    developers: ["534781539691659264", "331167437779369984"], // The bot developers, remember to include your account ID with the other account IDs.
  },
  messages: {
    // Konfiguracja wiadomości dla poleceń aplikacji i obsługi poleceń wiadomości.
    NOT_BOT_OWNER:
      "Nie masz uprawnień do uruchomienia tego polecenia, ponieważ nie jesteś właścicielem bota!",
    NOT_BOT_DEVELOPER:
      "Nie masz uprawnień do uruchomienia tego polecenia, ponieważ nie jesteś deweloperem bota!",
    NOT_GUILD_OWNER:
      "Nie masz uprawnień do uruchomienia tego polecenia, ponieważ nie jesteś właścicielem serwera!",
    CHANNEL_NOT_NSFW: "Nie możesz uruchomić tego polecenia na kanale nie-NSFW!",
    MISSING_PERMISSIONS:
      "Nie masz uprawnień do uruchomienia tego polecenia, brakuje uprawnień.",
    COMPONENT_NOT_PUBLIC: "Nie jesteś autorem tego przycisku!",
    GUILD_COOLDOWN:
      "Obecnie jesteś w okresie oczekiwania, będziesz mógł ponownie użyć tego polecenia za `%cooldown%s`.",
  },
  channels: {
    ticketChannel: "1314582351677886505",
    reqruiterChannel: "1337936553363640340",
    faqChannel: "1370357275067158528",
  },

  partnership: {
    withdraws: {
      logChannelId: "1370206713013076138",
      acceptedChannelId: "1370201547774099557",
    },
  },
  notifyRoles: [
    {
      name: "📢 Ping ogłoszenia",
      description:
        "Wybierz, jeśli chcesz dostawać najnowsze informacje z serwera!",
      id: "1343415385969655808",
    },
    {
      name: "📊 Ping ankiety",
      description:
        "Wybierz, jeśli chcesz dostawać informacje o nowych ankietach!",
      id: "1112467939883487233",
    },
    {
      name: "🎉 Ping konkursy",
      description:
        "Wybierz, jeśli chcesz dostawać informacje o nowych konkursach!",
      id: "1343415863423930390",
    },
    {
      name: "🔄 Ping zmiany",
      description:
        "Wybierz, jeśli chcesz dostawać informacje o zmianach na serwerze!",
      id: "1343416112255340604",
    },
    {
      name: "🎬 Ping filmy",
      description:
        "Wybierz, jeśli chcesz dostawać informacje o nowych filmach!",
      id: "1343415743076896828",
    },
  ],
  tickets: {
    category: "1314352293885509753",
    roles: {
      support: "1314352332846399498",
      partnershipMaker: "1321785361264939040",
      admin: "1314272628969701478",
      owner: "1314269952563351573",
      manager: "1346248802478063720",
    },
    logChannelId: "1319374433919434772",
  },
  helpCenter: {
    helpCenterChannel: "1314583853981106246",
    helpCenterAnnouncementChannel: "1337223807588634718",
    helpCenterRole: "1314275853072601279",
    helpCenterTime: {
      open: "12:00",
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
      id: "nickname",
      label: "Nick w grze:",
      placeholder: "Twój nick w grze",
      style: "SHORT",
    },
    {
      id: "age",
      label: "Wiek:",
      placeholder: "Twój wiek",
      style: "SHORT",
    },
    {
      id: "experience",
      label: "Czy masz doświadczenie w tej roli:",
      placeholder: "Tak/Nie, opisz swoje doświadczenie",
      style: "PARAGRAPH",
    },
    {
      id: "time",
      label: "Ile czasu możesz poświęcać na serwer dziennie:",
      placeholder: "Np. 2-3 godziny",
      style: "SHORT",
    },
    {
      id: "about",
      label: "Napisz coś o sobie:",
      placeholder: "Opowiedz coś o sobie",
      style: "PARAGRAPH",
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
  lobby: {
    lobbyChannel: "1340162564197191691",
    WelcomeChannel: "1314582595631054978",
  },
};

module.exports = config;
