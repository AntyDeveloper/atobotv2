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
            state: "DiscordJS-V14-Bot-Template v3",
          },
        ],
      },
    });

    new CommandsListener(this);
    new ComponentsListener(this);
  }

  sendEmbeds = async () => {
    const channelTicket = await this.channels.fetch(
      config.channels.ticketChannel
    );

    if (channelTicket && channelTicket.isTextBased()) {
      const fetchedMessages = await channelTicket.messages.fetch({
        limit: 100,
      });

      fetchedMessages.forEach(async (message) => {
        try {
          await message.delete();
        } catch (error) {
          console.error(`Failed to delete message: ${error}`);
        }
      });
    }
    TicketEmbed.TicketEmbed(channelTicket, this);
  };

  startStatusRotation = () => {
    let index = 0;
    setInterval(() => {
      this.user.setPresence({ activities: [this.statusMessages[index]] });
      index = (index + 1) % this.statusMessages.length;
    }, 4000);
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
