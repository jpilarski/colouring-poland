import React from 'react';
import withCopyEdit from '../components/data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../inputs/data-entry-group';
import VerifiedField from '../inputs/verified-field';

const HistoryContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Okres Historyczny" collapsed={false}>
                <VerifiedField slug="historia_okres" control="select" categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(HistoryContainer);
