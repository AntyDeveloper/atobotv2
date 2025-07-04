const {
  Client,
  Collection,
  Partials,
  GatewayIntentBits,
} = require("discord.js");
const CommandsHandler = require("./handler/CommandsHandler");
const { warn, error, info, success } = require("../utils/Console");
const config = require("../config");
const CommandsListener = require("./handler/CommandsListener");
const ComponentsHandler = require("./handler/ComponentsHandler");
const ComponentsListener = require("./handler/ComponentsListener");
const EventsHandler = require("./handler/EventsHandler");
const { QuickYAML } = require("quick-yaml.db");
const TicketEmbed = require("../components/Embeds/ticket-embed");
const RecrtierEmebed = require("../components/Embeds/recrutier-emebed");
const mongoose = require("mongoose");
const { sendFaqEmbed } = require("../components/Embeds/faq-embed");
class DiscordBot extends Client {
  collection = {
    application_commands: new Collection(),
    message_commands: new Collection(),
    message_commands_aliases: new Collection(),
    components: {
      buttons: new Collection(),
      selects: new Collection(),
      modals: new Collection(),
      autocomplete: new Collection(),
    },
  };
  rest_application_commands_array = [];
  login_attempts = 0;
  login_timestamp = 0;
  statusMessages = [
    { name: "| atomc.pl |", type: 4 },
    { name: "| ᴏᴅᴡɪᴇᴅᴢ ɴᴀѕᴢᴀ ѕᴛʀᴏɴᴇ |", type: 4 },
  ];

  commands_handler = new CommandsHandler(this);
  components_handler = new ComponentsHandler(this);
  events_handler = new EventsHandler(this);
  database = new QuickYAML(config.database.path);

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
      ],
      presence: {
        activities: [
          {
            name: "keep this empty",
            type: 4,
            state: "",
          },
        ],
      },
    });

    new CommandsListener(this);
    new ComponentsListener(this);
  }

  sendEmbeds = async () => {
    const recruiterChannel = await this.channels.fetch(
      config.recruiter.recruiterChannel
    );
    const channelTicket = await this.channels.fetch(
      config.channels.ticketChannel
    );

    const faqChannel = await this.channels.fetch(config.channels.faqChannel);
    const now = Date.now();

    let shouldSendFaq = true;
    if (faqChannel && faqChannel.isTextBased()) {
      const fetchedMessages = await faqChannel.messages.fetch({ limit: 1 });
      const lastMsg = fetchedMessages.first();
      if (lastMsg && now - lastMsg.createdTimestamp < 7 * 24 * 60 * 60 * 1000) {
        shouldSendFaq = false;
        // Nie wysyłaj ponownie FAQ jeśli jest świeże
      } else {
        // Usuń stare wiadomości jeśli są
        const allMessages = await faqChannel.messages.fetch({ limit: 100 });
        allMessages.forEach(async (message) => {
          try {
            await message.delete();
          } catch (error) {
            console.error(`Failed to delete message: ${error}`);
          }
        });
        // Wyślij embed FAQ jeśli masz taki komponent
      }
    }

    // ...existing code...

    // Sprawdź, czy ostatnia wiadomość jest starsza niż 7 dni
    let shouldSendTicket = true;
    let shouldSendRecruiter = true;

    if (channelTicket && channelTicket.isTextBased()) {
      const fetchedMessages = await channelTicket.messages.fetch({ limit: 1 });
      const lastMsg = fetchedMessages.first();
      if (lastMsg && now - lastMsg.createdTimestamp < 7 * 24 * 60 * 60 * 1000) {
        shouldSendTicket = false;
      } else {
        // Usuń stare wiadomości jeśli są
        const allMessages = await channelTicket.messages.fetch({ limit: 100 });
        allMessages.forEach(async (message) => {
          try {
            await message.delete();
          } catch (error) {
            console.error(`Failed to delete message: ${error}`);
          }
        });
      }
    }

    if (recruiterChannel && recruiterChannel.isTextBased()) {
      const fetchedMessages = await recruiterChannel.messages.fetch({
        limit: 1,
      });
      const lastMsg = fetchedMessages.first();
      if (lastMsg && now - lastMsg.createdTimestamp < 7 * 24 * 60 * 60 * 1000) {
        shouldSendRecruiter = false;
      } else {
        // Usuń stare wiadomości jeśli są
        const allMessages = await recruiterChannel.messages.fetch({
          limit: 100,
        });
        allMessages.forEach(async (message) => {
          try {
            await message.delete();
          } catch (error) {
            console.error(`Failed to delete message: ${error}`);
          }
        });
      }
    }

    if (shouldSendTicket) {
      TicketEmbed.TicketEmbed(channelTicket, this);
    }
    if (shouldSendRecruiter) {
      RecrtierEmebed.RecrtierEmebed(recruiterChannel, this);
    }
    if (shouldSendFaq) {
      sendFaqEmbed(faqChannel, this);
    }
  };

  startStatusRotation = () => {
    let index = 0;
    setInterval(() => {
      this.user.setPresence({ activities: [this.statusMessages[index]] });
      index = (index + 1) % this.statusMessages.length;
    }, 30000);
  };

  connect = async () => {
    warn(
      `Attempting to connect to the Discord bot... (${this.login_attempts + 1})`
    );

    this.login_timestamp = Date.now();

    try {
      await this.login(process.env.CLIENT_TOKEN);
      this.commands_handler.load();
      this.components_handler.load();
      this.events_handler.load();
      this.startStatusRotation();
      this.sendEmbeds();

        mongoose
        .connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 30000, // Czas oczekiwania na odpowiedź serwera (30 sek)
          connectTimeoutMS: 60000, // Maksymalny czas próby połączenia (60 sek)
          socketTimeoutMS: 45000, // Timeout gniazda (45 sek)
        })
        .then(() => {
          console.log("✅ Połączono z MongoDB");
        })
        .catch((err) => {
          console.error("❌ Błąd połączenia z MongoDB:", err);
        });

      setInterval(this.sendEmbeds, 7 * 24 * 60 * 60 * 1000);

      warn(
        "Attempting to register application commands... (this might take a while!)"
      );
      await this.commands_handler.registerApplicationCommands(
        config.development
      );
      success(
        "Successfully registered application commands. For specific guild? " +
          (config.development.enabled ? "Yes" : "No")
      );
    } catch (err) {
      error("Failed to connect to the Discord bot, retrying...");
      error(err);
      this.login_attempts++;
      setTimeout(this.connect, 5000);
    }
  };
}

module.exports = DiscordBot;
