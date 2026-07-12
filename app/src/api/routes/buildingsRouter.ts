import express from 'express';

import buildingController from '../controllers/buildingController';

const router = express.Router();

// GET buildings
// not implemented - may be useful to GET all buildings, paginated

// GET buildings at point
router.get('/locate', buildingController.getBuildingsByLocation);

// GET buildings by reference (UPRN/TOID or other identifier)
router.get('/reference', buildingController.getBuildingsByReference);

router.get('/revision', buildingController.getLatestRevisionId);

router.route('/:lokalizacja_id_budynku.json')
    // GET individual building
    .get(buildingController.getBuildingById)
    // POST building updates
    .post(buildingController.updateBuildingById);


// GET building UPRNs
router.get('/:lokalizacja_id_budynku/uprns.json', buildingController.getBuildingUPRNsById);

router.get('/:lokalizacja_id_budynku/planning_data.json', buildingController.getBuildingPlanningDataById);

// POST verify building attribute
router.route('/:lokalizacja_id_budynku/verify.json')
    .get(buildingController.getUserVerifiedAttributes)
    .post(buildingController.verifyBuildingAttributes);

router.route('/:lokalizacja_id_budynku/history.json')
    .get(buildingController.getBuildingEditHistoryById);

export default router;
