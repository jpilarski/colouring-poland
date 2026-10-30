import React, { useEffect } from 'react';
import withCopyEdit from '../components/data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../inputs/data-entry-group';
import { VerifiedField } from '../inputs/verified-field';

const ConstructionContainer: React.FunctionComponent<CategoryViewProps> = (props) => {
    const { building, onChange, edited } = props;

    // TRIGGER NA TYP DACHU - ZAWSZE ZALEŻNY OD KĄTA NACHYLENIA
    useEffect(() => {
        if (!edited || !onChange) return;

        const kat = building.konstrukcja_detal_forma_nachylenie_dachu;

        if (kat === null || kat === undefined) {
            // Jeśli wyczyścimy kąt, bezwarunkowo zerujemy typ dachu
            if (building.konstrukcja_detal_forma_typ_dachu !== null) {
                onChange('konstrukcja_detal_forma_typ_dachu', null);
            }
        } else {
            const numericKat = Number(kat);
            if (!isNaN(numericKat)) {
                if (numericKat < 5) {
                    // Mniej niż 5 stopni -> 'Dach płaski'
                    if (building.konstrukcja_detal_forma_typ_dachu !== 'Dach płaski') {
                        onChange('konstrukcja_detal_forma_typ_dachu', 'Dach płaski');
                    }
                } else if (numericKat >= 5) {
                    // Więcej lub równe 5 stopni -> 'Dach skośny'
                    if (building.konstrukcja_detal_forma_typ_dachu !== 'Dach skośny') {
                        onChange('konstrukcja_detal_forma_typ_dachu', 'Dach skośny');
                    }
                }
            }
        }
    }, [building.konstrukcja_detal_forma_nachylenie_dachu, building.konstrukcja_detal_forma_typ_dachu, edited, onChange]);

    return (
        <>
            <DataEntryGroup name="Materiały" collapsed={false}>
                <VerifiedField slug="konstrukcja_detal_forma_material_elewacji" categoryProps={props} />
                <VerifiedField slug="konstrukcja_detal_forma_material_dachu" categoryProps={props} />
                <VerifiedField slug="konstrukcja_detal_forma_material_okien" categoryProps={props} />
                <VerifiedField slug="konstrukcja_detal_forma_material_drzwi" categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Konfiguracja Dachu" collapsed={false}>
                {/* POLE ZAWSZE ZABLOKOWANE: disabled={true} hardcodowane żeby uniknąć nadpisywania z props */}
                <VerifiedField slug="konstrukcja_detal_forma_typ_dachu" categoryProps={props} disabled={true} />
                <VerifiedField
                    slug="konstrukcja_detal_forma_nachylenie_dachu"
                    categoryProps={props}
                    control="numeric"
                    min={0}
                    max={90}
                    step={0.1}
                />
                <VerifiedField
                    slug="konstrukcja_detal_forma_kolor_dachu_rgb"
                    categoryProps={props}
                    control="pattern"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#RRGGBB"
                />
            </DataEntryGroup>

            <DataEntryGroup name="Drzwi i Okna" collapsed={false}>
                <VerifiedField slug="konstrukcja_detal_forma_obramowanie_okien" categoryProps={props} />
                <VerifiedField slug="konstrukcja_detal_forma_okiennice" categoryProps={props} control="logical" />
                <VerifiedField slug="konstrukcja_detal_forma_ksztalt_drzwi" categoryProps={props} />
                <VerifiedField slug="konstrukcja_detal_forma_portal" categoryProps={props} control="logical" />
                <VerifiedField slug="konstrukcja_detal_forma_brama" categoryProps={props} />
            </DataEntryGroup>

            <DataEntryGroup name="Detale Architektoniczne" collapsed={false}>
                <VerifiedField slug="konstrukcja_detal_forma_detale" categoryProps={props} control="multi-select" />
                <VerifiedField slug="konstrukcja_detal_forma_okapnik" categoryProps={props} control="logical" />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(ConstructionContainer);
