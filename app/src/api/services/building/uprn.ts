import db from '../../../db';

export async function getBuildingUPRNsById(id: number) {
    try {
        return await db.any(
            'SELECT uprn, parent_uprn FROM building_properties WHERE lokalizacja_id_budynku = $1',
            [id]
        );
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
