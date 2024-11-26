-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

-- Create access keys table
create table
  access_keys (
    id uuid primary key default uuid_generate_v4 (),
    key text not null unique,
    role_id text not null,
    guild_id text not null,
    created_at TIMESTAMPTZ default now(),
    used_at TIMESTAMPTZ
  );

-- Optional: Create a function to check key usage
create
or replace function check_access_key (input_key text) returns table (valid boolean, role_id text, guild_id text) as $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN used_at IS NULL THEN true 
            ELSE false 
        END AS valid,
        role_id,
        guild_id
    FROM access_keys
    WHERE key = input_key;
END;
$$ language plpgsql;

-- Optional: Create a trigger to mark key as used
create
or replace function mark_key_as_used () returns trigger as $$
BEGIN
    UPDATE access_keys 
    SET used_at = NOW() 
    WHERE key = NEW.key;
    RETURN NEW;
END;
$$ language plpgsql;

-- Create 'some_table' if it does not exist
create table
  some_table (
    id bigint primary key generated always as identity,
    key text not null
  );

create trigger access_key_used
after insert on some_table for each row
execute function mark_key_as_used ();





-- Enum for key types
CREATE TYPE key_type AS ENUM ('single_use', 'time_limited', 'multi_use');

-- Enhanced access keys table
CREATE TABLE access_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    role_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    key_type key_type NOT NULL DEFAULT 'single_use',
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Used keys tracking table
CREATE TABLE used_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id UUID REFERENCES access_keys(id),
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to check access key validity
CREATE OR REPLACE FUNCTION check_access_key(
    input_key TEXT, 
    input_user_id TEXT, 
    input_guild_id TEXT
)
RETURNS TABLE (
    valid BOOLEAN,
    role_id TEXT,
    key_type TEXT,
    max_uses INTEGER,
    current_uses INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN 
                ak.current_uses < ak.max_uses AND
                (ak.valid_until IS NULL OR ak.valid_until > NOW()) AND
                NOT EXISTS (
                    SELECT 1 
                    FROM used_keys uk 
                    WHERE 
                        uk.key_id = ak.id AND 
                        uk.user_id = input_user_id
                )
            THEN true 
            ELSE false 
        END AS valid,
        ak.role_id,
        ak.key_type::TEXT,
        ak.max_uses,
        ak.current_uses
    FROM access_keys ak
    WHERE 
        ak.key = input_key AND 
        ak.guild_id = input_guild_id;
END;
$$ LANGUAGE plpgsql;

-- Function to use an access key
CREATE OR REPLACE FUNCTION use_access_key(
    input_key TEXT, 
    input_user_id TEXT, 
    input_guild_id TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    role_id TEXT
) AS $$
DECLARE
    v_key_id UUID;
    v_role_id TEXT;
    v_current_uses INTEGER;
    v_max_uses INTEGER;
BEGIN
    -- Check key validity and get details
    SELECT ak.id, ak.role_id, ak.current_uses, ak.max_uses
    INTO v_key_id, v_role_id, v_current_uses, v_max_uses
    FROM access_keys ak
    WHERE 
        ak.key = input_key AND 
        ak.guild_id = input_guild_id;

    -- Validate key
    IF v_key_id IS NULL OR 
       v_current_uses >= v_max_uses OR 
       EXISTS (
           SELECT 1 
           FROM used_keys uk 
           WHERE 
               uk.key_id = v_key_id AND 
               uk.user_id = input_user_id
       ) THEN
        RETURN QUERY 
        SELECT false, NULL::TEXT;
        RETURN;
    END IF;

    -- Record key usage
    INSERT INTO used_keys (key_id, user_id, guild_id)
    VALUES (v_key_id, input_user_id, input_guild_id);

    -- Update key usage count
    UPDATE access_keys
    SET current_uses = current_uses + 1
    WHERE id = v_key_id;

    -- Return success and role
    RETURN QUERY 
    SELECT true, v_role_id;
END;
$$ LANGUAGE plpgsql;

-- Function to manage subscriptions
CREATE OR REPLACE FUNCTION check_and_update_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically expire outdated subscriptions
    UPDATE subscriptions
    SET status = 'expired'
    WHERE 
        status = 'active' AND 
        expires_at < NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to manage subscriptions
CREATE TRIGGER update_subscriptions_trigger
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH STATEMENT
EXECUTE FUNCTION check_and_update_subscriptions();


