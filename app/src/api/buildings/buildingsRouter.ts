import express from 'express';

import buildingCoreController from './controllers/buildingCoreController';
import buildingSpatialController from './controllers/buildingSpatialController';
import buildingVerifyController from './controllers/buildingVerifyController';

const router = express.Router();

// GET buildings at point (lokalizacja przestrzenna)
router.get('/locate', buildingSpatialController.getBuildingsByLocation);

// GET latest revision id
router.get('/revision', buildingCoreController.getLatestRevisionId);

// GET individual building & POST building updates
router.route('/:lokalizacja_id_budynku.json')
    .get(buildingCoreController.getBuildingById)
    .post(buildingCoreController.updateBuildingById);

// GET / POST verify building attribute (crowdsourcing)
router.route('/:lokalizacja_id_budynku/verify.json')
    .get(buildingVerifyController.getUserVerifiedAttributes)
    .post(buildingVerifyController.verifyBuildingAttributes);

// GET building edit history
router.route('/:lokalizacja_id_budynku/history.json')
    .get(buildingCoreController.getBuildingEditHistoryById);

export default router;
