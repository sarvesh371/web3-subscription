const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Error: ${varName} is not set in the .env file`);
        process.exit(1);
    }
});

async function deployCommands() {
    const commands = [];
    
    // Grab all the command files from the commands directory
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (err) {
            console.error(`Error importing command from ${file}:`, err);
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Deploy commands to the guild
        const data = await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID, 
                process.env.GUILD_ID
            ),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

// Execute the deployment
deployCommands();