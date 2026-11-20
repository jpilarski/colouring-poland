/**
 * Fasada modułu kontrolerów budynków (Building Controllers Facade)
 * Konsoliduje wyspecjalizowane kontrolery dziedzinowe dla zachowania 100% zgodności wstecznej.
 */
import buildingCoreController from './buildingCoreController';
import buildingSpatialController from './buildingSpatialController';
import buildingVerifyController from './buildingVerifyController';

export const {
    getBuildingById,
    updateBuildingById,
    getBuildingUserAttributesById,
    getBuildingEditHistoryById,
    getLatestRevisionId
} = buildingCoreController;

export const {
    getBuildingsByLocation
} = buildingSpatialController;

export const {
    getUserVerifiedAttributes,
    verifyBuildingAttributes
} = buildingVerifyController;

export default {
    ...buildingCoreController,
    ...buildingSpatialController,
    ...buildingVerifyController
};
