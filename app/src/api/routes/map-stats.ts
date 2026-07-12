import express from 'express';
import db from '../../db';
import asyncController from './asyncController';

const router = express.Router();

router.get('/', asyncController(async (req: express.Request, res: express.Response) => {
    const stats = await db.one(`
        SELECT 
            MIN(lokalizacja_wysokosc_npm) as loc_min, MAX(lokalizacja_wysokosc_npm) as loc_max,
            MIN(typologia_powierzchnia_parteru) as pow_min, MAX(typologia_powierzchnia_parteru) as pow_max,
            MIN(typologia_wysokosc_maksymalna) as wys_min, MAX(typologia_wysokosc_maksymalna) as wys_max,
            MIN(konstrukcja_detal_forma_nachylenie_dachu) as dach_min, MAX(konstrukcja_detal_forma_nachylenie_dachu) as dach_max,
            MIN(typologia_ilosc_kondygnacji) as kond_min, MAX(typologia_ilosc_kondygnacji) as kond_max
        FROM buildings
    `);

    const distinctStoreys = await db.any(`
        SELECT DISTINCT typologia_ilosc_kondygnacji 
        FROM buildings 
        WHERE typologia_ilosc_kondygnacji IS NOT NULL 
        ORDER BY typologia_ilosc_kondygnacji ASC
    `);

    res.json({
        lokalizacja_wysokosc_npm: { min: stats.loc_min, max: stats.loc_max },
        typologia_powierzchnia_parteru: { min: stats.pow_min, max: stats.pow_max },
        typologia_wysokosc_maksymalna: { min: stats.wys_min, max: stats.wys_max },
        kdf_nachylenie_dachu: { min: stats.dach_min, max: stats.dach_max },
        typologia_ilosc_kondygnacji: {
            min: stats.kond_min,
            max: stats.kond_max,
            distinct_values: distinctStoreys.map((row: any) => row.typologia_ilosc_kondygnacji)
        }
    });
}));

export default router;