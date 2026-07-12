import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import SelectDataEntry from '../data-components/select-data-entry';
import { LogicalDataEntry } from '../data-components/logical-data-entry/logical-data-entry';
import Verification from '../data-components/verification';
import { dataFields } from '../../config/data-fields-config';

const PlanningContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <>
            <DataEntryGroup name="Krajobraz" collapsed={false}>
                <SelectDataEntry {...props} slug="planowanie_typ_krajobrazu" title={dataFields.planowanie_typ_krajobrazu.title} value={building.planowanie_typ_krajobrazu} options={dataFields.planowanie_typ_krajobrazu.items} />
                <Verification
                    slug="planowanie_typ_krajobrazu"
                    allow_verify={props.user !== undefined && props.building.planowanie_typ_krajobrazu !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("planowanie_typ_krajobrazu")}
                    user_verified_as={props.user_verified.planowanie_typ_krajobrazu}
                    verified_count={props.building.verified?.planowanie_typ_krajobrazu}
                />

                <LogicalDataEntry {...props} slug="planowanie_krajobraz_priorytetowy" title={dataFields.planowanie_krajobraz_priorytetowy.title} value={building.planowanie_krajobraz_priorytetowy} />
                <Verification
                    slug="planowanie_krajobraz_priorytetowy"
                    allow_verify={props.user !== undefined && props.building.planowanie_krajobraz_priorytetowy !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("planowanie_krajobraz_priorytetowy")}
                    user_verified_as={props.user_verified.planowanie_krajobraz_priorytetowy}
                    verified_count={props.building.verified?.planowanie_krajobraz_priorytetowy}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(PlanningContainer);