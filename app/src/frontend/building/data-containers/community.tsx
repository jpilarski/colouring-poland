import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import VerifiedField from '../data-components/verified-field';

const SocietyContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Percepcja i Estetyka" collapsed={false}>
                <VerifiedField slug="spoleczenstwo_bezpieczenstwo" control="slider" min={1} max={5} categoryProps={props} />
                <VerifiedField slug="spoleczenstwo_identyfikacja_miejsce" control="slider" min={1} max={5} categoryProps={props} />
                <VerifiedField slug="spoleczenstwo_percepcja_rozpoznawalnosc" control="slider" min={1} max={5} categoryProps={props} />
                <VerifiedField slug="spoleczenstwo_percepcja_obrazowosc" control="slider" min={1} max={5} categoryProps={props} />
                <VerifiedField slug="spoleczenstwo_percepcja_atrakcyjnosc" control="slider" min={1} max={5} categoryProps={props} />
                <VerifiedField slug="spoleczenstwo_percepcja_czytelnosc" control="slider" min={1} max={5} categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Społeczność" collapsed={false}>
                <VerifiedField slug="spoleczenstwo_inicjatywa_spoleczna" control="logical" categoryProps={props} />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(SocietyContainer);
