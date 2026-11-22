import React, { useEffect, useState } from 'react';

import './edit-history.css';

import { apiGet } from '../../../api';
import { Building } from '../../../models/building';
import { EditHistoryEntry } from '../../../models/edit-history-entry';
import ContainerHeader from '../components/container-header';

import { BuildingEditSummary } from './building-edit-summary';

interface EditHistoryProps {
    building: Building;
}

const EditHistory: React.FunctionComponent<EditHistoryProps> = (props) => {
    const [history, setHistory] = useState<EditHistoryEntry[] | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const data = await apiGet(`/api/buildings/${props.building.lokalizacja_id_budynku}/history.json`);
                if (!isMounted) return;
                setHistory(Array.isArray(data?.history) ? data.history : []);
            } catch (err) {
                console.error(err);
                if (isMounted) setHistory([]);
            }
        };

        if (props.building != undefined) {
            fetchData();
        }
        return () => {
            isMounted = false;
        };
    }, [props.building]);

    return (
        <>
            <ContainerHeader title="Edit history" backLink='.' cat='edit-history' />

            <ul className="edit-history-list">
                {Array.isArray(history) && history.map(entry => (
                    <li key={`${entry.revision_id}`} className="edit-history-list-element">
                        <BuildingEditSummary historyEntry={entry} />
                    </li>
                ))}
            </ul>
        </>
    );
};

export {
    EditHistory
};
