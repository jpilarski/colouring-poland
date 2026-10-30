import { GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { apiGet } from '../../../apiHelpers';

export function MiastaPowiatyLayer() {
    const [miastaGeojson, setMiastaGeojson] = useState<GeoJsonObject | null>(null);
    const [powiatyGeojson, setPowiatyGeojson] = useState<GeoJsonObject | null>(null);

    useEffect(() => {
        let isMounted = true;

        apiGet('/geometries/miasta.geojson').then(data => {
            if (isMounted && data && typeof data === 'object') {
                setMiastaGeojson(data as GeoJsonObject);
            }
        }).catch(err => {
            console.error('Failed to load miasta.geojson', err);
        });

        apiGet('/geometries/powiaty.geojson').then(data => {
            if (isMounted && data && typeof data === 'object') {
                setPowiatyGeojson(data as GeoJsonObject);
            }
        }).catch(err => {
            console.error('Failed to load powiaty.geojson', err);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            {miastaGeojson && (
                <GeoJSON
                    data={miastaGeojson}
                    style={{ color: '#3cff00', fill: false, weight: 2, dashArray: '5, 5' }}
                />
            )}
            {powiatyGeojson && (
                <GeoJSON
                    data={powiatyGeojson}
                    style={{ color: '#00ffd5', fill: false, weight: 1.5, dashArray: '3, 3' }}
                />
            )}
        </>
    );
}
