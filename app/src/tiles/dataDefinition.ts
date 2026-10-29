import { strictParseInt } from "../parse";
import { DataConfig } from "./types";

/**
 * Generator zapytań dla pojedynczych kolumn kategorycznych / atrybutowych
 */
function columnLayer(column: string, alias: string = column, castToText: boolean = false, extraWhere: string = ''): string {
    const colExpr = castToText ? `${column}::text AS ${alias}` : (column === alias ? column : `${column} AS ${alias}`);
    const whereClause = extraWhere ? `WHERE ${column} IS NOT NULL AND ${extraWhere}` : `WHERE ${column} IS NOT NULL`;
    return `
        SELECT
            lokalizacja_id_geometrii,
            ${colExpr}
        FROM
            buildings
        ${whereClause}`;
}

/**
 * Generator zapytań dla dynamicznych przedziałów gradientowych min/max (6 przedziałów 1..6)
 * Umożliwia centralną zmianę logiki min/max w jednym miejscu (np. per region pod Zadanie 3.4)
 */
function dynamicRangeLayer(column: string): string {
    return `
        SELECT
            b.lokalizacja_id_geometrii,
            COALESCE(LEAST(FLOOR(6 * (b.${column} - s.min_val) / NULLIF(s.max_val - s.min_val, 0)) + 1, 6), 1)::int AS bucket
        FROM
            buildings b
        CROSS JOIN (
            SELECT MIN(${column}) AS min_val, MAX(${column}) AS max_val FROM buildings
        ) s
        WHERE b.${column} IS NOT NULL`;
}

const LAYER_QUERIES: Record<string, string> = {
    base_light: `
        SELECT
            lokalizacja_id_geometrii
        FROM
            buildings`,
    base_night: `
        SELECT
            lokalizacja_id_geometrii
        FROM
            buildings`,
    base_night_outlines: `
        SELECT
            lokalizacja_id_geometrii
        FROM
            buildings`,
    base_boroughs: `
        SELECT
            lokalizacja_id_geometrii,
            name
        FROM
            external_data_borough_boundary`,
    number_labels: `
        SELECT
            lokalizacja_id_geometrii,
            lokalizacja_numer
        FROM
            buildings`,
    highlight: `
        SELECT
            lokalizacja_id_geometrii
        FROM
            buildings
        WHERE lokalizacja_id_budynku = !@highlight!`,

    lokalizacja_kompletnosc: `
        SELECT
            lokalizacja_id_geometrii,
            (
                case when lokalizacja_id_gml IS NULL then 0 else 1 end +
                case when lokalizacja_lat IS NULL then 0 else 1 end +
                case when lokalizacja_lon IS NULL then 0 else 1 end +
                case when lokalizacja_crs IS NULL then 0 else 1 end +
                case when lokalizacja_wysokosc_npm IS NULL then 0 else 1 end +
                case when lokalizacja_ulica IS NULL then 0 else 1 end +
                case when lokalizacja_numer IS NULL then 0 else 1 end +
                case when lokalizacja_kod_pocztowy IS NULL then 0 else 1 end
            ) AS location_info_count
        FROM
            buildings`,

    // Warstwy kategoryczne i atrybutowe
    uzytkowanie_funkcja_ogolna: columnLayer('uzytkowanie_funkcja_ogolna', 'uzytkowanie_funkcja_ogolna', true),
    typologia_dominanta: columnLayer('typologia_dominanta'),
    typologia_rodzaj_dominanty: columnLayer('typologia_rodzaj_dominanty', 'typologia_rodzaj_dominanty', true),
    typologia_aktywny_parter: columnLayer('typologia_aktywny_parter'),

    // Warstwy dynamicznych gradientów (min/max)
    lokalizacja_wysokosc_npm: dynamicRangeLayer('lokalizacja_wysokosc_npm'),
    typologia_wysokosc_maksymalna: dynamicRangeLayer('typologia_wysokosc_maksymalna'),
    kdf_nachylenie_dachu: dynamicRangeLayer('konstrukcja_detal_forma_nachylenie_dachu'),

    // Warstwy o specyficznych przedziałach liczbowych
    typologia_powierzchnia_parteru: `
        SELECT
            lokalizacja_id_geometrii,
            CASE
                WHEN typologia_powierzchnia_parteru <= 70 THEN 1
                WHEN typologia_powierzchnia_parteru <= 150 THEN 2
                WHEN typologia_powierzchnia_parteru <= 500 THEN 3
                WHEN typologia_powierzchnia_parteru <= 1000 THEN 4
                WHEN typologia_powierzchnia_parteru <= 2000 THEN 5
                ELSE 6
            END AS bucket
        FROM
            buildings
        WHERE typologia_powierzchnia_parteru IS NOT NULL`,

    typologia_ilosc_kondygnacji: `
        SELECT
            lokalizacja_id_geometrii,
            COALESCE(LEAST(typologia_ilosc_kondygnacji, 10), 1)::int AS bucket
        FROM
            buildings
        WHERE typologia_ilosc_kondygnacji IS NOT NULL`,

    // Warstwy materiałowe i detali architektonicznych
    kdf_material_elewacji: columnLayer('konstrukcja_detal_forma_material_elewacji', 'kdf_material_elewacji', true),
    kdf_material_dachu: columnLayer('konstrukcja_detal_forma_material_dachu', 'kdf_material_dachu', true),
    kdf_material_okien: columnLayer('konstrukcja_detal_forma_material_okien', 'kdf_material_okien', true),
    kdf_material_drzwi: columnLayer('konstrukcja_detal_forma_material_drzwi', 'kdf_material_drzwi', true),
    kdf_kolor_dachu_rgb: columnLayer('konstrukcja_detal_forma_kolor_dachu_rgb', 'kdf_kolor_dachu_rgb', false, "konstrukcja_detal_forma_kolor_dachu_rgb ~ '^#[0-9A-Fa-f]{6}$'"),
    kdf_typ_dachu: columnLayer('konstrukcja_detal_forma_typ_dachu', 'kdf_typ_dachu', true),

    // Warstwy planistyczne, adaptacyjności i społeczne
    planowanie_typ_krajobrazu: columnLayer('planowanie_typ_krajobrazu', 'planowanie_typ_krajobrazu', true),
    planowanie_krajobraz_priorytetowy: columnLayer('planowanie_krajobraz_priorytetowy'),
    za_dostepnosc_niepelnosprawni: columnLayer('zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni', 'za_dostepnosc_niepelnosprawni'),
    spoleczenstwo_bezpieczenstwo: columnLayer('spoleczenstwo_bezpieczenstwo'),
    spoleczenstwo_percepcja_obrazowosc: columnLayer('spoleczenstwo_percepcja_obrazowosc'),
    spoleczenstwo_percepcja_atrakcyjnosc: columnLayer('spoleczenstwo_percepcja_atrakcyjnosc'),
    spoleczenstwo_percepcja_czytelnosc: columnLayer('spoleczenstwo_percepcja_czytelnosc'),
};

