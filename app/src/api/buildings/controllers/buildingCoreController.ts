import express from 'express';

import { parseBooleanExact } from '../../../helpers';
import { ApiUserError, ConflictError, InvalidOperationError, NotFoundError, UserError } from '../../errors';
import { parsePositiveIntParam, processParam } from '../../common/parameters';
import { setNoStoreHeaders } from '../../common/securityHeadersConfig';
import asyncController from '../../common/asyncController';
import * as buildingService from '../services/base';
import * as userService from '../../users/services/userService';

// GET individual building
const getBuildingById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const returnUserAttributes = parseBooleanExact(String(req.query.user_attributes));

    let userDataOptions: buildingService.BuildingMetadataOptions['userDataOptions'] = undefined;
    if (returnUserAttributes) {
        setNoStoreHeaders(res);
        let userId: string | undefined;
        try {
            userId = req.session.user_id ?? (
                req.query.api_key && await userService.authAPIUser(String(req.query.api_key))
            );
        } catch (error: any) {
            console.error('Error authenticating API key:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        }

        if (!userId) {
            return res.status(401).send({ error: 'Must be logged in' });
        }
        userDataOptions = { userId: userId, userAttributes: true };
    }

    const result = await buildingService.getBuildingById(buildingId, { userDataOptions });
    res.send(result);
});

// POST building attribute updates
const updateBuildingById = asyncController(async (req: express.Request, res: express.Response) => {
    setNoStoreHeaders(res);
    let userId: string | undefined;

    try {
        userId = req.session.user_id ?? (
            req.query.api_key && await userService.authAPIUser(String(req.query.api_key))
        );
    } catch (error: any) {
        console.error('Error authenticating API key:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
    }

    if (!userId) {
        return res.status(401).send({ error: 'Must be logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const {
        attributes = null,
        user_attributes: userAttributes = null
    } = req.body || {};

    try {
        const resultUpdate = await buildingService.editBuilding(buildingId, userId, { attributes, userAttributes });

        res.send({
            attributes: resultUpdate.attributes,
            user_attributes: resultUpdate.userAttributes,
            revision_id: resultUpdate.revisionId
        });
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof InvalidOperationError) {
            throw error;
        }
        if (error instanceof UserError) {
            throw new ApiUserError(error.message, error);
        }
        throw error;
    }
});

// GET building user attributes
const getBuildingUserAttributesById = asyncController(async (req: express.Request, res: express.Response) => {
    setNoStoreHeaders(res);
    if (!req.session.user_id) {
        return res.status(401).send({ error: 'Must be logged in' });
    }

    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const userAttributes = await buildingService.getBuildingUserAttributesById(buildingId, req.session.user_id);
    res.send(userAttributes);
});

// GET building edit history
const getBuildingEditHistoryById = asyncController(async (req: express.Request, res: express.Response) => {
    const buildingId = processParam(req.params, 'lokalizacja_id_budynku', parsePositiveIntParam, true);

    const editHistory = await buildingService.getBuildingEditHistory(buildingId);
    res.send({ history: editHistory });
});

// GET latest revision id of any building
const getLatestRevisionId = asyncController(async (req: express.Request, res: express.Response) => {
    const revisionId = await buildingService.getLatestRevisionId();
    res.send({ latestRevisionId: revisionId });
});

export default {
    getBuildingById,
    updateBuildingById,
    getBuildingUserAttributesById,
    getBuildingEditHistoryById,
    getLatestRevisionId
};
