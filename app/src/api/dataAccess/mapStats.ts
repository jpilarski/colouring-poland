import db from '../../db';

export interface BuildingStatsRow {
    loc_min: number;
    loc_max: number;
    // pow_min?: number;
    // pow_max?: number;
    wys_min: number;
    wys_max: number;
    dach_min: number;
    dach_max: number;
    kond_min: number;
    kond_max: number;
}

/**
 * Pobiera w czasie rzeczywistym aktualne wartości min i max dla atrybutów budynków
 */
export async function selectBuildingMapStats(): Promise<BuildingStatsRow> {
    return await db.one<BuildingStatsRow>(`
        SELECT 
            MIN(lokalizacja_wysokosc_npm) as loc_min, MAX(lokalizacja_wysokosc_npm) as loc_max,
            -- MIN(typologia_powierzchnia_parteru) as pow_min, MAX(typologia_powierzchnia_parteru) as pow_max,
            MIN(typologia_wysokosc_maksymalna) as wys_min, MAX(typologia_wysokosc_maksymalna) as wys_max,
            MIN(konstrukcja_detal_forma_nachylenie_dachu) as dach_min, MAX(konstrukcja_detal_forma_nachylenie_dachu) as dach_max,
            MIN(typologia_ilosc_kondygnacji) as kond_min, MAX(typologia_ilosc_kondygnacji) as kond_max
        FROM buildings
    `);
}

/**
 * Wariant do pobierania unikalnych kondygnacji (przygotowany pod ewentualne użycie)
 */
// export async function selectDistinctStoreys(): Promise<any[]> {
//     return await db.any(`
//         SELECT DISTINCT typologia_ilosc_kondygnacji 
//         FROM buildings 
//         WHERE typologia_ilosc_kondygnacji IS NOT NULL 
//         ORDER BY typologia_ilosc_kondygnacji ASC
//     `);
// }

