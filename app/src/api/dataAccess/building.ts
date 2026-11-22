import { errors, ITask } from 'pg-promise';
import _ from 'lodash';

import db from '../../db';
import { allAttributesConfig, buildingUserAttributesConfig } from '../config/dataFields';
import { BaseBuilding, BuildingAttributes, BuildingUserAttributes } from '../models/building';
import { ArgumentError, DatabaseError, NotFoundError } from '../errors';

export async function getBuildingData(
    buildingId: number,
    lockForUpdate: boolean = false,
    t?: ITask<any>
): Promise<BaseBuilding> {
    let buildingData;
    try {
        buildingData = await (t || db).one(
            `SELECT * FROM buildings WHERE lokalizacja_id_budynku = $1${lockForUpdate ? ' FOR UPDATE' : ''};`,
            [buildingId]
        );
    } catch (error: any) {
        if (
            error instanceof errors.QueryResultError &&
            error.code === errors.queryResultErrorCode.noData
        ) {
            throw new NotFoundError(`Building ID ${buildingId} does not exist`);
        }
        throw new DatabaseError(error?.message);
    }

    return buildingData;
}

export async function insertEditHistoryRevision(
    buildingId: number,
    userId: string,
    forwardPatch: object,
    reversePatch: object,
    t?: ITask<any>
): Promise<string> {
    try {
        const { log_id } = await (t || db).one(
            `INSERT INTO logs (
                        forward_patch, reverse_patch, lokalizacja_id_budynku, user_id
                    ) VALUES (
                        $1:json, $2:json, $3, $4
                    ) RETURNING log_id
                    `,
            [forwardPatch, reversePatch, buildingId, userId]
        );

        return log_id;
    } catch (error: any) {
        throw new DatabaseError(error?.message);
    }
}

const columnConfigLookup = Object.assign(
    {},
    ...Object.entries(allAttributesConfig).filter(([, config]) => config.edit || config.derivedEdit).map(([key, {
        asJson = false,
        sqlCast
    }]) => ({
        [key]: {
            name: key,
            mod: asJson ? ':json' : undefined,
            cast: sqlCast
        }
    }))
);

export async function updateBuildingData(
    buildingId: number,
    forwardPatch: object,
    revisionId: string,
    t?: ITask<any>
): Promise<BuildingAttributes> {
    // Usunięcie ewentualnych duplikatów z pól będących tablicami
    for (const key of Object.keys(forwardPatch)) {
        if (Array.isArray((forwardPatch as any)[key])) {
            (forwardPatch as any)[key] = Array.from(new Set((forwardPatch as any)[key]));
        }
    }

    const columnConfig = Object.entries(forwardPatch).map(([key]) => columnConfigLookup[key]);
    const sets = db.$config.pgp.helpers.sets(forwardPatch, columnConfig);

    console.log('Setting', buildingId, sets);

    try {
        const buildingRow: BaseBuilding = await (t || db).one(
            `UPDATE
                    buildings
                SET
                    revision_id = $1,
                    $2:raw
                WHERE
                    lokalizacja_id_budynku = $3
                RETURNING
                    *
                `,
            [revisionId, sets, buildingId]
        );

        delete buildingRow.lokalizacja_id_budynku;
        delete buildingRow.lokalizacja_id_geometrii;
        delete buildingRow.revision_id;

        return buildingRow as BuildingAttributes;
    } catch (error: any) {
        throw new DatabaseError(error?.message);
    }
}

/**
 * Function that ensures a building-user attribute record exists.
 * The record is created if there isn't one yet.
 */
async function ensureBuildingUserRecord(buildingId: number, userId: string, t: ITask<any>) {
    try {
        await t.one(
            `SELECT * FROM building_user_attributes WHERE lokalizacja_id_budynku = $1 AND user_id = $2;`,
            [buildingId, userId]
        );
    } catch (error: any) {
        if (error.code === errors.queryResultErrorCode.noData) {
            try {
                await t.none(
                    'INSERT INTO building_user_attributes (lokalizacja_id_budynku, user_id) VALUES ($1, $2);',
                    [buildingId, userId]
                );
            } catch (insertError: any) {
                throw new DatabaseError(insertError?.message);
            }
        } else {
            throw new DatabaseError(error?.message);
        }
    }
}

