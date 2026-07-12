import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import SliderDataEntry from '../data-components/slider-data-entry';
import { LogicalDataEntry } from '../data-components/logical-data-entry/logical-data-entry';
import Verification from '../data-components/verification';
import { dataFields } from '../../config/data-fields-config';

const SocietyContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <>
            <DataEntryGroup name="Percepcja i Estetyka" collapsed={false}>
                <SliderDataEntry
                    {...props}
                    slug="spoleczenstwo_bezpieczenstwo"
                    title={dataFields.spoleczenstwo_bezpieczenstwo.title}
                    value={building.spoleczenstwo_bezpieczenstwo}
                    min={1}
                    max={5}
                    dots={true}
                />
                <Verification
                    slug="spoleczenstwo_bezpieczenstwo"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_bezpieczenstwo !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_bezpieczenstwo")}
                    user_verified_as={props.user_verified.spoleczenstwo_bezpieczenstwo}
                    verified_count={props.building.verified?.spoleczenstwo_bezpieczenstwo}
                />

                <SliderDataEntry
                    {...props}
                    slug="spoleczenstwo_identyfikacja_miejsce"
                    title={dataFields.spoleczenstwo_identyfikacja_miejsce.title}
                    value={building.spoleczenstwo_identyfikacja_miejsce}
                    min={1}
                    max={5}
                    dots={true}
                />
                <Verification
                    slug="spoleczenstwo_identyfikacja_miejsce"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_identyfikacja_miejsce !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_identyfikacja_miejsce")}
                    user_verified_as={props.user_verified.spoleczenstwo_identyfikacja_miejsce}
                    verified_count={props.building.verified?.spoleczenstwo_identyfikacja_miejsce}
                />

                <SliderDataEntry
                    {...props}
                    slug="spoleczenstwo_percepcja_rozpoznawalnosc"
                    title={dataFields.spoleczenstwo_percepcja_rozpoznawalnosc.title}
                    value={building.spoleczenstwo_percepcja_rozpoznawalnosc}
                    min={1}
                    max={5}
                    dots={true}
                />
                <Verification
                    slug="spoleczenstwo_percepcja_rozpoznawalnosc"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_percepcja_rozpoznawalnosc !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_percepcja_rozpoznawalnosc")}
                    user_verified_as={props.user_verified.spoleczenstwo_percepcja_rozpoznawalnosc}
                    verified_count={props.building.verified?.spoleczenstwo_percepcja_rozpoznawalnosc}
                />

                <SliderDataEntry
                    {...props}
                    slug="spoleczenstwo_percepcja_obrazowosc"
                    title={dataFields.spoleczenstwo_percepcja_obrazowosc.title}
                    value={building.spoleczenstwo_percepcja_obrazowosc}
                    min={1}
                    max={5}
                    dots={true}
                />
                <Verification
                    slug="spoleczenstwo_percepcja_obrazowosc"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_percepcja_obrazowosc !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_percepcja_obrazowosc")}
                    user_verified_as={props.user_verified.spoleczenstwo_percepcja_obrazowosc}
                    verified_count={props.building.verified?.spoleczenstwo_percepcja_obrazowosc}
                />

                <SliderDataEntry
                    {...props}
                    slug="spoleczenstwo_percepcja_atrakcyjnosc"
                    title={dataFields.spoleczenstwo_percepcja_atrakcyjnosc.title}
                    value={building.spoleczenstwo_percepcja_atrakcyjnosc}
                    min={1}
                    max={5}
                    dots={true}
                />
                <Verification
                    slug="spoleczenstwo_percepcja_atrakcyjnosc"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_percepcja_atrakcyjnosc !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_percepcja_atrakcyjnosc")}
                    user_verified_as={props.user_verified.spoleczenstwo_percepcja_atrakcyjnosc}
                    verified_count={props.building.verified?.spoleczenstwo_percepcja_atrakcyjnosc}
                />

                <SliderDataEntry
                    {...props}
                    slug="spoleczenstwo_percepcja_czytelnosc"
                    title={dataFields.spoleczenstwo_percepcja_czytelnosc.title}
                    value={building.spoleczenstwo_percepcja_czytelnosc}
                    min={1}
                    max={5}
                    dots={true}
                />
                <Verification
                    slug="spoleczenstwo_percepcja_czytelnosc"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_percepcja_czytelnosc !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_percepcja_czytelnosc")}
                    user_verified_as={props.user_verified.spoleczenstwo_percepcja_czytelnosc}
                    verified_count={props.building.verified?.spoleczenstwo_percepcja_czytelnosc}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Społeczność" collapsed={false}>
                <LogicalDataEntry
                    {...props}
                    slug="spoleczenstwo_inicjatywa_spoleczna"
                    title={dataFields.spoleczenstwo_inicjatywa_spoleczna.title}
                    value={building.spoleczenstwo_inicjatywa_spoleczna}
                />
                <Verification
                    slug="spoleczenstwo_inicjatywa_spoleczna"
                    allow_verify={props.user !== undefined && props.building.spoleczenstwo_inicjatywa_spoleczna !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("spoleczenstwo_inicjatywa_spoleczna")}
                    user_verified_as={props.user_verified.spoleczenstwo_inicjatywa_spoleczna}
                    verified_count={props.building.verified?.spoleczenstwo_inicjatywa_spoleczna}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(SocietyContainer);