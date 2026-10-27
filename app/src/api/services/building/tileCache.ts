import { selectBuildingBBOX } from '../../dataAccess/building';
import { tileCache } from '../../../tiles/rendererDefinition';
import { BoundingBox } from '../../../tiles/types';

export async function expireBuildingTileCache(buildingId: number): Promise<void> {
    const bbox = await selectBuildingBBOX(buildingId);
    const buildingBbox: BoundingBox = [bbox.xmax, bbox.ymax, bbox.xmin, bbox.ymin];
    tileCache.removeAllAtBbox(buildingBbox);
}