type BuildingUserAttributesRow = BuildingUserAttributes & {
    lokalizacja_id_budynku: number;
    user_id: string;
}

export async function updateBuildingUserData(
    buildingId: number,
    userId: string,
    forwardPatch: object,
    t: ITask<any>
): Promise<BuildingUserAttributes> {
    await ensureBuildingUserRecord(buildingId, userId, t);

    // Usunięcie ewentualnych duplikatów z pól będących tablicami
    for (const key of Object.keys(forwardPatch)) {
        if (Array.isArray((forwardPatch as any)[key])) {
            (forwardPatch as any)[key] = Array.from(new Set((forwardPatch as any)[key]));
        }
    }

    const columnConfig = Object.entries(forwardPatch).map(([key]) => columnConfigLookup[key]);
    const sets = db.$config.pgp.helpers.sets(forwardPatch, columnConfig);

    try {
        const buildingUserRow: BuildingUserAttributesRow = await t.one(
            `UPDATE
                    building_user_attributes
                SET
                    $1:raw
                WHERE
                    lokalizacja_id_budynku = $2
                    AND user_id = $3
                RETURNING
                    *
                ;`,
            [sets, buildingId, userId]
        );

        delete buildingUserRow.lokalizacja_id_budynku;
        delete buildingUserRow.user_id;

        return buildingUserRow;
    } catch (error: any) {
        throw new DatabaseError(error?.message);
    }
}

async function buildingExists(buildingId: number, t?: ITask<any>) {
    return (
        await (t || db).oneOrNone(
            'SELECT lokalizacja_id_budynku FROM buildings WHERE lokalizacja_id_budynku = $1',
            [buildingId]
        )
    ) !== null;
}

function makeDefaultUserData() {
    return _.mapValues(buildingUserAttributesConfig, () => null);
}

export async function getBuildingUserData(
    buildingId: number,
    userId: string,
    lockForUpdate: boolean = false,
    t?: ITask<any>
): Promise<BuildingUserAttributes> {
    try {
        const buildingUserRow = await (t || db).oneOrNone(
            `SELECT
                *
            FROM building_user_attributes
            WHERE
                lokalizacja_id_budynku = $1
                AND user_id = $2
            ${lockForUpdate ? ' FOR UPDATE' : ''};
            `,
            [buildingId, userId]
        );

        if (buildingUserRow) {
            delete buildingUserRow.lokalizacja_id_budynku;
            delete buildingUserRow.user_id;

            return buildingUserRow;
        } else {
            if (await buildingExists(buildingId, t)) {
                return makeDefaultUserData();
            } else {
                throw new NotFoundError(`Building ID ${buildingId} does not exist`);
            }
        }

    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof ArgumentError) {
            throw error;
        }
        throw new DatabaseError(error?.message);
    }
}


/**
 * Wyszukuje budynki przecinające się z zadanym punktem współrzędnych (WGS84 -> EPSG:3857)
 */
export async function selectBuildingsAtPoint(lng: number, lat: number): Promise<BaseBuilding[]> {
    try {
        return await db.manyOrNone<BaseBuilding>(
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
                )`,
            [lng, lat]
        );
    } catch (error: any) {
        console.error('Error in selectBuildingsAtPoint:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        throw new DatabaseError(error?.message);
    }
}

export interface BuildingBBoxRow {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}

/**
 * Pobiera granice przestrzenne (bounding box) geometrii budynku pod kątem odświeżenia kafelków
 */
export async function selectBuildingBBOX(buildingId: number): Promise<BuildingBBoxRow> {
    return await db.one<BuildingBBoxRow>(
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
