import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import SelectDataEntry from '../data-components/select-data-entry';
import Verification from '../data-components/verification';
import { dataFields } from '../../config/data-fields-config';

const HistoryContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <>
            <DataEntryGroup name="Okres Historyczny" collapsed={false}>
                <SelectDataEntry
                    {...props}
                    slug="historia_okres"
                    title={dataFields.historia_okres.title}
                    value={building.historia_okres}
                    options={dataFields.historia_okres.items}
                />
                <Verification
                    slug="historia_okres"
                    allow_verify={props.user !== undefined && props.building.historia_okres !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("historia_okres")}
                    user_verified_as={props.user_verified.historia_okres}
                    verified_count={props.building.verified?.historia_okres}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(HistoryContainer);