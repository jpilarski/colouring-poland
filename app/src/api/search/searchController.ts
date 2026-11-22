import express from 'express';
import asyncController from '../common/asyncController';
import { queryLocation } from './searchService';

const searchLocations = asyncController(async (req: express.Request, res: express.Response) => {
    const rawSearchTerm = req.query.q;
    if (typeof rawSearchTerm !== 'string' || rawSearchTerm.trim().length === 0) {
        return res.status(400).send({
            error: 'Please provide a search term'
        });
    }

    const searchTerm = rawSearchTerm.trim();
    const results = await queryLocation(searchTerm);
    if (typeof results === 'undefined') {
        return res.status(500).send({
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
});

export default {
    searchLocations
};
