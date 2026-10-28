import express from 'express';
import asyncController from '../common/asyncController';
import { selectBuildingMapStats } from '../dataAccess/mapStats';

const getMapStats = asyncController(async (req: express.Request, res: express.Response) => {
    const stats = await selectBuildingMapStats();

    res.json({
        lokalizacja_wysokosc_npm: { min: stats.loc_min, max: stats.loc_max },
        typologia_wysokosc_maksymalna: { min: stats.wys_min, max: stats.wys_max },
        kdf_nachylenie_dachu: { min: stats.dach_min, max: stats.dach_max }
    });
});

export default {
    getMapStats
};
