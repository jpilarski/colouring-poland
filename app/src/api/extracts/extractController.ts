import express from 'express';

import { parsePositiveIntParam, processParam } from '../common/parameters';
import asyncController from '../common/asyncController';
import * as dataExtractService from './dataExtractService';

const getAllDataExtracts = asyncController(async function (req: express.Request, res: express.Response) {
    try {
        const dataExtracts = await dataExtractService.listDataExtracts();
        res.send({ extracts: dataExtracts });
    } catch (err) {
        res.send({ error: 'Database error' });
    }
});

const getDataExtract = asyncController(async function (req: express.Request, res: express.Response) {
    const extractId = processParam(req.params, 'extract_id', parsePositiveIntParam, true);

    try {
        const extract = await dataExtractService.getDataExtractById(extractId);
        res.send({ extract: extract });
    } catch (err) {
        res.send({ error: 'Database error' });
    }
});

export default {
    getAllDataExtracts,
    getDataExtract
};
