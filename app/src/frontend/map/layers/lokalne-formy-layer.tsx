import { GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDisplayPreferences } from '../../displayPreferences-context';
import { apiGet } from '../../apiHelpers';

export function LokalneFormyLayer() {
    const [geojson, setGeojson] = useState<GeoJsonObject | null>(null);
    const { lokalneFormy, lokalneFormyOpacity } = useDisplayPreferences();

    useEffect(() => {
        apiGet('/geometries/lfa.geojson').then(data => setGeojson(data as GeoJsonObject));
    }, []);

    if (lokalneFormy === "enabled" && geojson) {
        return (
            <GeoJSON
                key={`dzialki-${lokalneFormyOpacity}`}
                data={geojson}
                style={{
                    color: '#8f5015',
                    fill: false,
                    weight: 1,
                    fillOpacity: lokalneFormyOpacity,
                    opacity: lokalneFormyOpacity
                }}
            />
        );
    }

    return null;
}