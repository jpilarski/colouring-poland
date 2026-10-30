import { GeoJsonObject } from 'geojson';
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDisplayPreferences } from '../displayPreferences-context';
import { apiGet } from '../../../api';

export function LokalneFormyLayer() {
    const [geojson, setGeojson] = useState<GeoJsonObject | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { lokalneFormy, lokalneFormyOpacity } = useDisplayPreferences();
    const geoJsonRef = useRef<any>(null);

    useEffect(() => {
        if (lokalneFormy === "enabled" && !geojson && !isLoading) {
            setIsLoading(true);
            apiGet('/geometries/lfa.geojson')
                .then(data => {
                    setGeojson(data as GeoJsonObject);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load lfa.geojson', err);
                    setIsLoading(false);
                });
        }
    }, [lokalneFormy, geojson, isLoading]);

    useEffect(() => {
        if (geoJsonRef.current) {
            geoJsonRef.current.setStyle({
                color: '#8f5015',
                fill: true,
                fillColor: '#e0985c',
                weight: 1.5,
                fillOpacity: lokalneFormyOpacity,
                opacity: lokalneFormyOpacity
            });
        }
    }, [lokalneFormyOpacity]);

    if (lokalneFormy === "enabled" && geojson) {
        return (
            <GeoJSON
                ref={geoJsonRef}
                data={geojson}
                style={{
                    color: '#8f5015',
                    fill: true,
                    fillColor: '#e0985c',
                    weight: 1.5,
                    fillOpacity: lokalneFormyOpacity,
                    opacity: lokalneFormyOpacity
                }}
            />
        );
    }

    return null;
}
