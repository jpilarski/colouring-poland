import express from 'express';

import { parsePositiveIntParam, processParam } from '../../common/parameters';
import asyncController from '../../common/asyncController';
import * as buildingService from '../services/base';

// GET building UPRNs
const getBuildingUPRNsById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const result = await buildingService.getBuildingUPRNsById(buildingId);

        if (typeof result === 'undefined') {
            return res.send({ error: 'Database error' });
        }
        res.send({ uprns: result });
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

// GET building planning data
const getBuildingPlanningDataById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const result = await buildingService.getBuildingPlanningDataById(buildingId);

        if (typeof result === 'undefined') {
            return res.send({ error: 'Database error' });
        }
        res.send({ data: result, buildingId: buildingId });
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

export default {
    getBuildingUPRNsById,
    getBuildingPlanningDataById
};

