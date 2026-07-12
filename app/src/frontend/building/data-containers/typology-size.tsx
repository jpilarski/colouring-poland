import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import DataEntry from '../data-components/data-entry';
import SelectDataEntry from '../data-components/select-data-entry';
import NumericDataEntry from '../data-components/numeric-data-entry';
import { LogicalDataEntry } from '../data-components/logical-data-entry/logical-data-entry';
import SliderDataEntry from '../data-components/slider-data-entry';
import { dataFields } from '../../config/data-fields-config';
import Verification from '../data-components/verification';

const TypologyContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <>
            <DataEntryGroup name="Układ Urbanistyczny" collapsed={false}>
                <SelectDataEntry
                    slug="typologia_uklad_zabudowy"
                    title={dataFields.typologia_uklad_zabudowy.title}
                    value={building.typologia_uklad_zabudowy}
                    options={dataFields.typologia_uklad_zabudowy.items}
                    {...props}
                />
                <Verification
                    slug="typologia_uklad_zabudowy"
                    allow_verify={props.user !== undefined && props.building.typologia_uklad_zabudowy !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_uklad_zabudowy")}
                    user_verified_as={props.user_verified.typologia_uklad_zabudowy}
                    verified_count={props.building.verified?.typologia_uklad_zabudowy}
                />

                <SelectDataEntry
                    slug="typologia_intensywnosc"
                    title={dataFields.typologia_intensywnosc.title}
                    value={building.typologia_intensywnosc}
                    options={dataFields.typologia_intensywnosc.items}
                    {...props}
                />
                <Verification
                    slug="typologia_intensywnosc"
                    allow_verify={props.user !== undefined && props.building.typologia_intensywnosc !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_intensywnosc")}
                    user_verified_as={props.user_verified.typologia_intensywnosc}
                    verified_count={props.building.verified?.typologia_intensywnosc}
                />

                <DataEntry
                    slug="typologia_typ_zabudowy"
                    title={dataFields.typologia_typ_zabudowy.title}
                    value={building.typologia_typ_zabudowy}
                    {...props}
                />
                <Verification
                    slug="typologia_typ_zabudowy"
                    allow_verify={props.user !== undefined && props.building.typologia_typ_zabudowy !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_typ_zabudowy")}
                    user_verified_as={props.user_verified.typologia_typ_zabudowy}
                    verified_count={props.building.verified?.typologia_typ_zabudowy}
                />

                <NumericDataEntry
                    slug="typologia_zwartosc_zabudowy"
                    title={dataFields.typologia_zwartosc_zabudowy.title}
                    value={building.typologia_zwartosc_zabudowy}
                    {...props}
                />
                <Verification
                    slug="typologia_zwartosc_zabudowy"
                    allow_verify={props.user !== undefined && props.building.typologia_zwartosc_zabudowy !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_zwartosc_zabudowy")}
                    user_verified_as={props.user_verified.typologia_zwartosc_zabudowy}
                    verified_count={props.building.verified?.typologia_zwartosc_zabudowy}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Wymiary i Forma" collapsed={false}>
                <NumericDataEntry
                    slug="typologia_ilosc_kondygnacji"
                    title={dataFields.typologia_ilosc_kondygnacji.title}
                    value={building.typologia_ilosc_kondygnacji}
                    min={1}
                    step={1}
                    {...props}
                />
                <Verification
                    slug="typologia_ilosc_kondygnacji"
                    allow_verify={props.user !== undefined && props.building.typologia_ilosc_kondygnacji !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_ilosc_kondygnacji")}
                    user_verified_as={props.user_verified.typologia_ilosc_kondygnacji}
                    verified_count={props.building.verified?.typologia_ilosc_kondygnacji}
                />

                <NumericDataEntry
                    slug="typologia_wysokosc_maksymalna"
                    title={dataFields.typologia_wysokosc_maksymalna.title}
                    value={building.typologia_wysokosc_maksymalna}
                    min={0}
                    step={0.1}
                    {...props}
                />
                <Verification
                    slug="typologia_wysokosc_maksymalna"
                    allow_verify={props.user !== undefined && props.building.typologia_wysokosc_maksymalna !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_wysokosc_maksymalna")}
                    user_verified_as={props.user_verified.typologia_wysokosc_maksymalna}
                    verified_count={props.building.verified?.typologia_wysokosc_maksymalna}
                />

                <NumericDataEntry
                    slug="typologia_powierzchnia_parteru"
                    title={dataFields.typologia_powierzchnia_parteru.title}
                    value={building.typologia_powierzchnia_parteru}
                    min={0}
                    step={0.01}
                    {...props}
                />
                <Verification
                    slug="typologia_powierzchnia_parteru"
                    allow_verify={props.user !== undefined && props.building.typologia_powierzchnia_parteru !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_powierzchnia_parteru")}
                    user_verified_as={props.user_verified.typologia_powierzchnia_parteru}
                    verified_count={props.building.verified?.typologia_powierzchnia_parteru}
                />

                <NumericDataEntry
                    slug="typologia_kat_srodkowy"
                    title={dataFields.typologia_kat_srodkowy.title}
                    value={building.typologia_kat_srodkowy}
                    min={0}
                    max={90}
                    step={0.1}
                    {...props}
                />
                <Verification
                    slug="typologia_kat_srodkowy"
                    allow_verify={props.user !== undefined && props.building.typologia_kat_srodkowy !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_kat_srodkowy")}
                    user_verified_as={props.user_verified.typologia_kat_srodkowy}
                    verified_count={props.building.verified?.typologia_kat_srodkowy}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Dominanta i Parter" collapsed={false}>
                <LogicalDataEntry
                    slug="typologia_dominanta"
                    title={dataFields.typologia_dominanta.title}
                    value={building.typologia_dominanta}
                    {...props}
                />
                <Verification
                    slug="typologia_dominanta"
                    allow_verify={props.user !== undefined && props.building.typologia_dominanta !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_dominanta")}
                    user_verified_as={props.user_verified.typologia_dominanta}
                    verified_count={props.building.verified?.typologia_dominanta}
                />

                <SelectDataEntry
                    slug="typologia_rodzaj_dominanty"
                    title={dataFields.typologia_rodzaj_dominanty.title}
                    value={building.typologia_rodzaj_dominanty}
                    options={dataFields.typologia_rodzaj_dominanty.items}
                    {...props}
                />
                <Verification
                    slug="typologia_rodzaj_dominanty"
                    allow_verify={props.user !== undefined && props.building.typologia_rodzaj_dominanty !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_rodzaj_dominanty")}
                    user_verified_as={props.user_verified.typologia_rodzaj_dominanty}
                    verified_count={props.building.verified?.typologia_rodzaj_dominanty}
                />

                <SliderDataEntry
                    slug="typologia_aktywny_parter"
                    title={dataFields.typologia_aktywny_parter.title}
                    value={building.typologia_aktywny_parter}
                    min={1}
                    max={5}
                    dots={true}
                    {...props}
                />
                <Verification
                    slug="typologia_aktywny_parter"
                    allow_verify={props.user !== undefined && props.building.typologia_aktywny_parter !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("typologia_aktywny_parter")}
                    user_verified_as={props.user_verified.typologia_aktywny_parter}
                    verified_count={props.building.verified?.typologia_aktywny_parter}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(TypologyContainer);