-- 
-- #. TYPES
-- 
CREATE TYPE uzytkowanie_status_dict
AS ENUM (
    'Eksploatowany',
    'Nieczynny',
    'W budowie',
    'Zniszczony'
);

CREATE TYPE uzytkowanie_funkcja_ogolna_dict
AS ENUM (
    'Budynki mieszkalne',
    'Budynki biurowe',
    'Budynki handlowo-usługowe',
    'Budynki przemysłowe',
    'Budynki produkcyjne, usługowe i gospodarcze dla rolnictwa',
    'Zbiorniki, silosy i budynki magazynowe',
    'Budynki transportu i łączności',
    'Budynki szpitali i inne budynki opieki zdrowotnej',
    'Budynki oświaty, nauki i kultury oraz budynki sportowe',
    'Pozostałe budynki niemieszkalne'
);

CREATE TYPE typologia_uklad_zabudowy_dict
AS ENUM (
    'Kwartałowy',
    'Swobodny'
);

CREATE TYPE typologia_intensywnosc_dict
AS ENUM (
    'Zwarta',
    'Rozproszona'
);

CREATE TYPE typologia_rodzaj_dominanty_dict
AS ENUM (
    'Ikoniczna',
    'Wysokościowa',
    'Płaszczyznowa',
    'Domykająca',
    'Funkcjonalno-użytkowa',
    'Krajobrazowa',
    'Wybitny element krajobrazu',
    'Znak szczególny'
);

CREATE TYPE kdf_material_elewacji_dict
AS ENUM (
    'Cegła',
    'Klinkier',
    'Kamień',
    'Beton',
    'Tynk',
    'Drewno',
    'Szkło',
    'Aluminium',
    'Stal',
    'Miedź',
    'Ceramika',
    'Płyty włókno-cementowe',
    'Tworzywo sztuczne (PVC)',
    'Panele kompozytowe',
    'Płyty warstwowe',
    'Mur pruski',
    'Strzecha',
    'Materiał mieszany',
    'Inny materiał',
    'Nieznany materiał'
);

CREATE TYPE kdf_material_dachu_dict
AS ENUM (
    'Dachówka ceramiczna',
    'Dachówka betonowa',
    'Blachodachówka',
    'Blacha',
    'Papa',
    'Gont bitumiczny',
    'Łupek',
    'Płyty włókno-cementowe',
    'Drewno (gont)',
    'Strzecha',
    'Szkło',
    'Dach zielony',
    'Płyty warstwowe',
    'Tworzywo sztuczne',
    'Materiał mieszany',
    'Inny materiał',
    'Nieznany materiał'
);

CREATE TYPE kdf_material_okien_drzwi_dict
AS ENUM (
    'Drewno',
    'PVC',
    'Aluminium',
    'Stal',
    'Szkło',
    'Drewno-Aluminium',
    'Materiał mieszany',
    'Inny materiał',
    'Nieznany materiał'
);

CREATE TYPE kdf_obramowanie_okien_dict
AS ENUM (
    'Kamień',
    'Sztukateria gipsowa',
    'Sztukateria styropianowa',
    'Klinkier',
    'Cegła',
    'Drewno',
    'Tynk'
);

CREATE TYPE kdf_ksztalt_drzwi_dict
AS ENUM (
    'Prostokątne',
    'Sklepione',
    'Inne'
);

CREATE TYPE kdf_brama_dict
AS ENUM (
    'Brak',
    'Na dziedziniec',
    'Do garażu'
);

CREATE TYPE kdf_detale_dict
AS ENUM (
    'Gzyms',
    'Attyka',
    'Balkon',
    'Loggia',
    'Wykusz',
    'Ryzalit',
    'Pilaster',
    'Portal',
    'Obramowania okienne',
    'Szprosy',
    'Okiennice',
    'Lukarna',
    'Balustrada',
    'Krata ozdobna',
    'Ornament elewacyjny',
    'Detale metalowe',
    'Detale kamienne',
    'Brak detali',
    'Inny',
    'Nieznany'
);

CREATE TYPE kdf_typ_dachu_dict AS ENUM (
    'Dach płaski',
    'Dach skośny'
);

CREATE TYPE historia_okres_dict AS ENUM (
    '700-1250 (Budownictwo wczesnodziejowe)',
    '1250-1450 (Gotyk)',
    '1450-1550 (Transformacja)',
    '1550-1640 (Manieryzm)',
    '1640-1795 (Barok)',
    '1780-1870 (Romantyzm)',
    '1870-1895 (Eklektyzm, historyzm)',
    '1895-1914 (Secesja)',
    '1914-1980 (Modernizm)',
    '1980-1999 (Późny XX wiek)',
    '2000-2025 (Wczesny XXI wiek)'
);

