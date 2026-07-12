import React, { FC, useCallback, useEffect, useState } from 'react';
import './legend.css';
import { DownIcon, UpIcon } from '../components/icons';
import { Logo } from '../components/logo';
import { CategoryMapDefinition, LegendConfig } from '../config/category-maps-config';
import { BuildingMapTileset } from '../config/tileserver-config';
import { apiGet } from '../apiHelpers';

interface LegendProps {
    mapColourScaleDefinitions: CategoryMapDefinition[];
    mapColourScale: BuildingMapTileset;
    onMapColourScale: (x: BuildingMapTileset) => void;
    revisionId: string;
}

export const Legend: FC<LegendProps> = ({
    mapColourScaleDefinitions,
    mapColourScale,
    onMapColourScale,
    revisionId
}) => {
    const [collapseList, setCollapseList] = useState(false);
    const [mapStats, setMapStats] = useState<any>(null);

    const handleToggle = useCallback(() => {
        setCollapseList(!collapseList);
    }, [collapseList]);

    const onResize = useCallback(({ target }) => {
        setCollapseList((target.outerHeight < 670 || target.outerWidth < 768))
    }, []);

    useEffect(() => {
        window.addEventListener('resize', onResize);
        if (window?.outerHeight) {
            onResize({ target: window });
        }
        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, [onResize]);

    // Fetch dynamic stats for gradients
    useEffect(() => {
        apiGet('/api/map-stats').then(data => {
            if (!data.error) {
                setMapStats(data);
            }
        }).catch(err => console.error(err));
    }, [revisionId]);

    const legendConfig = mapColourScaleDefinitions.find(def => def.mapStyle === mapColourScale)?.legend;
    const {
        title = undefined,
        description = undefined,
        disclaimer = undefined,
        isDynamicGradient = false,
        isDynamicDistinct = false // <--- wyciągamy naszą nową flagę
    } = legendConfig ?? {};

    let elements = legendConfig?.elements ?? [];

    if (isDynamicGradient && mapStats && mapStats[mapColourScale]) {
        const { min, max } = mapStats[mapColourScale];
        if (min !== null && max !== null) {
            const step = (max - min) / 6;
            elements = elements.map((item, idx) => {
                if ('subtitle' in item) return item;
                const bucketMin = (min + step * idx).toFixed(1);
                const bucketMax = (min + step * (idx + 1)).toFixed(1);
                return {
                    ...item,
                    text: `${bucketMin} - ${bucketMax}`
                };
            });
        }
    }

    if (isDynamicDistinct && mapStats && mapStats[mapColourScale]) {
        const { min, max, distinct_values } = mapStats[mapColourScale];
        if (min !== null && max !== null && distinct_values) {
            elements = distinct_values.map((val: number) => {
                let ratio = 0;
                if (max !== min) {
                    ratio = (val - min) / (max - min);
                }
                const g = Math.round(ratio * 255).toString(16).padStart(2, '0');
                const b = Math.round(147 + ratio * 108).toString(16).padStart(2, '0');
                const colorHex = `#ff${g}${b}`.toUpperCase();

                return {
                    color: colorHex,
                    text: val.toString()
                };
            });
        }
    }

    return (
        <div className="map-legend">
            <Logo variant="default" />
            {
                mapColourScaleDefinitions.length > 1 ?
                    <select className='style-select' onChange={e => onMapColourScale(e.target.value as BuildingMapTileset)} value={mapColourScale}>
                        {
                            mapColourScaleDefinitions.map(def =>
                                <option key={def.mapStyle} value={def.mapStyle}>{def.legend.title}</option>
                            )
                        }
                    </select> :
                    title && <h4 className="h4">{title}</h4>
            }
            {
                elements.length > 0 &&
                <button className="expander-button btn btn-outline-secondary btn-sm" type="button" onClick={handleToggle} >
                    {
                        collapseList ?
                            <UpIcon /> :
                            <DownIcon />
                    }
                </button>
            }
            {
                description && <p>{description}</p>
            }
            {
                elements.length === 0 ?
                    (disclaimer ? <ul className={collapseList ? 'collapse data-legend' : 'data-legend'} ><p className='legend-disclaimer'>{disclaimer}</p></ul> : <p className="data-intro">Coming soon </p>) :
                    <ul className={collapseList ? 'collapse data-legend' : 'data-legend'} >
                        {
                            disclaimer && <p className='legend-disclaimer'>{disclaimer}</p>
                        }
                        {
                            elements.map((item) => {
                                let key: string,
                                    content: React.ReactElement;

                                if ('subtitle' in item) {
                                    key = item.subtitle;
                                    content = <h6>{item.subtitle}</h6>;
                                } else {
                                    key = `${item.text}-${item.color}`;
                                    content = <>
                                        <div className="key" style={{ background: item.color, border: item.border }} />
                                        {item.text}
                                    </>;
                                }
                                return (
                                    <li key={key}>
                                        {content}
                                    </li>
                                );
                            })
                        }
                    </ul>
            }
        </div>
    );
};