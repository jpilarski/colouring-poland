import React, { useState, useEffect, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { dataExtractsApi } from '../../api';
import type { ExtractViewModel } from '../../api';

export const DataExtracts: React.FC = () => {
    const [extracts, setExtracts] = useState<ExtractViewModel[] | undefined>(undefined);
    const [latestExtract, setLatestExtract] = useState<ExtractViewModel | undefined>(undefined);
    const [previousExtracts, setPreviousExtracts] = useState<ExtractViewModel[] | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;
        const loadExtracts = async () => {
            try {
                const data = await dataExtractsApi.getExtracts();
                if (!isMounted) return;
                const items = data.extracts;
                setExtracts(items);
                setLatestExtract(items[0]);
                setPreviousExtracts(items.slice(1));
            } catch (err) {
                console.error('Failed to load extracts:', err);
                if (!isMounted) return;
                setExtracts([]);
                setLatestExtract(undefined);
                setPreviousExtracts([]);
            }
        };

        loadExtracts();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <article>
            <section className="main-col">
                <h1 className="h2">Open data extracts</h1>
                <p>
                    Choose one of the links below to download an archive containing the open data collected on the Colouring Cities platform
                </p>
                <p>
                    Colouring Cities contributions are open data, licensed under the <a href="http://opendatacommons.org/licenses/odbl/">Open Data Commons Open Database License</a> (ODbL) by Colouring Cities contributors.
                </p>
                <p>
                    You are free to copy, distribute, transmit and adapt our data, as long as you credit Colouring Cities and our contributors. If you alter or build upon our data, you may distribute the result only under the same licence.
                </p>
                <p>
                    Choose one of the links below to download an archive containing the open data collected on the Colouring Cities platform.
                </p>
                <p>
                    By downloading data extracts from this site, you agree to the <Link to="/data-accuracy.html">data accuracy agreement</Link>.
                </p>
                <p>
                    Please note that certain datasets including building footprint geometries are not currently included as we are still undertaking assessment of these. Improvements to the download section will be made over the next six months.
                </p>

                {extracts === undefined ? (
                    <p>Loading extracts...</p>
                ) : extracts.length === 0 ? (
                    <p>No extracts available</p>
                ) : null}

                {latestExtract !== undefined ? (
                    <div>
                        <h1 className="h3">Latest extract</h1>
                        <ExtractDownloadLink {...latestExtract} />
                    </div>
                ) : null}

                {previousExtracts && previousExtracts.length > 0 ? (
                    <div>
                        <h1 className="h3">Older extracts</h1>
                        <ul>
                            {previousExtracts.map((e) => (
                                <li key={e.extract_id}>
                                    <ExtractDownloadLink {...e} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </section>
        </article>
    );
};

const ExtractDownloadLink: FunctionComponent<ExtractViewModel> = (props) => (
    <p><a href={props.download_path}>Extracted on {props.extracted_on.toDateString()}</a></p>
);

export default DataExtracts;
