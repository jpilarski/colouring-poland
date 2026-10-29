import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import VerifiedField from '../data-components/verified-field';

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
