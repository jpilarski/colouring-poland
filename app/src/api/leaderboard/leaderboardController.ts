import express from 'express';
import { parsePositiveIntParam, processParam } from '../common/parameters';
import asyncController from '../common/asyncController';
import * as leaderboardService from './leaderboardService';

const getLeaders = asyncController(async (req: express.Request, res: express.Response) => {
    const number_limit = processParam(req.query, 'number_limit', parsePositiveIntParam) || 50;
    const time_limit = processParam(req.query, 'time_limit', parsePositiveIntParam) || 0;

    const result = await leaderboardService.getLeaders(number_limit, time_limit);
    res.send({ leaders: result });
});

export default {
    getLeaders
};
