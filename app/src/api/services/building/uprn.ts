import { selectBuildingUPRNsById, BuildingUPRNRow } from '../../dataAccess/building';

export async function getBuildingUPRNsById(id: number): Promise<BuildingUPRNRow[]> {
    return selectBuildingUPRNsById(id);
}
