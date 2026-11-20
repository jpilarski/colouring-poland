import { selectBuildingsAtPoint } from '../../dataAccess/building';
import { BaseBuilding } from '../../models/building';

export async function queryBuildingsAtPoint(lng: number, lat: number): Promise<BaseBuilding[]> {
    return selectBuildingsAtPoint(lng, lat);
}
