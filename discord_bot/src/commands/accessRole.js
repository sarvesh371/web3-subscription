const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { AccessKeyManager } = require('../utils/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accessroleset')
        .setDescription('Create an access key for a specific role')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Select the role to assign')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Select the key type')
                .setRequired(true)
                .addChoices(
                    { name: 'Single Use', value: 'single_use' },
                    { name: 'Multi Use', value: 'multi_use' },
                    { name: 'Time Limited', value: 'time_limited' }
                )
        )
        .addIntegerOption(option => 
            option.setName('uses')
                .setDescription('Number of uses for multi-use key (default 1)')
                .setMinValue(1)
                .setMaxValue(10)
        )
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Duration in days for time-limited key')
                .setMinValue(1)
                .setMaxValue(365)
        ),
    
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // Ensure the user has admin permissions
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You must be an administrator to use this command.',
                ephemeral: true
            });
        }

        const role = interaction.options.getRole('role', true);
        const keyType = interaction.options.getString('type', true);
        const uses = interaction.options.getInteger('uses') || 1;
        const duration = interaction.options.getInteger('duration');
        const guild = interaction.guild;
        const creator = interaction.user;

        if (!guild) {
            return interaction.reply({
                content: 'Unable to process your request.',
                ephemeral: true
            });
        }

        // Construct key creation options
        const keyOptions = {
            roleId: role.id,
            guildId: guild.id,
            createdBy: creator.id,
            keyType,
            maxUses: keyType === 'multi_use' ? uses : 1,
            validUntil: keyType === 'time_limited' && duration 
                ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) 
                : undefined
        };

        // Create the access key
        const accessKey = await AccessKeyManager.createAccessKey(keyOptions);

        if (accessKey) {
            // Send confirmation message
            return interaction.reply({
                content: `Access key created for role ${role.name}:\n\`${accessKey.key}\``,
                ephemeral: true
            });
        }

        // Handle failure case
        return interaction.reply({
            content: 'Failed to create access key. Please try again later.',
            ephemeral: true
        });
    }
};