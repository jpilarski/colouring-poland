import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import { LogicalDataEntry } from '../data-components/logical-data-entry/logical-data-entry';
import { MultiSelectDataEntry } from '../data-components/multi-select-data-entry';
import NumericDataEntry from '../data-components/numeric-data-entry';
import Verification from '../data-components/verification';
import { dataFields } from '../../config/data-fields-config';

const AdaptabilityContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <>
            <DataEntryGroup name="Dostępność" collapsed={false}>
                <LogicalDataEntry
                    {...props}
                    slug="zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni"
                    title={dataFields.zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni.title}
                    value={building.zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni}
                />
                <Verification
                    slug="zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni"
                    allow_verify={props.user !== undefined && props.building.zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni")}
                    user_verified_as={props.user_verified.zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni}
                    verified_count={props.building.verified?.zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni}
                />

                <MultiSelectDataEntry
                    {...props}
                    slug="zrownowazona_adaptacyjnosc_bariery_architektoniczne"
                    title={dataFields.zrownowazona_adaptacyjnosc_bariery_architektoniczne.title}
                    value={building.zrownowazona_adaptacyjnosc_bariery_architektoniczne}
                    options={dataFields.zrownowazona_adaptacyjnosc_bariery_architektoniczne.items}
                />
                <Verification
                    slug="zrownowazona_adaptacyjnosc_bariery_architektoniczne"
                    allow_verify={props.user !== undefined && props.building.zrownowazona_adaptacyjnosc_bariery_architektoniczne !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("zrownowazona_adaptacyjnosc_bariery_architektoniczne")}
                    user_verified_as={props.user_verified.zrownowazona_adaptacyjnosc_bariery_architektoniczne}
                    verified_count={props.building.verified?.zrownowazona_adaptacyjnosc_bariery_architektoniczne}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Komunikacja Miejska" collapsed={false}>
                <NumericDataEntry
                    {...props}
                    slug="zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc"
                    title={dataFields.zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc.title}
                    value={building.zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc}
                    min={0}
                    step={1}
                />
                <Verification
                    slug="zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc"
                    allow_verify={props.user !== undefined && props.building.zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc")}
                    user_verified_as={props.user_verified.zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc}
                    verified_count={props.building.verified?.zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(AdaptabilityContainer);