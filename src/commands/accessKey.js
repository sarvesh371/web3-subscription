const { SlashCommandBuilder } = require('discord.js');
const { AccessKeyManager } = require('../utils/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accesskey')
        .setDescription('Use an access key to get a role')
        .addStringOption(option => 
            option.setName('key')
                .setDescription('Enter your access key')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const key = interaction.options.getString('key', true);
        const member = interaction.member;
        const guild = interaction.guild;

        // Validate member and guild presence
        if (!member || !guild) {
            return await interaction.reply({
                content: 'Unable to process your request.',
                ephemeral: true
            });
        }

        // Check key validity
        const keyData = await AccessKeyManager.checkAccessKey(key, member.id, guild.id);
        
        if (!keyData?.valid) {
            return await interaction.reply({
                content: 'Invalid or already used access key.',
                ephemeral: true
            });
        }

        try {
            // Attempt to use the access key
            const useResult = await AccessKeyManager.useAccessKey(key, member.id, guild.id);

            if (!useResult?.success) {
                return await interaction.reply({
                    content: 'Failed to use access key.',
                    ephemeral: true
                });
            }

            // Validate roleId
            const roleId = useResult.role_id;
            if (!roleId) {
                return await interaction.reply({
                    content: 'No role ID found for this access key.',
                    ephemeral: true
                });
            }

            console.log('Role ID to add:', roleId); // Add this line for debugging

            // Attempt to add the role
            await member.roles.add(roleId);

            // Construct response message
            let responseMessage = 'Role successfully added!';
            if (keyData.key_type === 'time_limited') {
                responseMessage += ' This is a time-limited access.';
            } else if (keyData.key_type === 'multi_use') {
                responseMessage += ` You have ${keyData.max_uses - keyData.currentUses - 1} uses remaining.`;
            }

            await interaction.reply({
                content: responseMessage,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error processing access key:', error);
            await interaction.reply({
                content: 'An error occurred while processing your key.',
                ephemeral: true
            });
        }
    }
};
