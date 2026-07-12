import db from '../../../db';
import { tileCache } from '../../../tiles/rendererDefinition';
import { BoundingBox } from '../../../tiles/types';

function privateQueryBuildingBBOX(buildingId: number) {
    return db.one(
        `SELECT
            ST_XMin(envelope) as xmin,
            ST_YMin(envelope) as ymin,
            ST_XMax(envelope) as xmax,
            ST_YMax(envelope) as ymax
        FROM (
            SELECT
                ST_Envelope(g.geometry_geom) as envelope
            FROM buildings as b, geometries as g
            WHERE
                b.lokalizacja_id_geometrii = g.lokalizacja_id_geometrii
            AND
                b.lokalizacja_id_budynku = $1
        ) as envelope`,
        [buildingId]
    );
}

export async function expireBuildingTileCache(buildingId: number) {
    const bbox = await privateQueryBuildingBBOX(buildingId);
    const buildingBbox: BoundingBox = [bbox.xmax, bbox.ymax, bbox.xmin, bbox.ymin];
    tileCache.removeAllAtBbox(buildingBbox);
}
