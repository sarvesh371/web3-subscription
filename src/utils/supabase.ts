import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';


export enum AccessKeyType {
    SingleUse = 'single_use',
    TimeLimited = 'time_limited',
    MultiUse = 'multi_use'
}

export enum SubscriptionStatus {
    Active = 'active',
    Expired = 'expired',
    Cancelled = 'cancelled'
}


interface AccessKeyOptions {
    roleId: string;
    guildId: string;
    keyType?: AccessKeyType;
    maxUses?: number;
    createdBy: string;
    validUntil?: Date;
}

interface SubscriptionOptions {
    userId: string;
    guildId: string;
    roleId: string;
    expiresAt: Date;
}

class SupabaseManager {
    private client: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL or Key is missing');
        }

        this.client = createClient(supabaseUrl, supabaseKey);
    }

    
    async createAccessKey(options: AccessKeyOptions) {
        const key = crypto.randomBytes(16).toString('hex');

        const { data, error } = await this.client
            .from('access_keys')
            .insert({
                key,
                role_id: options.roleId,
                guild_id: options.guildId,
                key_type: options.keyType ?? AccessKeyType.SingleUse,
                max_uses: options.maxUses ?? 1,
                created_by: options.createdBy,
                valid_until: options.validUntil
            })
            .select('*');

        if (error) {
            console.error('Error creating access key:', error);
            return null;
        }

        return data[0];
    }

    async checkAccessKey(key: string, userId: string, guildId: string) {
        const { data, error } = await this.client
            .rpc('check_access_key', { 
                input_key: key,
                input_user_id: userId,
                input_guild_id: guildId
            });

        if (error) {
            console.error('Error checking access key:', error);
            return null;
        }

        return data[0] ?? null;
    }

    async useAccessKey(key: string, userId: string, guildId: string) {
        const { data, error } = await this.client
            .rpc('use_access_key', { 
                input_key: key,
                input_user_id: userId,
                input_guild_id: guildId
            });

        if (error) {
            console.error('Error using access key:', error);
            return null;
        }

        return data[0] ?? null;
    }

    
    async createSubscription(options: SubscriptionOptions) {
        const { data, error } = await this.client
            .from('subscriptions')
            .insert({
                user_id: options.userId,
                guild_id: options.guildId,
                role_id: options.roleId,
                expires_at: options.expiresAt
            })
            .select('*');

        if (error) {
            console.error('Error creating subscription:', error);
            return null;
        }

        return data[0];
    }

    async getUserSubscriptions(userId: string, guildId: string) {
        const { data, error } = await this.client
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .eq('status', SubscriptionStatus.Active);

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return [];
        }

        return data;
    }

    async cancelSubscription(subscriptionId: string) {
        const { data, error } = await this.client
            .from('subscriptions')
            .update({ status: SubscriptionStatus.Cancelled })
            .eq('id', subscriptionId)
            .select('*');

        if (error) {
            console.error('Error cancelling subscription:', error);
            return null;
        }

        return data[0];
    }

    
    getClient(): SupabaseClient {
        return this.client;
    }
}

export default new SupabaseManager();