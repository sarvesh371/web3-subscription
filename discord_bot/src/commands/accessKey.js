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
        const { member, guild } = interaction;

        // Validate member and guild presence
        if (!member || !guild) {
            return await interaction.reply({content: 'Unable to process your request.',ephemeral: true});
        }

        // Check key validity
        const keyData = await AccessKeyManager.checkAccessKey(key, member.id, guild.id);
        
        if (!keyData?.valid) {
            return await interaction.reply({
                content: 'Invalid or already used access key.',ephemeral: true});
        }

        try {
            // Attempt to use the access key
            const useResult = await AccessKeyManager.useAccessKey(key, member.id, guild.id);

            if (!useResult?.success) {
                return await interaction.reply({
                    content: 'Failed to use access key.',ephemeral: true});
            }

            // Validate roleId
            const roleId = useResult.role_id;
            if (!roleId) {
                return await interaction.reply({
                    content: 'No role ID found for this access key.',ephemeral: true});
            }

            console.log('Role ID to add:', roleId); // debugging

            // Attempt to add the role
            await member.roles.add(roleId);

            // Construct response message
            let responseMessage = 'Role sucessfully added!';
            responseMessage += keyData.key_type === 'time-limited'
            ? 'This is a time-limited access.'
            :keyData.key_type === 'multi-use'
            ? `You have ${keyData.max_uses - key.Data.currentUses -1} uses remaining.`
            : '';
        
        await interaction.reply({ content: responseMessage, ephemeral: true });
        } catch (error) {
            console.error('Error processing access key:', error);
            await interaction.reply({ content: 'An error occured while processing your key.', ephemeral: true });
        }
    }
};
 