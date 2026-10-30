import { GeoJsonObject } from 'geojson';
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDisplayPreferences } from '../displayPreferences-context';
import { apiGet } from '../../../api';

export function DzialkiLayer() {
    const [geojson, setGeojson] = useState<GeoJsonObject | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { dzialki, dzialkiOpacity } = useDisplayPreferences();
    const geoJsonRef = useRef<any>(null);

    useEffect(() => {
        if (dzialki === "enabled" && !geojson && !isLoading) {
            setIsLoading(true);
            apiGet('/geometries/dzialki.geojson')
                .then(data => {
                    setGeojson(data as GeoJsonObject);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load dzialki.geojson', err);
                    setIsLoading(false);
                });
        }
    }, [dzialki, geojson, isLoading]);

    useEffect(() => {
        if (geoJsonRef.current) {
            geoJsonRef.current.setStyle({
                color: '#b95252',
                fill: false,
                weight: 1,
                fillOpacity: dzialkiOpacity,
                opacity: dzialkiOpacity
            });
        }
    }, [dzialkiOpacity]);

    if (dzialki === "enabled" && geojson) {
        return (
            <GeoJSON
                ref={geoJsonRef}
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
