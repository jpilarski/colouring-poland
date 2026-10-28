import express from 'express';

import { ApiUserError, UserError } from '../../errors';
import { parsePositiveIntParam, processParam } from '../../common/parameters';
import asyncController from '../../common/asyncController';
import * as buildingService from '../services/base';

// GET building attributes (and values) as verified by user
const getUserVerifiedAttributes = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Not logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const verifiedAttributes = await buildingService.getUserVerifiedAttributes(buildingId, req.session.user_id);
        res.send(verifiedAttributes);
    } catch (error) {
        if (error instanceof UserError) {
            throw new ApiUserError(error.message, error);
        }
        throw error;
    }
});

// POST update to verify building attribute
const verifyBuildingAttributes = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Must be logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);
    const verifiedAttributes = req.body;

    try {
        const success = await buildingService.verifyBuildingAttributes(buildingId, req.session.user_id, verifiedAttributes);
        res.send(success);
    } catch (error) {
        if (error instanceof UserError) {
            throw new ApiUserError(error.message, error);
        }
        throw error;
    }
});

export default {
    getUserVerifiedAttributes,
    verifyBuildingAttributes
};
