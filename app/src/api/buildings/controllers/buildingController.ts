import buildingCoreController from './buildingCoreController';
import buildingSpatialController from './buildingSpatialController';
import buildingVerifyController from './buildingVerifyController';
import buildingExternalController from './buildingExternalController';

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
