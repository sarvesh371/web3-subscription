import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration interface
interface CommandDeploymentConfig {
    clientId: string;
    guildId: string;
    token: string;
}

class CommandDeployer {
    private config: CommandDeploymentConfig;
    private rest: REST;

    constructor() {
        this.validateEnvironmentVariables();
        
        this.config = {
            clientId: process.env.CLIENT_ID as string,
            guildId: process.env.GUILD_ID as string,
            token: process.env.DISCORD_TOKEN as string
        };

        this.rest = new REST({ version: '10' }).setToken(this.config.token);
    }

    private validateEnvironmentVariables(): void {
        const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error(`Error: Missing environment variables: ${missingVars.join(', ')}`);
            process.exit(1);
        }
    }

    public async deployCommands(): Promise<void> {
        const commands: any[] = [];
        
        // Gets the directory of the current module
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const commandsPath = path.join(__dirname, 'commands');

        try {
            const commandFiles = await fs.readdir(commandsPath);

            for (const file of commandFiles) {
                if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

                const filePath = path.join(commandsPath, file);
                
                try {
                    const commandModule = await import(`file://${filePath}`);
                    const command = commandModule.default || commandModule;

                    if ('data' in command && 'execute' in command) {
                        commands.push(command.data.toJSON());
                    } else {
                        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                } catch (err) {
                    console.error(`Error importing command from ${file}:`, err);
                }
            }

            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await this.rest.put(
                Routes.applicationGuildCommands(
                    this.config.clientId, 
                    this.config.guildId
                ),
                { body: commands }
            ) as any[];

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);

        } catch (error) {
            console.error('Error deploying commands:', error);
            process.exit(1);
        }
    }

    public static async run(): Promise<void> {
        const deployer = new CommandDeployer();
        await deployer.deployCommands();
    }
}

// Execute the deployment
CommandDeployer.run();

export default CommandDeployer;