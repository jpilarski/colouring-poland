/**
 * Tileserver
 * - routes for Express app
 * - see rendererDefinition for actual rules of rendering
 */
import express from 'express';

import asyncController from '../api/common/asyncController';
import { strictParseInt } from '../parse';

import { allTilesets, renderTile } from './rendererDefinition';
import { TileParams } from './types';

const handleTileRequest = asyncController(async function (req: express.Request, res: express.Response) {
    let tileParams: TileParams;
    let dataParams: any;
    try {
        tileParams = parseTileParams(req.params);
        dataParams = req.query;
    } catch (err: any) {
        console.error('Tile params parsing error:', err.message);
        return res.status(400).send({ error: err.message });
    }

    try {
        const im = await renderTile(tileParams, dataParams);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(im);
    } catch (err) {
        console.error('Tile rendering error:', err);
        res.status(500).send({ error: 'Internal server error while rendering tile' });
    }
});

// tiles router
const router = express.Router();

router.get('/:tileset/:z/:x/:y(\\d+):scale(@\\dx)?.png', handleTileRequest);

function parseTileParams(params: any): TileParams {
    const { tileset, z, x, y, scale } = params;

    if (!allTilesets.includes(tileset)) throw new Error('Invalid value for tileset: ' + tileset);

    const intZ = strictParseInt(z);
    if (isNaN(intZ)) throw new Error('Invalid value for z: ' + z);

    const intX = strictParseInt(x);
    if (isNaN(intX)) throw new Error('Invalid value for x: ' + x);

    const intY = strictParseInt(y);
    if (isNaN(intY)) throw new Error('Invalid value for y: ' + y);

    let intScale: number;
    if (scale === '@2x') {
        intScale = 2;
    } else if (scale === '@1x' || scale == undefined) {
        intScale = 1;
    } else {
        throw new Error('Invalid value for scale');
    }

    return {
        tileset,
        z: intZ,
        x: intX,
        y: intY,
        scale: intScale
    };
}

router.use((req, res) => {
    return res.status(404).send('Tile not found');
});

export default router;
