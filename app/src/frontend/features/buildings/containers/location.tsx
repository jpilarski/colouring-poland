import React from 'react';
import { CategoryViewProps } from './category-view-props';
import withCopyEdit from '../components/data-container';
import { DataEntryGroup } from '../inputs/data-entry-group';
import VerifiedField from '../inputs/verified-field';

const LocationView: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Identyfikacja" collapsed={false}>
                <VerifiedField slug="lokalizacja_id_gml" control="text" disabled={true} categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Współrzędne" collapsed={false}>
                <VerifiedField slug="lokalizacja_lat" control="numeric" step={0.00001} min={-90} max={90} disabled={true} categoryProps={props} />
                <VerifiedField slug="lokalizacja_lon" control="numeric" step={0.00001} min={-180} max={180} disabled={true} categoryProps={props} />
                <VerifiedField slug="lokalizacja_crs" control="text" disabled={true} categoryProps={props} />
                <VerifiedField slug="lokalizacja_wysokosc_npm" control="numeric" disabled={true} categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Adres" collapsed={false}>
                <VerifiedField slug="lokalizacja_ulica" control="text" disabled={true} categoryProps={props} />
                <VerifiedField slug="lokalizacja_numer" control="text" disabled={true} categoryProps={props} />
                <VerifiedField slug="lokalizacja_kod_pocztowy" control="text" disabled={true} categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

const LocationContainer = withCopyEdit(LocationView);

export default LocationContainer;