const GEOMETRY_FIELD = 'geometry_geom';

function getBuildingLayerNames(): string[] {
    return Object.keys(LAYER_QUERIES).filter(tileset => tileset !== 'highlight');
}

function getAllLayerNames(): string[] {
    return Object.keys(LAYER_QUERIES);
}

function getDataConfig(tileset: string): DataConfig {
    const table = LAYER_QUERIES[tileset];
    if (table == undefined) {
        throw new Error('Invalid tileset requested');
    }

    if (tileset == 'base_boroughs') {
        const query = `(
            SELECT
            d.*,
            g.geometry_geom
        FROM (
            ${table}
        ) AS d
        JOIN
            geometries AS g
        ON d.lokalizacja_id_geometrii = g.lokalizacja_id_geometrii
        JOIN
            external_data_borough_boundary AS b
        ON d.lokalizacja_id_geometrii = b.lokalizacja_id_geometrii
    ) AS data`;
        return {
            geometry_field: GEOMETRY_FIELD,
            table: query
        };
    }

    const query = `(
        SELECT
            d.*,
            g.geometry_geom
        FROM (
            ${table}
        ) AS d
        JOIN
            geometries AS g
        ON d.lokalizacja_id_geometrii = g.lokalizacja_id_geometrii
    ) AS data`;
    return {
        geometry_field: GEOMETRY_FIELD,
        table: query
    };
}

function getLayerVariables(tileset: string, dataParams: any): object {
    if (tileset == 'highlight') {
        let { highlight, base } = dataParams;
        highlight = strictParseInt(highlight);
        base = base || 'default';
        if (isNaN(highlight) || base.match(/^\w+$/) == undefined) {
            throw new Error('Bad parameters for highlight layer');
        }
        return {
            highlight,
            base_data_layer: base
        };
    }
    return {};
}

export {
    getBuildingLayerNames,
    getAllLayerNames,
    getDataConfig,
    getLayerVariables
};
