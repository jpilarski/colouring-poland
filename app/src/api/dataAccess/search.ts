import db from '../../db';

export interface LocationSearchResult {
    search_str: string;
    search_class: string;
    st_asgeojson: string;
    zoom: number;
    dist: number;
}

/**
 * Zapytanie wyszukujące lokalizacje na podstawie dopasowania tekstu (operator <-> w PostGIS)
 */
export async function selectLocationsBySearchTerm(term: string, limit: number = 5): Promise<LocationSearchResult[]> {
    try {
        return await db.manyOrNone<LocationSearchResult>(
            `SELECT
                search_str, search_class, ST_AsGeoJSON(center), zoom,
                search_str <-> $1 AS dist
            FROM
                search_locations
            ORDER BY
                dist
            LIMIT $2;`,
            [term, limit]
        );
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

