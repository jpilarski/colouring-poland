-- ============================================================================
-- 06_audit_and_system.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUDIT_LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    audit_id bigserial PRIMARY KEY,
    event_timestamp timestamptz DEFAULT now() NOT NULL,
    event_type varchar(50) NOT NULL,
    user_id uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
    ip_address inet NULL,
    user_agent text NULL,
    details jsonb NULL,

    CONSTRAINT chk_audit_logs_event_type_format
        CHECK (event_type ~ '^[A-Z0-9_]{3,50}$'),
    CONSTRAINT chk_audit_logs_details_object
        CHECK (details IS NULL OR jsonb_typeof(details) = 'object')
);

CREATE INDEX audit_logs_timestamp_idx ON audit_logs (event_timestamp);
CREATE INDEX audit_logs_user_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_event_type_idx ON audit_logs (event_type);

-- ----------------------------------------------------------------------------
-- 2. SEARCH_LOCATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE search_locations (
    search_id serial PRIMARY KEY,
    search_str varchar NOT NULL,
    search_class varchar,
    center geometry(Point, 4326),
    zoom integer,

    CONSTRAINT chk_search_locations_str_not_empty
        CHECK (length(trim(search_str)) > 0),
    CONSTRAINT chk_search_locations_zoom
        CHECK (zoom IS NULL OR zoom BETWEEN 1 AND 22)
);

CREATE INDEX trgm_gist_idx_search_str ON search_locations USING gist (search_str gist_trgm_ops);

-- ----------------------------------------------------------------------------
-- 3. BULK_EXTRACTS
-- ----------------------------------------------------------------------------
CREATE TABLE bulk_extracts (
    extract_id serial PRIMARY KEY,
    extracted_on timestamptz NOT NULL,
    extract_path varchar NOT NULL,

    CONSTRAINT chk_bulk_extracts_path_not_empty
        CHECK (length(trim(extract_path)) > 0)
);
