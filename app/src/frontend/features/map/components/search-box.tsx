import { Point } from 'geojson';
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from 'react';

import './search-box.css';

import { apiGet } from '../../../api';
import { SearchIcon } from '../../../components/icons';

export interface SearchResult {
    type: string;
    attributes: {
        label: string;
        zoom: number;
    };
    geometry: Point;
}

export interface SearchBoxProps {
    onLocate: (lat: number, lng: number, zoom: number) => void;
}

/**
 * Search for location
 */
export const SearchBox: React.FC<SearchBoxProps> = ({ onLocate }) => {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [fetching, setFetching] = useState(false);
    const [collapsedSearch, setCollapsedSearch] = useState(true);
    const [smallScreen, setSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                setSmallScreen(window.innerWidth < 990);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const clearResults = useCallback(() => {
        setResults([]);
    }, []);

    const clearQuery = useCallback(() => {
        setQ('');
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const targetValue = e.target.value;
        setQ(targetValue);

        if (targetValue === '' || !q.startsWith(targetValue)) {
            clearResults();
        }
    }, [clearResults, q]);

    const handleKeyPress = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            clearQuery();
            clearResults();
        }
    }, [clearQuery, clearResults]);

    const expandSearch = useCallback(() => {
        setCollapsedSearch(prev => !prev);
    }, []);

    const search = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setFetching(true);

        try {
            const data = await apiGet(`/api/search?q=${encodeURIComponent(q)}`);
            if (data && data.results && data.results.length > 0) {
                onLocate(
                    data.results[0].geometry.coordinates[1],
                    data.results[0].geometry.coordinates[0],
                    data.results[0].attributes.zoom
                );
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setFetching(false);
        }
    }, [onLocate, q]);

    if (collapsedSearch && smallScreen) {
        return (
            <div className="search-box">
                <div className="search-box-pane">
                    <div className="collapse-btn active" onClick={expandSearch}>
                        <SearchIcon />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="search-box" onKeyDown={handleKeyPress}>
            <div className="search-box-pane">
                <div
                    className={`collapse-btn ${smallScreen ? 'active' : ''}`}
                    onClick={smallScreen ? expandSearch : undefined}
                >
                    <SearchIcon />
                </div>
                <form onSubmit={search} className="form-inline d-flex flex-nowrap">
                    <input
                        className="form-control"
                        type="search"
                        id="search-box-q"
                        name="q"
                        value={q}
                        placeholder="Type a postcode or a place name..."
                        aria-label="Type a postcode or a place name..."
                        onChange={handleChange}
                        maxLength={28}
                    />
                    <button className="search-btn btn btn-outline-dark" type="submit" disabled={fetching}>
                        Search
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SearchBox;
