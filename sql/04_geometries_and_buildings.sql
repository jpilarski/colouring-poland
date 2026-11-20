-- ============================================================================
-- 04_geometries_and_buildings.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. GEOMETRIES
-- ----------------------------------------------------------------------------
CREATE TABLE geometries (
    lokalizacja_id_geometrii serial PRIMARY KEY,
    source_id varchar,
    geometry_geom geometry(Geometry, 3857)
);

CREATE INDEX geometries_idx ON geometries USING gist (geometry_geom);
CREATE INDEX geometries_source_idx ON geometries (source_id);

-- ----------------------------------------------------------------------------
-- 2. BUILDINGS
-- ----------------------------------------------------------------------------
CREATE TABLE buildings (
    -- Lokalizacja
    lokalizacja_id_budynku serial PRIMARY KEY,
    lokalizacja_id_gml varchar,
    lokalizacja_id_geometrii integer UNIQUE REFERENCES geometries(lokalizacja_id_geometrii),
    lokalizacja_lat double precision,
    lokalizacja_lon double precision,
    lokalizacja_crs varchar,
    lokalizacja_wysokosc_npm double precision,
    lokalizacja_ulica varchar,
    lokalizacja_numer varchar,
    lokalizacja_kod_pocztowy varchar,

    -- Użytkowanie
    uzytkowanie_status uzytkowanie_status_dict,
    uzytkowanie_funkcja_ogolna uzytkowanie_funkcja_ogolna_dict,
    uzytkowanie_funkcja_szczegolowa integer,

    -- Typologia
    typologia_uklad_zabudowy typologia_uklad_zabudowy_dict,
    typologia_intensywnosc typologia_intensywnosc_dict,
    typologia_typ_zabudowy typologia_typ_zabudowy_dict,
    typologia_kat_srodkowy double precision,
    typologia_dominanta boolean,
    typologia_rodzaj_dominanty typologia_rodzaj_dominanty_dict,
    typologia_aktywny_parter smallint,
    typologia_ilosc_kondygnacji integer,
    typologia_powierzchnia_parteru double precision,
    typologia_wysokosc_maksymalna double precision,
    typologia_zwartosc_zabudowy double precision,

    -- Konstrukcja, Detal, Forma (KDF)
    konstrukcja_detal_forma_material_elewacji kdf_material_elewacji_dict,
    konstrukcja_detal_forma_material_dachu kdf_material_dachu_dict,
    konstrukcja_detal_forma_material_okien kdf_material_okien_drzwi_dict,
    konstrukcja_detal_forma_okapnik boolean,
    konstrukcja_detal_forma_obramowanie_okien kdf_obramowanie_okien_dict,
    konstrukcja_detal_forma_okiennice boolean,
    konstrukcja_detal_forma_material_drzwi kdf_material_okien_drzwi_dict,
    konstrukcja_detal_forma_ksztalt_drzwi kdf_ksztalt_drzwi_dict,
    konstrukcja_detal_forma_portal boolean,
    konstrukcja_detal_forma_brama kdf_brama_dict,
    konstrukcja_detal_forma_detale kdf_detale_dict[],
    konstrukcja_detal_forma_nachylenie_dachu integer,
    konstrukcja_detal_forma_kolor_dachu_rgb varchar(7),
    konstrukcja_detal_forma_typ_dachu kdf_typ_dachu_dict,

    -- Historia
    historia_okres historia_okres_dict,

    -- Planowanie
    planowanie_typ_krajobrazu planowanie_typ_krajobrazu_dict,
    planowanie_krajobraz_priorytetowy boolean,

    -- Zrównoważona Adaptacyjność (ZA)
    zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni boolean,
    zrownowazona_adaptacyjnosc_bariery_architektoniczne za_bariery_dict[],
    zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc integer,

    -- Społeczeństwo
    spoleczenstwo_bezpieczenstwo smallint,
    spoleczenstwo_identyfikacja_miejsce smallint,
    spoleczenstwo_percepcja_rozpoznawalnosc smallint,
    spoleczenstwo_percepcja_obrazowosc smallint,
    spoleczenstwo_percepcja_atrakcyjnosc smallint,
    spoleczenstwo_percepcja_czytelnosc smallint,
    spoleczenstwo_inicjatywa_spoleczna boolean,

    -- Tabela Logs
    revision_id bigint,

    CONSTRAINT chk_buildings_lat
        CHECK (lokalizacja_lat IS NULL OR lokalizacja_lat BETWEEN -90 AND 90),
    CONSTRAINT chk_buildings_lon
        CHECK (lokalizacja_lon IS NULL OR lokalizacja_lon BETWEEN -180 AND 180),
    CONSTRAINT chk_buildings_wysokosc_npm
        CHECK (lokalizacja_wysokosc_npm IS NULL OR lokalizacja_wysokosc_npm BETWEEN -100 AND 3000),
    CONSTRAINT chk_buildings_funkcja_szczegolowa
        CHECK (uzytkowanie_funkcja_szczegolowa IS NULL OR uzytkowanie_funkcja_szczegolowa BETWEEN 0 AND 99999),
    CONSTRAINT chk_buildings_kat_srodkowy
        CHECK (typologia_kat_srodkowy IS NULL OR typologia_kat_srodkowy BETWEEN 0 AND 90),
    CONSTRAINT chk_buildings_aktywny_parter
        CHECK (typologia_aktywny_parter IS NULL OR typologia_aktywny_parter BETWEEN 1 AND 5),
    CONSTRAINT chk_buildings_ilosc_kondygnacji
        CHECK (typologia_ilosc_kondygnacji IS NULL OR typologia_ilosc_kondygnacji BETWEEN 0 AND 99999),
    CONSTRAINT chk_buildings_powierzchnia_parteru
        CHECK (typologia_powierzchnia_parteru IS NULL OR typologia_powierzchnia_parteru BETWEEN 0 AND 99999),
    CONSTRAINT chk_buildings_wysokosc_maksymalna
        CHECK (typologia_wysokosc_maksymalna IS NULL OR typologia_wysokosc_maksymalna BETWEEN 0 AND 99999),
    CONSTRAINT chk_buildings_zwartosc_zabudowy
        CHECK (typologia_zwartosc_zabudowy IS NULL OR typologia_zwartosc_zabudowy BETWEEN 0 AND 99999),
    CONSTRAINT chk_buildings_nachylenie_dachu
        CHECK (konstrukcja_detal_forma_nachylenie_dachu IS NULL OR konstrukcja_detal_forma_nachylenie_dachu BETWEEN 0 AND 90),
    CONSTRAINT chk_buildings_kolor_dachu_rgb
        CHECK (konstrukcja_detal_forma_kolor_dachu_rgb IS NULL OR konstrukcja_detal_forma_kolor_dachu_rgb ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_buildings_komunikacja_odleglosc
        CHECK (zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc IS NULL OR zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc BETWEEN 0 AND 99999),
    CONSTRAINT chk_buildings_spoleczenstwo_bezpieczenstwo
        CHECK (spoleczenstwo_bezpieczenstwo IS NULL OR spoleczenstwo_bezpieczenstwo BETWEEN 1 AND 5),
    CONSTRAINT chk_buildings_spoleczenstwo_identyfikacja
        CHECK (spoleczenstwo_identyfikacja_miejsce IS NULL OR spoleczenstwo_identyfikacja_miejsce BETWEEN 1 AND 5),
    CONSTRAINT chk_buildings_spoleczenstwo_rozpoznawalnosc
        CHECK (spoleczenstwo_percepcja_rozpoznawalnosc IS NULL OR spoleczenstwo_percepcja_rozpoznawalnosc BETWEEN 1 AND 5),
    CONSTRAINT chk_buildings_spoleczenstwo_obrazowosc
        CHECK (spoleczenstwo_percepcja_obrazowosc IS NULL OR spoleczenstwo_percepcja_obrazowosc BETWEEN 1 AND 5),
    CONSTRAINT chk_buildings_spoleczenstwo_atrakcyjnosc
        CHECK (spoleczenstwo_percepcja_atrakcyjnosc IS NULL OR spoleczenstwo_percepcja_atrakcyjnosc BETWEEN 1 AND 5),
    CONSTRAINT chk_buildings_spoleczenstwo_czytelnosc
        CHECK (spoleczenstwo_percepcja_czytelnosc IS NULL OR spoleczenstwo_percepcja_czytelnosc BETWEEN 1 AND 5)
);

CREATE INDEX buildings_lokalizacja_id_gml_idx ON buildings (lokalizacja_id_gml);

-- ----------------------------------------------------------------------------
-- 3. BUILDING_REGIONS
-- ----------------------------------------------------------------------------
CREATE TABLE building_regions (
    lokalizacja_id_budynku integer NOT NULL REFERENCES buildings(lokalizacja_id_budynku) ON DELETE CASCADE,
    region_slug varchar(50) NOT NULL REFERENCES region_config(region_slug) ON UPDATE CASCADE ON DELETE CASCADE,

    PRIMARY KEY (lokalizacja_id_budynku, region_slug)
);

CREATE INDEX building_regions_region_slug_idx ON building_regions (region_slug);
