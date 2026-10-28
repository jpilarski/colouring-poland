import {
    selectBuildingPlanningDataById,
    BuildingPlanningDataRow
} from '../../dataAccess/building';

export async function getBuildingPlanningDataById(id: number): Promise<BuildingPlanningDataRow[]> {
    return selectBuildingPlanningDataById(id);
}
