import React, { FC, useCallback, useEffect, useState } from 'react';
import { AttributionControl, MapContainer, ZoomControl, useMapEvent, Pane, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './map.css';

import { apiGet } from '../apiHelpers';
import { initialMapViewport, mapBackgroundColor, MapTheme } from '../config/map-config';

import { Building } from '../models/building';

import { CityBaseMapLayer } from './layers/city-base-map-layer';
import { BuildingBaseLayer } from './layers/building-base-layer';
import { BuildingDataLayer } from './layers/building-data-layer';
import { BuildingNumbersLayer } from './layers/building-numbers-layer';
import { BuildingHighlightLayer } from './layers/building-highlight-layer';
import { MiastaPowiatyLayer } from './layers/powiaty-miasta-layer';
import { DzialkiLayer } from './layers/dzialki-layer';
import { LokalneFormyLayer } from './layers/lokalne-formy-layer';

import { Legend } from './legend';
import SearchBox from './search-box';
import ThemeSwitcher from './theme-switcher';
import DataLayerSwitcher from './data-switcher';
import { DzialkiSwitcher } from './dzialki-switcher';
import { LokalneFormySwitcher } from './lokalne-formy-switcher';
import { EditableBuildingsSwitcher } from './editable-buildings-switcher';
import { BuildingMapTileset } from '../config/tileserver-config';
import { useDisplayPreferences } from '../displayPreferences-context';
import { CategoryMapDefinition } from '../config/category-maps-config';

interface ColouringMapProps {
    selectedBuildingId: number;
    mode: 'basic' | 'view' | 'edit' | 'multi-edit';
    revisionId: string;
    onBuildingAction: (building: Building) => void;
    mapColourScale: BuildingMapTileset;
    onMapColourScale: (x: BuildingMapTileset) => void;
    categoryMapDefinitions: CategoryMapDefinition[];
}

export const ColouringMap: FC<ColouringMapProps> = ({
    mode,
    revisionId,
    onBuildingAction,
    selectedBuildingId,
    mapColourScale,
    onMapColourScale,
    categoryMapDefinitions,
}) => {
    const { darkLightTheme, darkLightThemeSwitch, showLayerSelection } = useDisplayPreferences();
    const [position, setPosition] = useState(initialMapViewport.position);
    const [zoom, setZoom] = useState(initialMapViewport.zoom);

    const handleLocate = useCallback(
        (lat: number, lng: number, zoom: number) => {
            setPosition([lat, lng]);
            setZoom(zoom);
        },
        []
    );

    const handleClick = useCallback(
        async (e) => {
            const { lat, lng } = e.latlng;
            const data = await apiGet(`/api/buildings/locate?lat=${lat}&lng=${lng}`);
            const building = data?.[0];
            onBuildingAction(building);
        },
        [onBuildingAction],
    );

    return (
        <div className="map-container">
            <MapContainer
                center={initialMapViewport.position}
                zoom={initialMapViewport.zoom}
                minZoom={9}
                maxZoom={18}
                doubleClickZoom={false}
                zoomControl={false}
                attributionControl={false}
            >
                <ClickHandler onClick={handleClick} />
                <MapBackgroundColor theme={darkLightTheme} />
                <MapViewport position={position} zoom={zoom} />

                {/* 1. TŁO SYSTEMOWE (najniżej) */}
                <Pane key={darkLightTheme} name={'cc-base-pane'} style={{ zIndex: 50 }}>
                    {/* Zostawiamy pusty Pane zachowawczo (dawniej był tu OSM) */}
                </Pane>

                {/* 2. TŁO MIEJSKIE (podkład mapy np. rzeki, ulice) */}
                <Pane name='cc-overlay-pane-shown-behind-buildings' style={{ zIndex: 100 }}>
                    <CityBaseMapLayer theme={darkLightTheme} />
                </Pane>

                {/* 3. OBSZARY I POLIGONY (Działki, Formy Ochrony) - pod budynkami! */}
                <Pane name='cc-areas-pane' style={{ zIndex: 150 }}>
                    <DzialkiLayer />
                    <LokalneFormyLayer />
                </Pane>

                {/* 4. LINIE I GRANICE (Miasta, Powiaty) - nad obszarami, żeby były czytelne */}
                <Pane name='cc-borders-pane' style={{ zIndex: 175 }}>
                    <MiastaPowiatyLayer />
                </Pane>

                {/* 5. BUDYNKI BAZOWE (Szare klocki) */}
                <Pane name={'cc-base-building-pane'} style={{ zIndex: 195 }}>
                    <BuildingBaseLayer theme={darkLightTheme} />
                </Pane>

                {/* 6. BUDYNKI - DANE KOLOROWE (Płytki TileServera nakładane na szare klocki) */}
                {mapColourScale && (
                    <BuildingDataLayer
                        tileset={mapColourScale}
                        revisionId={revisionId}
                    />
                )}

                {/* 7. NAKŁADKI INTERAKTYWNE (Podświetlenia, Etykiety Numeryczne) - Na samej górze */}
                <Pane name='cc-overlay-pane' style={{ zIndex: 300 }}>
                    <BuildingNumbersLayer revisionId={revisionId} />
                    {selectedBuildingId && (
                        <BuildingHighlightLayer
                            selectedBuildingId={selectedBuildingId}
                            baseTileset={mapColourScale}
                        />
                    )}
                </Pane>

                {/* 8. PANE NA LABELS (np. Tooltipy) */}
                <Pane name='cc-label-overlay-pane' style={{ zIndex: 1000 }} />

                <ZoomControl position="topright" />
                <AttributionControl prefix="" />
            </MapContainer>

            {mode !== 'basic' && (
                <Legend
                    mapColourScaleDefinitions={categoryMapDefinitions}
                    mapColourScale={mapColourScale}
                    onMapColourScale={onMapColourScale}
                />
            )}

            <div className="switchers-of-layers-map-menu">
                <ThemeSwitcher onSubmit={darkLightThemeSwitch} currentTheme={darkLightTheme} />
                <DataLayerSwitcher />
                {showLayerSelection === "enabled" && (
                    <>
                        <EditableBuildingsSwitcher />
                        <DzialkiSwitcher />
                        <LokalneFormySwitcher />
                    </>
                )}
            </div>

            <SearchBox onLocate={handleLocate} />
        </div>
    );
};

function ClickHandler({ onClick }: { onClick: (e: any) => void }) {
    useMapEvent('click', (e) => onClick(e));
    return null;
}

function MapBackgroundColor({ theme }: { theme: MapTheme }) {
    const map = useMap();
    useEffect(() => {
        map.getContainer().style.backgroundColor = mapBackgroundColor[theme];
    }, [map, theme]);
    return null;
}

function MapViewport({ position, zoom }: { position: [number, number]; zoom: number; }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, zoom);
    }, [map, position, zoom]);
    return null;
}