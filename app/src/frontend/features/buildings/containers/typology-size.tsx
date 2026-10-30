import React from 'react';
import withCopyEdit from '../components/data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../inputs/data-entry-group';
import VerifiedField from '../inputs/verified-field';

const TypologyContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Układ Urbanistyczny" collapsed={false}>
                <VerifiedField slug="typologia_uklad_zabudowy" control="select" categoryProps={props} />
                <VerifiedField slug="typologia_intensywnosc" control="select" categoryProps={props} />
                <VerifiedField slug="typologia_typ_zabudowy" control="text" categoryProps={props} />
                <VerifiedField slug="typologia_zwartosc_zabudowy" control="numeric" categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Wymiary i Forma" collapsed={false}>
                <VerifiedField slug="typologia_ilosc_kondygnacji" control="numeric" min={1} step={1} categoryProps={props} />
                <VerifiedField slug="typologia_wysokosc_maksymalna" control="numeric" min={0} step={0.1} categoryProps={props} />
                <VerifiedField slug="typologia_powierzchnia_parteru" control="numeric" min={0} step={0.01} categoryProps={props} />
                <VerifiedField slug="typologia_kat_srodkowy" control="numeric" min={0} max={90} step={0.1} categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Dominanta i Parter" collapsed={false}>
                <VerifiedField slug="typologia_dominanta" control="logical" categoryProps={props} />
                <VerifiedField slug="typologia_rodzaj_dominanty" control="select" categoryProps={props} />
                <VerifiedField slug="typologia_aktywny_parter" control="slider" min={1} max={5} categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(TypologyContainer);
