/**
 * Fasada modułu kontrolerów budynków (Building Controllers Facade)
 * Konsoliduje wyspecjalizowane kontrolery dziedzinowe dla zachowania 100% zgodności wstecznej.
 */
import buildingCoreController from './buildingCoreController';
import buildingExternalController from './buildingExternalController';
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
    getBuildingsByLocation,
    getBuildingsByReference
} = buildingSpatialController;

export const {
    getUserVerifiedAttributes,
    verifyBuildingAttributes
} = buildingVerifyController;

export const {
    getBuildingUPRNsById,
    getBuildingPlanningDataById
} = buildingExternalController;

export default {
    ...buildingCoreController,
    ...buildingSpatialController,
    ...buildingVerifyController,
    ...buildingExternalController
};
