import express from 'express';
import asyncController from './asyncController';
import { selectBuildingMapStats } from '../dataAccess/mapStats';

const router = express.Router();

router.get('/', asyncController(async (req: express.Request, res: express.Response) => {
    const stats = await selectBuildingMapStats();

    // const distinctStoreys = await selectDistinctStoreys();

    res.json({
        lokalizacja_wysokosc_npm: { min: stats.loc_min, max: stats.loc_max },
        // typologia_powierzchnia_parteru: { min: stats.pow_min, max: stats.pow_max },
        typologia_wysokosc_maksymalna: { min: stats.wys_min, max: stats.wys_max },
        kdf_nachylenie_dachu: { min: stats.dach_min, max: stats.dach_max },
        // typologia_ilosc_kondygnacji: {
        //     min: stats.kond_min,
        //     max: stats.kond_max,
        //     distinct_values: distinctStoreys.map((row: any) => row.typologia_ilosc_kondygnacji)
        // }
    });
}));

export default router;
