-- ============================================================================
-- 02_regions.sql
-- ============================================================================

CREATE TABLE region_config (
    region_id serial PRIMARY KEY,
    region_slug varchar(50) UNIQUE NOT NULL,
    region_name varchar(100) NOT NULL,
    center_lat double precision NOT NULL,
    center_lon double precision NOT NULL,
    default_zoom integer DEFAULT 13 NOT NULL,
    bbox geometry(Polygon, 4326) NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT chk_region_config_slug_format
        CHECK (region_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT chk_region_config_name_not_empty
        CHECK (length(trim(region_name)) > 0),
    CONSTRAINT chk_region_config_lat
        CHECK (center_lat BETWEEN -90 AND 90),
    CONSTRAINT chk_region_config_lon
        CHECK (center_lon BETWEEN -180 AND 180),
    CONSTRAINT chk_region_config_zoom
        CHECK (default_zoom BETWEEN 1 AND 22),
    CONSTRAINT chk_region_config_bbox_valid
        CHECK (bbox IS NULL OR ST_IsValid(bbox))
);

CREATE INDEX region_config_bbox_idx ON region_config USING gist (bbox);
CREATE INDEX region_config_active_idx ON region_config (is_active) WHERE (is_active);
