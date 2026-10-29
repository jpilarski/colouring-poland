import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import VerifiedField from '../data-components/verified-field';

const PlanningContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Krajobraz" collapsed={false}>
                <VerifiedField slug="planowanie_typ_krajobrazu" control="select" categoryProps={props} />
                <VerifiedField slug="planowanie_krajobraz_priorytetowy" control="logical" categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(PlanningContainer);
