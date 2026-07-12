import React, { Fragment } from 'react';
import { CategoryViewProps } from './category-view-props';
import withCopyEdit from '../data-container';
import { DataEntryGroup } from '../data-components/data-entry-group';
import DataEntry from '../data-components/data-entry';
import NumericDataEntry from '../data-components/numeric-data-entry';
import { dataFields } from '../../config/data-fields-config';
import Verification from '../data-components/verification';

const LocationView: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building } = props;
    return (
        <Fragment>
            <DataEntryGroup name="Identyfikacja" collapsed={false}>
                <DataEntry
                    slug="lokalizacja_id_gml"
                    title={dataFields.lokalizacja_id_gml.title}
                    value={building.lokalizacja_id_gml}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_id_gml"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_id_gml !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_id_gml")}
                    user_verified_as={props.user_verified.lokalizacja_id_gml}
                    verified_count={props.building.verified?.lokalizacja_id_gml}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Współrzędne" collapsed={false}>
                <NumericDataEntry
                    slug="lokalizacja_lat"
                    title={dataFields.lokalizacja_lat.title}
                    value={building.lokalizacja_lat}
                    step={0.00001}
                    min={-90}
                    max={90}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_lat"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_lat !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_lat")}
                    user_verified_as={props.user_verified.lokalizacja_lat}
                    verified_count={props.building.verified?.lokalizacja_lat}
                />

                <NumericDataEntry
                    slug="lokalizacja_lon"
                    title={dataFields.lokalizacja_lon.title}
                    value={building.lokalizacja_lon}
                    step={0.00001}
                    min={-180}
                    max={180}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_lon"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_lon !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_lon")}
                    user_verified_as={props.user_verified.lokalizacja_lon}
                    verified_count={props.building.verified?.lokalizacja_lon}
                />

                <DataEntry
                    slug="lokalizacja_crs"
                    title={dataFields.lokalizacja_crs.title}
                    value={building.lokalizacja_crs}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_crs"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_crs !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_crs")}
                    user_verified_as={props.user_verified.lokalizacja_crs}
                    verified_count={props.building.verified?.lokalizacja_crs}
                />

                <NumericDataEntry
                    slug="lokalizacja_wysokosc_npm"
                    title={dataFields.lokalizacja_wysokosc_npm.title}
                    value={building.lokalizacja_wysokosc_npm}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_wysokosc_npm"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_wysokosc_npm !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_wysokosc_npm")}
                    user_verified_as={props.user_verified.lokalizacja_wysokosc_npm}
                    verified_count={props.building.verified?.lokalizacja_wysokosc_npm}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Adres" collapsed={false}>
                <DataEntry
                    slug="lokalizacja_ulica"
                    title={dataFields.lokalizacja_ulica.title}
                    value={building.lokalizacja_ulica}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_ulica"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_ulica !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_ulica")}
                    user_verified_as={props.user_verified.lokalizacja_ulica}
                    verified_count={props.building.verified?.lokalizacja_ulica}
                />

                <DataEntry
                    slug="lokalizacja_numer"
                    title={dataFields.lokalizacja_numer.title}
                    value={building.lokalizacja_numer}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_numer"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_numer !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_numer")}
                    user_verified_as={props.user_verified.lokalizacja_numer}
                    verified_count={props.building.verified?.lokalizacja_numer}
                />

                <DataEntry
                    slug="lokalizacja_kod_pocztowy"
                    title={dataFields.lokalizacja_kod_pocztowy.title}
                    value={building.lokalizacja_kod_pocztowy}
                    {...props}
                />
                <Verification
                    slug="lokalizacja_kod_pocztowy"
                    allow_verify={props.user !== undefined && props.building.lokalizacja_kod_pocztowy !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("lokalizacja_kod_pocztowy")}
                    user_verified_as={props.user_verified.lokalizacja_kod_pocztowy}
                    verified_count={props.building.verified?.lokalizacja_kod_pocztowy}
                />
            </DataEntryGroup>
        </Fragment>
    );
};

const LocationContainer = withCopyEdit(LocationView);

export default LocationContainer;