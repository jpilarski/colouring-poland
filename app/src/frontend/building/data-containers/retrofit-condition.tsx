import React from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import VerifiedField from '../data-components/verified-field';

const AdaptabilityContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <>
            <DataEntryGroup name="Dostępność" collapsed={false}>
                <VerifiedField
                    slug="zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni"
                    control="logical"
                    categoryProps={props}
                />
                <VerifiedField
                    slug="zrownowazona_adaptacyjnosc_bariery_architektoniczne"
                    control="multi-select"
                    categoryProps={props}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Komunikacja Miejska" collapsed={false}>
                <VerifiedField
                    slug="zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc"
                    control="numeric"
                    min={0}
                    step={1}
                    categoryProps={props}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(AdaptabilityContainer);
