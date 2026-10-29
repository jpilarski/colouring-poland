import express from 'express';

import { parseBooleanExact } from '../../../helpers';
import { ApiUserError, UserError } from '../../errors';
import { parsePositiveIntParam, processParam } from '../../common/parameters';
import asyncController from '../../common/asyncController';
import * as buildingService from '../services/base';
import * as userService from '../../users/services/userService';

// GET individual building
const getBuildingById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const returnUserAttributes = parseBooleanExact(String(req.query.user_attributes));

    let userDataOptions: buildingService.BuildingMetadataOptions['userDataOptions'] = undefined;
    if (returnUserAttributes) {
        let userId: string | undefined;
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
        userDataOptions = { userId: req.session.user_id, userAttributes: true };
    }

    try {
        const result = await buildingService.getBuildingById(buildingId, { userDataOptions });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.send({ error: 'Database error' });
    }
});

// POST building attribute updates
const updateBuildingById = asyncController(async (req: express.Request, res: express.Response) => {
    let userId: string | undefined;

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

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const {
        attributes = null,
        user_attributes: userAttributes = null
    } = req.body;

    try {
        const resultUpdate = await buildingService.editBuilding(buildingId, userId, { attributes, userAttributes });

        res.send({
            attributes: resultUpdate.attributes,
            user_attributes: resultUpdate.userAttributes,
            revision_id: resultUpdate.revisionId
        });
    } catch (error) {
        if (error instanceof UserError) {
            throw new ApiUserError(error.message, error);
        }
        throw error;
    }
});

// GET building user attributes
const getBuildingUserAttributesById = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Must be logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const userAttributes = await buildingService.getBuildingUserAttributesById(buildingId, req.session.user_id);
        res.send(userAttributes);
    } catch (error) {
        res.send({ error: 'Database error' });
    }
});

// GET building edit history
const getBuildingEditHistoryById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    try {
        const editHistory = await buildingService.getBuildingEditHistory(buildingId);
        res.send({ history: editHistory });
    } catch (error) {
        res.send({ error: 'Database error' });
    }
});

// GET latest revision id of any building
const getLatestRevisionId = asyncController(async (req: express.Request, res: express.Response) => {
    try {
        const revisionId = await buildingService.getLatestRevisionId();
        res.send({ latestRevisionId: revisionId });
    } catch (error) {
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
