import React, { useEffect } from 'react';
import withCopyEdit from '../data-container';
import { CategoryViewProps } from './category-view-props';
import { DataEntryGroup } from '../data-components/data-entry-group';
import SelectDataEntry from '../data-components/select-data-entry';
import NumericDataEntry from '../data-components/numeric-data-entry';
import { LogicalDataEntry } from '../data-components/logical-data-entry/logical-data-entry';
import { MultiSelectDataEntry } from '../data-components/multi-select-data-entry';
import { PatternDataEntry } from '../data-components/pattern-data-entry';
import Verification from '../data-components/verification';
import { dataFields } from '../../config/data-fields-config';

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
                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_material_elewacji" title={dataFields.konstrukcja_detal_forma_material_elewacji.title} value={building.konstrukcja_detal_forma_material_elewacji} options={dataFields.konstrukcja_detal_forma_material_elewacji.items} />
                <Verification
                    slug="konstrukcja_detal_forma_material_elewacji"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_material_elewacji !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_material_elewacji")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_material_elewacji}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_material_elewacji}
                />

                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_material_dachu" title={dataFields.konstrukcja_detal_forma_material_dachu.title} value={building.konstrukcja_detal_forma_material_dachu} options={dataFields.konstrukcja_detal_forma_material_dachu.items} />
                <Verification
                    slug="konstrukcja_detal_forma_material_dachu"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_material_dachu !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_material_dachu")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_material_dachu}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_material_dachu}
                />

                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_material_okien" title={dataFields.konstrukcja_detal_forma_material_okien.title} value={building.konstrukcja_detal_forma_material_okien} options={dataFields.konstrukcja_detal_forma_material_okien.items} />
                <Verification
                    slug="konstrukcja_detal_forma_material_okien"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_material_okien !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_material_okien")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_material_okien}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_material_okien}
                />

                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_material_drzwi" title={dataFields.konstrukcja_detal_forma_material_drzwi.title} value={building.konstrukcja_detal_forma_material_drzwi} options={dataFields.konstrukcja_detal_forma_material_drzwi.items} />
                <Verification
                    slug="konstrukcja_detal_forma_material_drzwi"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_material_drzwi !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_material_drzwi")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_material_drzwi}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_material_drzwi}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Konfiguracja Dachu" collapsed={false}>
                {/* POLE ZAWSZE ZABLOKOWANE: disabled={true} hardcodowane żeby uniknąć nadpisywania z props */}
                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_typ_dachu" title={dataFields.konstrukcja_detal_forma_typ_dachu.title} value={building.konstrukcja_detal_forma_typ_dachu} options={dataFields.konstrukcja_detal_forma_typ_dachu.items} disabled={true} />
                <Verification
                    slug="konstrukcja_detal_forma_typ_dachu"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_typ_dachu !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_typ_dachu")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_typ_dachu}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_typ_dachu}
                />

                <NumericDataEntry {...props} slug="konstrukcja_detal_forma_nachylenie_dachu" title={dataFields.konstrukcja_detal_forma_nachylenie_dachu.title} value={building.konstrukcja_detal_forma_nachylenie_dachu} min={0} max={90} step={0.1} />
                <Verification
                    slug="konstrukcja_detal_forma_nachylenie_dachu"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_nachylenie_dachu !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_nachylenie_dachu")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_nachylenie_dachu}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_nachylenie_dachu}
                />

                <PatternDataEntry {...props} slug="konstrukcja_detal_forma_kolor_dachu_rgb" title={dataFields.konstrukcja_detal_forma_kolor_dachu_rgb.title} value={building.konstrukcja_detal_forma_kolor_dachu_rgb} pattern="^#[0-9A-Fa-f]{6}$" placeholder="#RRGGBB" />
                <Verification
                    slug="konstrukcja_detal_forma_kolor_dachu_rgb"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_kolor_dachu_rgb !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_kolor_dachu_rgb")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_kolor_dachu_rgb}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_kolor_dachu_rgb}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Drzwi i Okna" collapsed={false}>
                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_obramowanie_okien" title={dataFields.konstrukcja_detal_forma_obramowanie_okien.title} value={building.konstrukcja_detal_forma_obramowanie_okien} options={dataFields.konstrukcja_detal_forma_obramowanie_okien.items} />
                <Verification
                    slug="konstrukcja_detal_forma_obramowanie_okien"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_obramowanie_okien !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_obramowanie_okien")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_obramowanie_okien}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_obramowanie_okien}
                />

                <LogicalDataEntry {...props} slug="konstrukcja_detal_forma_okiennice" title={dataFields.konstrukcja_detal_forma_okiennice.title} value={building.konstrukcja_detal_forma_okiennice} />
                <Verification
                    slug="konstrukcja_detal_forma_okiennice"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_okiennice !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_okiennice")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_okiennice}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_okiennice}
                />

                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_ksztalt_drzwi" title={dataFields.konstrukcja_detal_forma_ksztalt_drzwi.title} value={building.konstrukcja_detal_forma_ksztalt_drzwi} options={dataFields.konstrukcja_detal_forma_ksztalt_drzwi.items} />
                <Verification
                    slug="konstrukcja_detal_forma_ksztalt_drzwi"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_ksztalt_drzwi !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_ksztalt_drzwi")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_ksztalt_drzwi}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_ksztalt_drzwi}
                />

                <LogicalDataEntry {...props} slug="konstrukcja_detal_forma_portal" title={dataFields.konstrukcja_detal_forma_portal.title} value={building.konstrukcja_detal_forma_portal} />
                <Verification
                    slug="konstrukcja_detal_forma_portal"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_portal !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_portal")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_portal}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_portal}
                />

                <SelectDataEntry {...props} slug="konstrukcja_detal_forma_brama" title={dataFields.konstrukcja_detal_forma_brama.title} value={building.konstrukcja_detal_forma_brama} options={dataFields.konstrukcja_detal_forma_brama.items} />
                <Verification
                    slug="konstrukcja_detal_forma_brama"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_brama !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_brama")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_brama}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_brama}
                />
            </DataEntryGroup>

            <DataEntryGroup name="Detale Architektoniczne" collapsed={false}>
                <MultiSelectDataEntry {...props} slug="konstrukcja_detal_forma_detale" title={dataFields.konstrukcja_detal_forma_detale.title} value={building.konstrukcja_detal_forma_detale} options={dataFields.konstrukcja_detal_forma_detale.items} />
                <Verification
                    slug="konstrukcja_detal_forma_detale"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_detale !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_detale")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_detale}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_detale}
                />

                <LogicalDataEntry {...props} slug="konstrukcja_detal_forma_okapnik" title={dataFields.konstrukcja_detal_forma_okapnik.title} value={building.konstrukcja_detal_forma_okapnik} />
                <Verification
                    slug="konstrukcja_detal_forma_okapnik"
                    allow_verify={props.user !== undefined && props.building.konstrukcja_detal_forma_okapnik !== null && !props.edited}
                    onVerify={props.onVerify}
                    user_verified={props.user_verified.hasOwnProperty("konstrukcja_detal_forma_okapnik")}
                    user_verified_as={props.user_verified.konstrukcja_detal_forma_okapnik}
                    verified_count={props.building.verified?.konstrukcja_detal_forma_okapnik}
                />
            </DataEntryGroup>
        </>
    );
};

export default withCopyEdit(ConstructionContainer);