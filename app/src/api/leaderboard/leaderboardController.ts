import express from 'express';

import asyncController from '../common/asyncController';
import * as leadersService from './leaderboardService';

const getLeaders = asyncController(async (req: express.Request, res: express.Response) => {
    let number_limit = 50;
    if (req.query.number_limit !== undefined && req.query.number_limit !== '') {
        if (typeof req.query.number_limit !== 'string' || !/^\d+$/.test(req.query.number_limit.trim())) {
            return res.status(400).send({ error: 'Invalid number_limit parameter' });
        }
        number_limit = Number(req.query.number_limit.trim());
        if (!Number.isSafeInteger(number_limit) || number_limit < 1) {
            return res.status(400).send({ error: 'Invalid number_limit parameter' });
        }
    }

    let time_limit = 0;
    if (req.query.time_limit !== undefined && req.query.time_limit !== '') {
        if (typeof req.query.time_limit !== 'string' || !/^-?\d+$/.test(req.query.time_limit.trim())) {
            return res.status(400).send({ error: 'Invalid time_limit parameter' });
        }
        time_limit = Number(req.query.time_limit.trim());
        if (!Number.isSafeInteger(time_limit)) {
            return res.status(400).send({ error: 'Invalid time_limit parameter' });
        }
    }

    const result = await leadersService.getLeaders(number_limit, time_limit);
    res.send({
        leaders: result
    });
});

export default {
    getLeaders
};
