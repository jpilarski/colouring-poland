import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import SelectDataEntry from '../data-components/select-data-entry';
import NumericDataEntry from '../data-components/numeric-data-entry';
import { dataFields } from '../../config/data-fields-config';
import Verification from '../data-components/verification';

const UsageContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <>
            <DataEntryGroup name="Status" collapsed={false}>
                <SelectDataEntry
                    slug="uzytkowanie_status"
                    title={dataFields.uzytkowanie_status.title}
                    value={building.uzytkowanie_status}
                    options={dataFields.uzytkowanie_status.items}
                    {...props}
                />
                <Verification
                    slug="uzytkowanie_status"
                    allow_verify={props.user !== undefined && props.building.uzytkowanie_status !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("uzytkowanie_status")}
                    user_verified_as={props.user_verified.uzytkowanie_status}
                    verified_count={props.building.verified?.uzytkowanie_status}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Funkcje" collapsed={false}>
                <SelectDataEntry
                    slug="uzytkowanie_funkcja_ogolna"
                    title={dataFields.uzytkowanie_funkcja_ogolna.title}
                    value={building.uzytkowanie_funkcja_ogolna}
                    options={dataFields.uzytkowanie_funkcja_ogolna.items}
                    {...props}
                />
                <Verification
                    slug="uzytkowanie_funkcja_ogolna"
                    allow_verify={props.user !== undefined && props.building.uzytkowanie_funkcja_ogolna !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("uzytkowanie_funkcja_ogolna")}
                    user_verified_as={props.user_verified.uzytkowanie_funkcja_ogolna}
                    verified_count={props.building.verified?.uzytkowanie_funkcja_ogolna}
                />

                <NumericDataEntry
                    slug="uzytkowanie_funkcja_szczegolowa"
                    title={dataFields.uzytkowanie_funkcja_szczegolowa.title}
                    value={building.uzytkowanie_funkcja_szczegolowa}
                    {...props}
                />
                <Verification
                    slug="uzytkowanie_funkcja_szczegolowa"
                    allow_verify={props.user !== undefined && props.building.uzytkowanie_funkcja_szczegolowa !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("uzytkowanie_funkcja_szczegolowa")}
                    user_verified_as={props.user_verified.uzytkowanie_funkcja_szczegolowa}
                    verified_count={props.building.verified?.uzytkowanie_funkcja_szczegolowa}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(UsageContainer);