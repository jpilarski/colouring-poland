import { strictParseInt } from "../parse";

import { DataConfig } from "./types";

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

    // START DEFINICJI
    uzytkowanie_funkcja_ogolna: `
        SELECT
            lokalizacja_id_geometrii,
            uzytkowanie_funkcja_ogolna::text AS uzytkowanie_funkcja_ogolna
        FROM
            buildings
        WHERE uzytkowanie_funkcja_ogolna IS NOT NULL`,
    typologia_dominanta: `
        SELECT
            lokalizacja_id_geometrii,
            typologia_dominanta
        FROM
            buildings
        WHERE typologia_dominanta IS NOT NULL`,
    typologia_rodzaj_dominanty: `
        SELECT
            lokalizacja_id_geometrii,
            typologia_rodzaj_dominanty::text AS typologia_rodzaj_dominanty
        FROM
            buildings
        WHERE typologia_rodzaj_dominanty IS NOT NULL`,
    typologia_aktywny_parter: `
        SELECT
            lokalizacja_id_geometrii,
            typologia_aktywny_parter
        FROM
            buildings
        WHERE typologia_aktywny_parter IS NOT NULL`,
    kdf_material_elewacji: `
        SELECT
            lokalizacja_id_geometrii,
            konstrukcja_detal_forma_material_elewacji::text AS kdf_material_elewacji
        FROM
            buildings
        WHERE konstrukcja_detal_forma_material_elewacji IS NOT NULL`,
    kdf_material_dachu: `
        SELECT
            lokalizacja_id_geometrii,
            konstrukcja_detal_forma_material_dachu::text AS kdf_material_dachu
        FROM
            buildings
        WHERE konstrukcja_detal_forma_material_dachu IS NOT NULL`,
    kdf_material_okien: `
        SELECT
            lokalizacja_id_geometrii,
            konstrukcja_detal_forma_material_okien::text AS kdf_material_okien
        FROM
            buildings
        WHERE konstrukcja_detal_forma_material_okien IS NOT NULL`,
    kdf_material_drzwi: `
        SELECT
            lokalizacja_id_geometrii,
            konstrukcja_detal_forma_material_drzwi::text AS kdf_material_drzwi
        FROM
            buildings
        WHERE konstrukcja_detal_forma_material_drzwi IS NOT NULL`,
    kdf_kolor_dachu_rgb: `
        SELECT
            lokalizacja_id_geometrii,
            konstrukcja_detal_forma_kolor_dachu_rgb AS kdf_kolor_dachu_rgb
        FROM
            buildings
        WHERE konstrukcja_detal_forma_kolor_dachu_rgb IS NOT NULL`,
    kdf_typ_dachu: `
        SELECT
            lokalizacja_id_geometrii,
            konstrukcja_detal_forma_typ_dachu::text AS kdf_typ_dachu
        FROM
            buildings
        WHERE konstrukcja_detal_forma_typ_dachu IS NOT NULL`,
    planowanie_typ_krajobrazu: `
        SELECT
            lokalizacja_id_geometrii,
            planowanie_typ_krajobrazu::text AS planowanie_typ_krajobrazu
        FROM
            buildings
        WHERE planowanie_typ_krajobrazu IS NOT NULL`,
    planowanie_krajobraz_priorytetowy: `
        SELECT
            lokalizacja_id_geometrii,
            planowanie_krajobraz_priorytetowy
        FROM
            buildings
        WHERE planowanie_krajobraz_priorytetowy IS NOT NULL`,
    za_dostepnosc_niepelnosprawni: `
        SELECT
            lokalizacja_id_geometrii,
            zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni AS za_dostepnosc_niepelnosprawni
        FROM
            buildings
        WHERE zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni IS NOT NULL`,
    spoleczenstwo_bezpieczenstwo: `
        SELECT
            lokalizacja_id_geometrii,
            spoleczenstwo_bezpieczenstwo
        FROM
            buildings
        WHERE spoleczenstwo_bezpieczenstwo IS NOT NULL`,
    spoleczenstwo_percepcja_obrazowosc: `
        SELECT
            lokalizacja_id_geometrii,
            spoleczenstwo_percepcja_obrazowosc
        FROM
            buildings
        WHERE spoleczenstwo_percepcja_obrazowosc IS NOT NULL`,
    spoleczenstwo_percepcja_atrakcyjnosc: `
        SELECT
            lokalizacja_id_geometrii,
            spoleczenstwo_percepcja_atrakcyjnosc
        FROM
            buildings
        WHERE spoleczenstwo_percepcja_atrakcyjnosc IS NOT NULL`,
    spoleczenstwo_percepcja_czytelnosc: `
        SELECT
            lokalizacja_id_geometrii,
            spoleczenstwo_percepcja_czytelnosc
        FROM
            buildings
        WHERE spoleczenstwo_percepcja_czytelnosc IS NOT NULL`,

};

const GEOMETRY_FIELD = 'geometry_geom';

function getBuildingLayerNames() {
    return Object.keys(LAYER_QUERIES);
}

function getAllLayerNames() {
    return ['highlight', ...getBuildingLayerNames()];
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
        JOIN
            buildings AS b
        ON d.lokalizacja_id_geometrii = b.lokalizacja_id_geometrii
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