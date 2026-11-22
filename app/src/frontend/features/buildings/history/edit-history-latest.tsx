import React, { useEffect, useState } from 'react';

import './edit-history.css';

import { apiGet } from '../../../api';
import { Building } from '../../../models/building';
import { EditHistoryEntry } from '../../../models/edit-history-entry';
import ContainerHeader from '../components/container-header';

import { BuildingEditLatest } from './building-edit-latest';

interface EditHistoryLatestProps {
    building?: Building;
}

const EditHistoryLatest: React.FunctionComponent<EditHistoryLatestProps> = (props) => {
    const [history, setHistory] = useState<EditHistoryEntry[] | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async (building: Building) => {
            try {
                const data = await apiGet(`/api/buildings/${building.lokalizacja_id_budynku}/history.json`);
                if (!isMounted) return;
                setHistory(Array.isArray(data?.history) ? data.history : []);
            } catch (err) {
                console.error(err);
                if (isMounted) setHistory([]);
            }
        };

        if (props.building != undefined) {
            fetchData(props.building);
        }
        return () => {
            isMounted = false;
        };
    }, [props.building]);

    return (
        <>
            <ul className="edit-history-first" id="first-only">
                {Array.isArray(history) && history.map(entry => (
                    <li key={`${entry.revision_id}`} className="edit-history-list-element">
                        <BuildingEditLatest historyEntry={entry} />
                    </li>
                ))}
            </ul>
        </>
    );
};

export {
    EditHistoryLatest
};
