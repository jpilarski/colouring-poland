-- ============================================================================
-- 03_users_and_auth.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USER_CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE user_categories (
    category_id serial PRIMARY KEY,
    category varchar UNIQUE NOT NULL,

    CONSTRAINT chk_user_categories_not_empty
        CHECK (length(trim(category)) > 0)
);

INSERT INTO user_categories (category) VALUES ('Not provided');

-- ----------------------------------------------------------------------------
-- 2. USER_ACCESS_LEVELS
-- ----------------------------------------------------------------------------
CREATE TABLE user_access_levels (
    access_level_id serial PRIMARY KEY,
    access_level varchar UNIQUE NOT NULL,

    CONSTRAINT chk_user_access_levels_not_empty
        CHECK (length(trim(access_level)) > 0)
);

INSERT INTO user_access_levels (access_level) VALUES ('untrusted');

-- ----------------------------------------------------------------------------
-- 3. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username varchar(44) UNIQUE NOT NULL,
    email varchar(254) UNIQUE NULL,
    pass char(60) NULL,
    registered timestamptz DEFAULT now() NOT NULL,
    category integer DEFAULT 1 NOT NULL REFERENCES user_categories(category_id),
    access_level integer DEFAULT 1 NOT NULL REFERENCES user_access_levels(access_level_id),

    api_key char(64) UNIQUE NULL,

    is_deleted boolean DEFAULT false NOT NULL,
    deleted_on timestamptz NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    blocked_on timestamptz NULL,
    blocked_reason varchar NULL,

    failed_login_attempts integer DEFAULT 0 NOT NULL,
    lockout_until timestamptz NULL,

    is_active boolean DEFAULT false NOT NULL,
    activation_token char(64) UNIQUE NULL,
    activation_expires_on timestamptz NULL,

    last_login_at timestamptz NULL,
    password_last_changed timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT chk_users_username_format
        CHECK (
            (NOT is_deleted AND username ~ '^[A-Za-z0-9_]{4,30}$')
            OR
            (is_deleted AND username ~ '^deleted_[0-9a-f-]{13,36}$')
        ),
    CONSTRAINT chk_users_email_format
        CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    CONSTRAINT chk_users_email_deleted_consistency
        CHECK (
            (is_deleted AND email IS NULL)
            OR
            (NOT is_deleted AND email IS NOT NULL)
        ),
    CONSTRAINT chk_users_pass_bcrypt
        CHECK (
            (is_deleted AND pass IS NULL)
            OR
            (NOT is_deleted AND pass ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$')
        ),
    CONSTRAINT chk_users_failed_login_attempts
        CHECK (failed_login_attempts >= 0),
    CONSTRAINT chk_users_api_key_sha256
        CHECK (api_key IS NULL OR api_key ~ '^[0-9a-f]{64}$'),
    CONSTRAINT chk_users_activation_token_sha256
        CHECK (activation_token IS NULL OR activation_token ~ '^[0-9a-f]{64}$'),
    CONSTRAINT chk_users_activation_expiry
        CHECK (activation_token IS NULL OR activation_expires_on IS NOT NULL),
    CONSTRAINT chk_users_deleted_state
        CHECK (
            NOT is_deleted
            OR (deleted_on IS NOT NULL AND NOT is_active AND api_key IS NULL AND activation_token IS NULL)
        ),
    CONSTRAINT chk_users_blocked_state
        CHECK (NOT is_blocked OR blocked_on IS NOT NULL)
);

CREATE UNIQUE INDEX users_username_lower_idx ON users (lower(username)) WHERE (NOT is_deleted);
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email)) WHERE (email IS NOT NULL);
CREATE INDEX users_activation_token_idx ON users (activation_token)
    WHERE (NOT is_active AND activation_token IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 4. USER_SESSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE user_sessions (
    sid varchar PRIMARY KEY,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL,

    CONSTRAINT chk_user_sessions_sid_not_empty
        CHECK (length(sid) > 0)
);

CREATE INDEX user_sessions_expire_idx ON user_sessions (expire);
CREATE INDEX user_sessions_user_id_idx ON user_sessions ((sess->>'user_id'));

-- ----------------------------------------------------------------------------
-- 5. USER_PASSWORD_RESET_TOKENS
-- ----------------------------------------------------------------------------
CREATE TABLE user_password_reset_tokens (
    token char(64) PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    expires_on timestamptz NOT NULL,
    used boolean DEFAULT false NOT NULL,

    CONSTRAINT chk_password_reset_token_sha256
        CHECK (token ~ '^[0-9a-f]{64}$')
);

CREATE INDEX user_password_reset_tokens_user_idx ON user_password_reset_tokens (user_id);
CREATE INDEX user_password_reset_tokens_cleanup_idx ON user_password_reset_tokens (expires_on)
    WHERE (NOT used);
