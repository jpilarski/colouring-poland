import {
    selectBuildingsAtPoint,
    selectBuildingsByUprn
} from '../../dataAccess/building';
import { BaseBuilding } from '../../models/building';

export async function queryBuildingsAtPoint(lng: number, lat: number): Promise<BaseBuilding[]> {
    return selectBuildingsAtPoint(lng, lat);
}

export async function queryBuildingsByReference(key: string, ref: string): Promise<BaseBuilding[] | { error: string }> {
    if (key === 'uprn') {
        return selectBuildingsByUprn(ref);
    } else {
        return { error: 'Key must be UPRN ' };
    }
}
