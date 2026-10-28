import express from 'express';
import buildingCoreController from './controllers/buildingCoreController';
import buildingSpatialController from './controllers/buildingSpatialController';
import buildingVerifyController from './controllers/buildingVerifyController';
import buildingExternalController from './controllers/buildingExternalController';

const router = express.Router();

router.get('/locate', buildingSpatialController.getBuildingsByLocation);
router.get('/reference', buildingSpatialController.getBuildingsByReference);
router.get('/revision', buildingCoreController.getLatestRevisionId);

router.get('/:lokalizacja_id_budynku', buildingCoreController.getBuildingById);
router.get('/:lokalizacja_id_budynku.json', buildingCoreController.getBuildingById);
router.post('/:lokalizacja_id_budynku', buildingCoreController.updateBuildingById);
router.post('/:lokalizacja_id_budynku.json', buildingCoreController.updateBuildingById);

router.get('/:lokalizacja_id_budynku/verify.json', buildingVerifyController.getUserVerifiedAttributes);
router.post('/:lokalizacja_id_budynku/verify.json', buildingVerifyController.verifyBuildingAttributes);

router.get('/:lokalizacja_id_budynku/history.json', buildingCoreController.getBuildingEditHistoryById);
router.get('/:lokalizacja_id_budynku/uprns.json', buildingExternalController.getBuildingUPRNsById);
router.get('/:lokalizacja_id_budynku/planning_data.json', buildingExternalController.getBuildingPlanningDataById);

export default router;
