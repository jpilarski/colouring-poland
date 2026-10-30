import React from 'react';
import withCopyEdit from '../components/data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../inputs/data-entry-group';
import VerifiedField from '../inputs/verified-field';

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
