import db from '../../../db';

export async function queryBuildingsAtPoint(lng: number, lat: number) {
    try {
        return await db.manyOrNone(
            `SELECT b.*
            FROM buildings as b, geometries as g
            WHERE
                b.lokalizacja_id_geometrii = g.lokalizacja_id_geometrii
            AND
                ST_Intersects(
                    ST_Transform(
                        ST_SetSRID(ST_Point($1, $2), 4326),
                        3857
                    ),
                    geometry_geom
                )
            `,
            [lng, lat]
        );
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

export async function queryBuildingsByReference(key: string, ref: string) {
    try {
        if (key === 'uprn') {
            return await db.manyOrNone(
                `SELECT
                    b.*
                FROM
                    buildings as b, building_properties as p
                WHERE
                    b.lokalizacja_id_budynku = p.lokalizacja_id_budynku
                AND
                    p.uprn = $1
                `,
                [ref]
            );
        } else {
            return { error: 'Key must be UPRN ' };
        }
    } catch (err) {
        console.error(err);
        return undefined;
    }
}
