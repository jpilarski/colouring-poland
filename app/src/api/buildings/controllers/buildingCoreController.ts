import express from 'express';

import { parseBooleanExact } from '../../../helpers';
import { ApiUserError } from '../../common/errors/api';
import { UserError } from '../../common/errors/general';
import { parsePositiveIntParam, processParam } from '../../common/parameters';
import asyncController from '../../common/asyncController';
import * as buildingService from '../services/base';
import * as userService from '../../users/services/userService';

// GET individual building
const getBuildingById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const returnUserAttributes = parseBooleanExact(String(req.query.user_attributes));

    let userDataOptions = null;
    if (returnUserAttributes) {
        let userId: string;
        try {
            userId = req.session.user_id ?? (
                req.query.api_key && await userService.authAPIUser(String(req.query.api_key))
            );
        } catch (error) {
            console.error(error);
        }

        if (!userId) {
            return res.send({ error: 'Must be logged in' });
        }

        userDataOptions = {
            userId,
            userAttributes: true
        };
    }

    try {
        const result = await buildingService.getBuildingById(buildingId, { userDataOptions });
        if (typeof result === 'undefined') {
            return res.send({ error: 'Database error' });
        }
        res.send(result);
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

// POST update to individual building
const updateBuildingById = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Must be logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const resultUpdate = await buildingService.editBuilding(buildingId, req.session.user_id, req.body);
        res.send(resultUpdate);
    } catch (error) {
        if (error instanceof UserError) {
            throw new ApiUserError(error.message, error);
        }
        throw error;
    }
});

// GET user specific attributes for individual building
const getBuildingUserAttributesById = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Not logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const userAttributes = await buildingService.getBuildingUserAttributesById(buildingId, req.session.user_id);
        res.send(userAttributes);
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

// GET building edit history
const getBuildingEditHistoryById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const editHistory = await buildingService.getBuildingEditHistory(buildingId);

        if (typeof editHistory === 'undefined') {
            return res.send({ error: 'Database error' });
        }
        res.send({ history: editHistory });
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

// GET latest revision id
const getLatestRevisionId = asyncController(async (req: express.Request, res: express.Response) => {
    try {
        const revisionId = await buildingService.getLatestRevisionId();

        if (typeof revisionId === 'undefined') {
            return res.send({ error: 'Database error' });
        }
        res.send({ revision_id: revisionId });
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

export default {
    getBuildingById,
    updateBuildingById,
    getBuildingUserAttributesById,
    getBuildingEditHistoryById,
    getLatestRevisionId
};
