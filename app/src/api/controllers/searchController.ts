import express from 'express';
import asyncController from '../routes/asyncController';
import { queryLocation } from '../services/search';

const searchLocations = asyncController(async (req: express.Request, res: express.Response) => {
    const searchTerm = req.query.q as string;
    if (!searchTerm) {
        return res.send({
            error: 'Please provide a search term'
        });
    }

    try {
        const results = await queryLocation(searchTerm);
        if (typeof results === 'undefined') {
            return res.send({
                error: 'Database error'
            });
        }
        res.send({
            results: results.map(item => {
                const geom = JSON.parse(item.st_asgeojson);
                return {
                    type: 'Feature',
                    attributes: {
                        label: item.search_str,
                        zoom: item.zoom || 9
                    },
                    geometry: geom
                };
            })
        });
    } catch (error) {
        res.send(error);
    }
});

export default {
    searchLocations
};

