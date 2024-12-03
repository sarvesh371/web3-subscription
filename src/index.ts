import "dotenv/config";
import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Interaction,
} from "discord.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

interface BotCommand {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

class DiscordBot {
  public client: Client;
  public commands: Collection<string, BotCommand>;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel],
    });

    this.commands = new Collection();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", async (interaction) => {
      await this.onInteractionCreate(interaction);
    });
  }

  private onReady(): void {
    console.log(`Logged in as ${this.client.user?.tag}!`);
  }

  private async onInteractionCreate(
    interaction: Interaction
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Command execution error:", error);

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      } catch (followUpError) {
        console.error("Error sending error message:", followUpError);
      }
    }
  }

  public async loadCommands(): Promise<void> {
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const commandsPath = path.join(__dirname, "commands");

    try {
      const commandFiles = await fs.readdir(commandsPath);

      for (const file of commandFiles) {
        if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

        const filePath = path.join(commandsPath, file);
        const commandModule = await import(`file://${filePath}`);
        const command = commandModule.default || commandModule;

        if ("data" in command && "execute" in command) {
          this.commands.set(command.data.name, command);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    } catch (error) {
      console.error("Error loading commands:", error);
    }
  }

  public async start(): Promise<void> {
    try {
      await this.loadCommands();
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error("Bot startup error:", error);
      process.exit(1);
    }
  }
}

const bot = new DiscordBot();
bot.start();

export default bot;