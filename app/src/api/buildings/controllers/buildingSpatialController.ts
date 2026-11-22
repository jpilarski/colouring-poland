import express from 'express';

import asyncController from '../../common/asyncController';
import * as buildingService from '../services/base';

// GET buildings at point
const getBuildingsByLocation = asyncController(async (req: express.Request, res: express.Response) => {
    const rawLng = req.query.lng;
    const rawLat = req.query.lat;
    const lng = typeof rawLng === 'string' && rawLng.trim() !== '' ? Number(rawLng) : NaN;
    const lat = typeof rawLat === 'string' && rawLat.trim() !== '' ? Number(rawLat) : NaN;

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).send({ error: 'Invalid coordinates: lat must be in [-90, 90] and lng in [-180, 180]' });
    }

    const result = await buildingService.queryBuildingsAtPoint(lng, lat);
    res.send(result);
});

export default {
    getBuildingsByLocation
};
