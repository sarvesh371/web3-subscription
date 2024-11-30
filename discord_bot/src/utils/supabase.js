const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Define types for better type safety
const AccessKeyType = ['single_use', 'time_limited', 'multi_use'];
const SubscriptionStatus = ['active', 'expired', 'cancelled'];

// Utility function to handle errors
const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    return null;
};

// Refactored function to create an access key
const createAccessKey = async (options) => {
    const key = crypto.randomBytes(16).toString('hex');

    try {
        const { data, error } = await supabase
            .from('access_keys')
            .insert({
                key,
                role_id: options.roleId,
                guild_id: options.guildId,
                key_type: options.keyType || 'single_use',
                max_uses: options.maxUses || 1,
                created_by: options.createdBy,
                valid_until: options.validUntil
            })
            .select('*');

        if (error) return handleError(error, 'createAccessKey');
        return data[0];
    } catch (error) {
        return handleError(error, 'createAccessKey');
    }
};

// Refactored function to check an access key
const checkAccessKey = async (key, userId, guildId) => {
    try {
        const { data, error } = await supabase
            .rpc('check_access_key', { 
                input_key: key,
                input_user_id: userId,
                input_guild_id: guildId
            });

        if (error) return handleError(error, 'checkAccessKey');
        return data[0] || null;
    } catch (error) {
        return handleError(error, 'checkAccessKey');
    }
};

// Refactored function to use an access key
const useAccessKey = async (key, userId, guildId) => {
    try {
        const { data, error } = await supabase
            .rpc('use_access_key', { 
                input_key: key,
                input_user_id: userId,
                input_guild_id: guildId
            });

        if (error) return handleError(error, 'useAccessKey');
        console.log('useAccessKey result:', data[0]);
        return data[0] || null;
    } catch (error) {
        return handleError(error, 'useAccessKey');
    }
};

// Refactored function to create a subscription
const createSubscription = async (options) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: options.userId,
                guild_id: options.guildId,
                role_id: options.roleId,
                expires_at: options.expiresAt
            })
            .select('*');

        if (error) return handleError(error, 'createSubscription');
        return data[0];
    } catch (error) {
        return handleError(error, 'createSubscription');
    }
};

// Refactored function to get user subscriptions
const getUserSubscriptions = async (userId, guildId) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .eq('status', 'active');

        if (error) return handleError(error, 'getUserSubscriptions');
        return data || [];
    } catch (error) {
        return handleError(error, 'getUserSubscriptions');
    }
};

// Refactored function to cancel a subscription
const cancelSubscription = async (subscriptionId) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', subscriptionId)
            .select('*');

        if (error) return handleError(error, 'cancelSubscription');
        return data[0];
    } catch (error) {
        return handleError(error, 'cancelSubscription');
    }
};

module.exports = {
    supabase,
    AccessKeyManager: {
        createAccessKey,
        checkAccessKey,
        useAccessKey
    },
    SubscriptionManager: {
        createSubscription,
        getUserSubscriptions,
        cancelSubscription
    }
};
