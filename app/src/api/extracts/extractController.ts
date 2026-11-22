import express from 'express';

import { parsePositiveIntParam, processParam } from '../common/parameters';
import asyncController from '../common/asyncController';
import * as dataExtractService from './dataExtractService';


const getAllDataExtracts = asyncController(async function (req: express.Request, res: express.Response) {
    const dataExtracts = await dataExtractService.listDataExtracts();
    res.send({ extracts: dataExtracts });
});

const getDataExtract = asyncController(async function (req: express.Request, res: express.Response) {
    const extractId = processParam(req.params, 'extract_id', parsePositiveIntParam, true);

    const extract = await dataExtractService.getDataExtractById(extractId);
    if (!extract) {
        return res.status(404).send({ error: 'Data extract not found' });
    }
    res.send({ extract: extract });
});

export default {
    getAllDataExtracts,
    getDataExtract
};
