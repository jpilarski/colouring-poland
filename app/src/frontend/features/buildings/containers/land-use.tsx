import React from 'react';
import withCopyEdit from '../components/data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../inputs/data-entry-group';
import VerifiedField from '../inputs/verified-field';

const UsageContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Status" collapsed={false}>
                <VerifiedField slug="uzytkowanie_status" control="select" categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Funkcje" collapsed={false}>
                <VerifiedField slug="uzytkowanie_funkcja_ogolna" control="select" categoryProps={props} />
                <VerifiedField slug="uzytkowanie_funkcja_szczegolowa" control="numeric" categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(UsageContainer);
