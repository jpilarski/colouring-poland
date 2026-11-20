-- ============================================================================
-- 05_history_and_verification.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. LOGS (historia zmian atrybutów budynków – diffy forward/reverse patch)
-- ----------------------------------------------------------------------------
CREATE TABLE logs (
    log_id bigserial PRIMARY KEY,
    log_timestamp timestamptz DEFAULT now() NOT NULL,
    forward_patch jsonb,
    reverse_patch jsonb,
    user_id uuid REFERENCES users(user_id) ON DELETE RESTRICT,
    lokalizacja_id_budynku integer REFERENCES buildings(lokalizacja_id_budynku) ON DELETE RESTRICT,

    CONSTRAINT chk_logs_forward_patch_object
        CHECK (forward_patch IS NULL OR jsonb_typeof(forward_patch) = 'object'),
    CONSTRAINT chk_logs_reverse_patch_object
        CHECK (reverse_patch IS NULL OR jsonb_typeof(reverse_patch) = 'object')
);

CREATE INDEX log_lokalizacja_id_budynku_idx ON logs (lokalizacja_id_budynku);
CREATE INDEX log_timestamp_idx ON logs (log_timestamp);
CREATE INDEX log_user_idx ON logs (user_id);

ALTER TABLE buildings
    ADD CONSTRAINT buildings_revision_id_fkey
    FOREIGN KEY (revision_id) REFERENCES logs(log_id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 2. BUILDING_VERIFICATION
-- ----------------------------------------------------------------------------
CREATE TABLE building_verification (
    verification_id serial PRIMARY KEY,
    verification_timestamp timestamptz DEFAULT now() NOT NULL,
    lokalizacja_id_budynku integer NOT NULL REFERENCES buildings(lokalizacja_id_budynku) ON DELETE RESTRICT,
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    attribute varchar NOT NULL,
    verified_value jsonb,

    CONSTRAINT verify_building_attribute_once
        UNIQUE (lokalizacja_id_budynku, user_id, attribute),
    CONSTRAINT chk_building_verification_attribute_not_empty
        CHECK (length(trim(attribute)) > 0)
);

CREATE INDEX building_verification_idx ON building_verification (lokalizacja_id_budynku);
CREATE INDEX user_verification_idx ON building_verification (user_id);
CREATE INDEX building_user_verification_idx ON building_verification (lokalizacja_id_budynku, user_id);

-- ----------------------------------------------------------------------------
-- 3. BUILDING_USER_ATTRIBUTES
-- ----------------------------------------------------------------------------
CREATE TABLE building_user_attributes (
    lokalizacja_id_budynku integer NOT NULL REFERENCES buildings(lokalizacja_id_budynku) ON DELETE RESTRICT,
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,

    PRIMARY KEY (lokalizacja_id_budynku, user_id)
);

CREATE INDEX user_attrib_user_id_idx ON building_user_attributes (user_id);
