import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    Role,
    Guild,
    User
} from 'discord.js';
import supabaseManager, { AccessKeyType } from '../utils/supabase';

export default {
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
                    { name: 'Single Use', value: AccessKeyType.SingleUse },
                    { name: 'Multi Use', value: AccessKeyType.MultiUse },
                    { name: 'Time Limited', value: AccessKeyType.TimeLimited }
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
    
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        // Ensure the user has admin permissions
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                content: 'You must be an administrator to use this command.',
                ephemeral: true
            });
            return;
        }

        const role = interaction.options.getRole('role', true) as Role;
        const keyType = interaction.options.getString('type', true) as AccessKeyType;
        const uses = interaction.options.getInteger('uses') || 1;
        const duration = interaction.options.getInteger('duration');
        const guild = interaction.guild as Guild;
        const creator = interaction.user as User;

        if (!guild) {
            await interaction.reply({
                content: 'Unable to process your request.',
                ephemeral: true
            });
            return;
        }

        // Construct key creation options
        const keyOptions = {
            roleId: role.id,
            guildId: guild.id,
            createdBy: creator.id,
            keyType,
            maxUses: keyType === AccessKeyType.MultiUse ? uses : 1,
            validUntil: keyType === AccessKeyType.TimeLimited && duration 
                ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) 
                : undefined
        };

        // Create the access key
        const accessKey = await supabaseManager.createAccessKey(keyOptions);

        if (accessKey) {
            // Send confirmation message
            await interaction.reply({
                content: `Access key created for role ${role.name}:\n\`${accessKey.key}\``,
                ephemeral: true
            });
            return;
        }

        // Handle failure case
        await interaction.reply({
            content: 'Failed to create access key. Please try again later.',
            ephemeral: true
        });
    }
};