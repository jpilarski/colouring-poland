import express from 'express';

import buildingCoreController from './controllers/buildingCoreController';
import buildingExternalController from './controllers/buildingExternalController';
import buildingSpatialController from './controllers/buildingSpatialController';
import buildingVerifyController from './controllers/buildingVerifyController';

const router = express.Router();

// GET buildings at point (lokalizacja przestrzenna)
router.get('/locate', buildingSpatialController.getBuildingsByLocation);

// GET buildings by reference (UPRN/TOID or other identifier)
router.get('/reference', buildingSpatialController.getBuildingsByReference);

// GET latest revision id
router.get('/revision', buildingCoreController.getLatestRevisionId);

// GET individual building & POST building updates
router.route('/:lokalizacja_id_budynku.json')
    .get(buildingCoreController.getBuildingById)
    .post(buildingCoreController.updateBuildingById);

// GET building UPRNs
router.get('/:lokalizacja_id_budynku/uprns.json', buildingExternalController.getBuildingUPRNsById);

// GET building planning data
router.get('/:lokalizacja_id_budynku/planning_data.json', buildingExternalController.getBuildingPlanningDataById);

// GET / POST verify building attribute (crowdsourcing)
router.route('/:lokalizacja_id_budynku/verify.json')
    .get(buildingVerifyController.getUserVerifiedAttributes)
    .post(buildingVerifyController.verifyBuildingAttributes);

// GET building edit history
router.route('/:lokalizacja_id_budynku/history.json')
    .get(buildingCoreController.getBuildingEditHistoryById);

export default router;
