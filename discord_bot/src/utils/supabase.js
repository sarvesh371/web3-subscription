const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for better type safety
const AccessKeyType = 'single_use' | 'time_limited' | 'multi_use';
const SubscriptionStatus = 'active' | 'expired' | 'cancelled';

// Define interfaces for better type safety
function createAccessKey(options) {
    const key = crypto.randomBytes(16).toString('hex'); // generate a secure random key

    return supabase
        .from('access_keys')
        .insert({
            key,
            role_id: options.roleId,
            guild_id: options.guildId,
            key_type: options.keyType ?? 'single_use', // default to 'single_use'
            max_uses: options.maxUses ?? 1, // default to 1
            created_by: options.createdBy,
            valid_until: options.validUntil
        })
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                console.error('Error creating access key:', error);
                return null;
            }

            return data[0];
        });
}

function checkAccessKey(key, userId, guildId) {
    return supabase
        .rpc('check_access_key', { 
            input_key: key,
            input_user_id: userId,
            input_guild_id: guildId
        })
        .then(({ data, error }) => {
            if (error) {
                console.error('Error checking access key:', error);
                return null;
            }

            return data[0] ?? null; // return null if no data found
        });
}

function useAccessKey(key, userId, guildId) {
    return supabase
        .rpc('use_access_key', { 
            input_key: key,
            input_user_id: userId,
            input_guild_id: guildId
        })
        .then(({ data, error }) => {
            if (error) {
                console.error('Error using access key:', error);
                return null;
            }

            console.log('useAccessKey result:', data[0]); // Add this line for debugging
            return data[0] ?? null; // return null if no data found
        });
}

function createSubscription(options) {
    return supabase
        .from('subscriptions')
        .insert({
            user_id: options.userId,
            guild_id: options.guildId,
            role_id: options.roleId,
            expires_at: options.expiresAt
        })
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                console.error('Error creating subscription:', error);
                return null;
            }

            return data[0];
        });
}

function getUserSubscriptions(userId, guildId) {
    return supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .eq('status', 'active')
        .then(({ data, error }) => {
            if (error) {
                console.error('Error fetching subscriptions:', error);
                return [];
            }

            return data; // return an empty array if no subscriptions found
        });
}

function cancelSubscription(subscriptionId) {
    return supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                console.error('Error cancelling subscription:', error);
                return null;
            }

            return data[0];
        });
}

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