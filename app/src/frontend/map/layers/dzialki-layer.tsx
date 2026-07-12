import { GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDisplayPreferences } from '../../displayPreferences-context';
import { apiGet } from '../../apiHelpers';

export function DzialkiLayer() {
    const [geojson, setGeojson] = useState<GeoJsonObject | null>(null);
    const { dzialki, dzialkiOpacity } = useDisplayPreferences();

    useEffect(() => {
        apiGet('/geometries/dzialki.geojson').then(data => setGeojson(data as GeoJsonObject));
    }, []);

    if (dzialki === "enabled" && geojson) {
        return (
            <GeoJSON
                key={`dzialki-${dzialkiOpacity}`}
                data={geojson}
                style={{
                    color: '#b95252',
                    fill: false,
                    weight: 1,
                    fillOpacity: dzialkiOpacity,
                    opacity: dzialkiOpacity
                }}
            />
        );
    }

    return null;
}