CREATE TYPE planowanie_typ_krajobrazu_dict AS ENUM (
    '11. Wodnogospodarcze',
    '12. Przemysłowe i energetyczne',
    '14. Komunikacyjne',
    '2. Bagienno-łąkowe - głównie bezleśne',
    '3. Leśne',
    '6. Wiejskie',
    '7. Mozaikowe',
    '8. Podmiejskie i osadnicze',
    '9. Miejskie'
);

CREATE TYPE za_bariery_dict AS ENUM (
    'Brak windy',
    'Brak podjazdu',
    'Schody bez alternatywy',
    'Zbyt wąskie drzwi',
    'Próg utrudniający dostęp',
    'Brak drzwi automatycznych',
    'Brak platformy/podnośnika',
    'Brak toalety dostępnej',
    'Brak oznaczeń dla niewidomych',
    'Brak kontrastu wizualnego',
    'Brak informacji głosowej',
    'Brak miejsca parkingowego dla osób z niepełnosprawnościami',
    'Niedostępne korytarze',
    'Brak dostępnej recepcji/domofonu',
    'Inna bariera',
    'Brak barier',
    'Nieznane bariery'
);

-- 
-- 1. GEOMETRIES
-- 
CREATE TABLE geometries (
    lokalizacja_id_geometrii serial PRIMARY KEY,
    source_id varchar,
    geometry_geom geometry(Geometry, 3857)
);
CREATE INDEX geometries_idx ON geometries USING gist (geometry_geom);
CREATE INDEX geometries_source_idx ON geometries (source_id);

-- 
-- 2. BUILDINGS
-- 
CREATE TABLE buildings (
    lokalizacja_id_budynku serial PRIMARY KEY,
    lokalizacja_id_gml varchar,
    lokalizacja_id_geometrii integer REFERENCES geometries,
    lokalizacja_lat double precision,
    lokalizacja_lon double precision,
    lokalizacja_crs varchar,
    lokalizacja_wysokosc_npm double precision,
    lokalizacja_ulica varchar,
    lokalizacja_numer varchar,
    lokalizacja_kod_pocztowy varchar,

    uzytkowanie_status uzytkowanie_status_dict,
    uzytkowanie_funkcja_ogolna uzytkowanie_funkcja_ogolna_dict,
    uzytkowanie_funkcja_szczegolowa integer,

    typologia_uklad_zabudowy typologia_uklad_zabudowy_dict,
    typologia_intensywnosc typologia_intensywnosc_dict,
    typologia_typ_zabudowy varchar,
    typologia_kat_srodkowy double precision,
    typologia_dominanta boolean,
    typologia_rodzaj_dominanty typologia_rodzaj_dominanty_dict,
    typologia_aktywny_parter smallint,
    typologia_ilosc_kondygnacji integer,
    typologia_powierzchnia_parteru double precision,
    typologia_wysokosc_maksymalna double precision,
    typologia_zwartosc_zabudowy double precision,

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
    konstrukcja_detal_forma_kolor_dachu_rgb varchar,
    konstrukcja_detal_forma_typ_dachu kdf_typ_dachu_dict,

    historia_okres historia_okres_dict,

    planowanie_typ_krajobrazu planowanie_typ_krajobrazu_dict,
    planowanie_krajobraz_priorytetowy boolean,

    zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni boolean,
    zrownowazona_adaptacyjnosc_bariery_architektoniczne za_bariery_dict[],
    zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc integer,

    spoleczenstwo_bezpieczenstwo smallint,
    spoleczenstwo_identyfikacja_miejsce smallint,
    spoleczenstwo_percepcja_rozpoznawalnosc smallint,
    spoleczenstwo_percepcja_obrazowosc smallint,
    spoleczenstwo_percepcja_atrakcyjnosc smallint,
    spoleczenstwo_percepcja_czytelnosc smallint,
    spoleczenstwo_inicjatywa_spoleczna boolean,

    revision_id bigint
);
CREATE INDEX building_lokalizacja_id_geometriix ON buildings (lokalizacja_id_geometrii);

-- 
-- 3. BUILDINGS_PROPERTIES
-- 
CREATE TABLE building_properties (
    building_property_id serial PRIMARY KEY,
    uprn bigint,
    parent_uprn bigint,
    lokalizacja_id_budynku integer REFERENCES buildings,
    toid varchar,
    uprn_geom geometry(Point,3857)
);
CREATE INDEX uprn_lokalizacja_id_budynkux ON building_properties (lokalizacja_id_budynku);
CREATE INDEX uprn_parent_idx ON building_properties (parent_uprn);
CREATE INDEX uprn_uprn_idx ON building_properties (uprn);

-- 
-- 4. USER_CATEGORIES
-- 
CREATE TABLE user_categories (
    category_id serial PRIMARY KEY,
    category varchar
);
INSERT INTO user_categories (category_id, category) VALUES (1, 'Not provided');

-- 
-- 5. USER_ACCESS_LEVELS
-- 
CREATE TABLE user_access_levels (
    access_level_id serial PRIMARY KEY,
    access_level varchar
);
INSERT INTO user_access_levels (access_level_id, access_level) VALUES (1, 'untrusted');

