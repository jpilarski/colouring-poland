import React from 'react';
import { CategoryViewProps } from './category-view-props';
import withCopyEdit from '../data-container';
import { DataEntryGroup } from '../data-components/data-entry-group';
import VerifiedField from '../data-components/verified-field';

const LocationView: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Identyfikacja" collapsed={false}>
                <VerifiedField slug="lokalizacja_id_gml" control="text" categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Współrzędne" collapsed={false}>
                <VerifiedField slug="lokalizacja_lat" control="numeric" step={0.00001} min={-90} max={90} categoryProps={props} />
                <VerifiedField slug="lokalizacja_lon" control="numeric" step={0.00001} min={-180} max={180} categoryProps={props} />
                <VerifiedField slug="lokalizacja_crs" control="text" categoryProps={props} />
                <VerifiedField slug="lokalizacja_wysokosc_npm" control="numeric" categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Adres" collapsed={false}>
                <VerifiedField slug="lokalizacja_ulica" control="text" categoryProps={props} />
                <VerifiedField slug="lokalizacja_numer" control="text" categoryProps={props} />
                <VerifiedField slug="lokalizacja_kod_pocztowy" control="text" categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

const LocationContainer = withCopyEdit(LocationView);

export default LocationContainer;
