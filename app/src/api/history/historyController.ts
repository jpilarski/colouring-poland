import express from 'express';

import { ApiParamError, ApiUserError, ArgumentError } from '../errors';
import { checkRegexParam, parsePositiveIntParam, processParam, parseBooleanParam } from '../common/parameters';
import asyncController from '../common/asyncController';
import * as editHistoryService from './historyService';

const getGlobalEditHistory = asyncController(async (req: express.Request, res: express.Response) => {

    const revisionIdRegex = /^[1-9]\d*$/;
    const afterId: string | undefined = processParam(req.query, 'after_id', x => checkRegexParam(x, revisionIdRegex));
    const beforeId: string | undefined = processParam(req.query, 'before_id', x => checkRegexParam(x, revisionIdRegex));
    const count: number | undefined = processParam(req.query, 'count', parsePositiveIntParam);
    const filterDeletions: boolean | undefined = processParam(req.query, 'deletions', parseBooleanParam);

    if (afterId != undefined && beforeId != undefined) {
        throw new ApiUserError('Cannot specify both after_id and before_id parameters');
    }

    try {
        const result = await editHistoryService.getGlobalEditHistory(beforeId, afterId, count, filterDeletions);
        res.send(result);
    } catch (error) {
        if (error instanceof ArgumentError && error.argumentName === 'count') {
            throw new ApiParamError(error.message, error, 'count');
        }

        throw error;
    }
});

export {
    getGlobalEditHistory
};