-- 
-- 6. USERS
-- 
CREATE TABLE users (
    user_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username varchar NOT NULL,
    email varchar UNIQUE,
    pass varchar,
    registered timestamptz DEFAULT now(),
    category integer DEFAULT 1 NOT NULL REFERENCES user_categories,
    access_level integer DEFAULT 1 NOT NULL REFERENCES user_access_levels,
    api_key uuid UNIQUE,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_on timestamptz,
    is_blocked boolean DEFAULT false NOT NULL,
    blocked_on timestamptz,
    blocked_reason varchar
);
CREATE INDEX user_username_idx ON users (username);
CREATE INDEX user_email_idx ON users (email);
CREATE UNIQUE INDEX users_username_idx ON users (username) WHERE (NOT is_deleted);

-- 
--  7. USER_SESSIONS
-- 
CREATE TABLE user_sessions (
    sid varchar PRIMARY KEY,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
);
CREATE INDEX user_sessions_expire_idx ON user_sessions (expire);

-- 
-- 8. LOGS
-- 
CREATE TABLE logs (
    log_id bigserial PRIMARY KEY,
    log_timestamp timestamptz DEFAULT now(),
    forward_patch jsonb,
    reverse_patch jsonb,
    user_id uuid REFERENCES users,
    lokalizacja_id_budynku integer REFERENCES buildings
);
CREATE INDEX log_lokalizacja_id_budynkux ON logs (lokalizacja_id_budynku);
CREATE INDEX log_timestamp_idx ON logs (log_timestamp);
CREATE INDEX log_user_idx ON logs (user_id);
ALTER TABLE buildings ADD FOREIGN KEY (revision_id) REFERENCES logs;

-- 
-- 9. SEARCH_LOCATIONS
-- 
CREATE TABLE search_locations (
    search_id serial PRIMARY KEY,
    search_str varchar,
    search_class varchar,
    center geometry(Point,4326),
    zoom integer
);
CREATE INDEX trgm_gist_idx_search_str ON search_locations USING gist (search_str gist_trgm_ops);

-- 
-- 10. USER_PASSWORD_RESET_TOKENS
-- 
CREATE TABLE user_password_reset_tokens (
    token uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    expires_on timestamptz NOT NULL,
    used boolean DEFAULT false NOT NULL
);

-- 
-- 11. BULK_EXTRACTS
-- 
CREATE TABLE bulk_extracts (
    extract_id serial PRIMARY KEY,
    extracted_on timestamptz NOT NULL,
    extract_path varchar NOT NULL
);

-- 
-- 12. BUILDING_VERIFICATION
-- 
CREATE TABLE building_verification (
    verification_id serial PRIMARY KEY,
    verification_timestamp timestamp DEFAULT now(),
    lokalizacja_id_budynku integer REFERENCES buildings,
    user_id uuid REFERENCES users,
    attribute varchar,
    verified_value jsonb
);
ALTER TABLE building_verification ADD CONSTRAINT verify_building_attribute_once UNIQUE (lokalizacja_id_budynku, user_id, attribute);
CREATE INDEX building_verification_idx ON building_verification (lokalizacja_id_budynku);
CREATE INDEX user_verification_idx ON building_verification (user_id);
CREATE INDEX building_user_verification_idx ON building_verification (lokalizacja_id_budynku, user_id);

-- 
-- 13. BUILDING_USER_ATTRIBUTES
-- 
CREATE TABLE building_user_attributes (
    lokalizacja_id_budynku integer REFERENCES buildings,
    user_id uuid REFERENCES users,
    PRIMARY KEY (lokalizacja_id_budynku, user_id)
);
CREATE INDEX user_attrib_lokalizacja_id_budynku_idx ON building_user_attributes (lokalizacja_id_budynku);
CREATE INDEX user_attrib_lokalizacja_id_budynku_user_id_idx ON building_user_attributes (lokalizacja_id_budynku, user_id);

-- 
-- 14. PLANNING_DATA
-- 
CREATE TABLE planning_data (
    planning_entry_id serial PRIMARY KEY,
    planning_application_id varchar,
    planning_application_link varchar,
    description varchar,
    registered_with_local_authority_date date,
    days_since_registration_cached smallint,
    decision_date date,
    days_since_decision_date_cached smallint,
    last_synced_date date,
    status varchar,
    status_before_aliasing varchar,
    status_explanation_note varchar,
    data_source varchar,
    data_source_link varchar,
    address varchar,
    uprn bigint
);

-- 
-- 15. EXTERNAL_DATA_BOROUGH_BOUNDARY
-- 
CREATE TABLE external_data_borough_boundary (
    planning_entry_id serial PRIMARY KEY,
    lokalizacja_id_geometrii integer REFERENCES geometries,
    name varchar
);