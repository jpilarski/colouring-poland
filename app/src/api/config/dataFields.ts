import { valueType } from '../../helpers';

/** Configuration for a single data field */
export interface DataFieldConfig {

    /**
     * Default: false
     */
    perUser?: boolean;

    /**
     * Allow editing the field through the API?
     */
    edit: boolean;

    /**
     * Should the editing of the field be allowed - but only when
     * the change is a result of an edit of another field, from which this field is derived.
     * Example: editing Land Use Group modifies Land Use Order, too, because LU Order is automatically derived from LU Group.
     * But Land Use Order itself cannot be modified directly by users.
     * Default: false
     */
    derivedEdit?: boolean;

    /**
     * Allow verifying the field value?
     * Default: false;
     */
    verify?: boolean;

    /**
     * Should the update value be formatted as JSON text?
     * E.g. if the database column is of type json, the object coming from
     * the HTTP request body needs to be formatted as json by pg-promise
     * See more on formatting here https://vitaly-t.github.io/pg-promise/formatting.html#.format
     * Default: false
     */
    asJson?: boolean;

    /**
     * Should the formatted value be cast to a different type when inserting to db?
     * Useful when the JS object from request needs to be mapped to a Postgres-specific column
     * E.g. can map a complex object to jsonb (need to format it as text json, too, with the asJson option above)
     * (Add more options here as they become necessary)
     * Default: undefined
     */
    sqlCast?: 'json' | 'jsonb';
}

export const buildingAttributesConfig = valueType<DataFieldConfig>()({ /* eslint-disable @typescript-eslint/camelcase */
    lokalizacja_id_gml: {
        edit: true,
        verify: true
    },
    lokalizacja_lat: {
        edit: true,
        verify: true
    },
    lokalizacja_lon: {
        edit: true,
        verify: true
    },
    lokalizacja_crs: {
        edit: true,
        verify: true
    },
    lokalizacja_wysokosc_npm: {
        edit: true,
        verify: true
    },
    lokalizacja_ulica: {
        edit: true,
        verify: true
    },
    lokalizacja_numer: {
        edit: true,
        verify: true
    },
    lokalizacja_kod_pocztowy: {
        edit: true,
        verify: true
    },
    uzytkowanie_status: {
        edit: true,
        verify: true
    },
    uzytkowanie_funkcja_ogolna: {
        edit: true,
        verify: true
    },
    uzytkowanie_funkcja_szczegolowa: {
        edit: true,
        verify: true
    },
    typologia_uklad_zabudowy: {
        edit: true,
        verify: true
    },
    typologia_intensywnosc: {
        edit: true,
        verify: true
    },
    typologia_typ_zabudowy: {
        edit: true,
        verify: true
    },
    typologia_kat_srodkowy: {
        edit: true,
        verify: true
    },
    typologia_dominanta: {
        edit: true,
        verify: true
    },
    typologia_rodzaj_dominanty: {
        edit: true,
        verify: true
    },
    typologia_aktywny_parter: {
        edit: true,
        verify: true
    },
    typologia_ilosc_kondygnacji: {
        edit: true,
        verify: true
    },
    typologia_powierzchnia_parteru: {
        edit: true,
        verify: true
    },
    typologia_wysokosc_maksymalna: {
        edit: true,
        verify: true
    },
    typologia_zwartosc_zabudowy: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_material_elewacji: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_material_dachu: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_material_okien: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_okapnik: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_obramowanie_okien: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_okiennice: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_material_drzwi: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_ksztalt_drzwi: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_portal: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_brama: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_detale: {
        edit: true,
        verify: true,
        sqlCast: 'kdf_detale_dict[]'
    },
    konstrukcja_detal_forma_nachylenie_dachu: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_kolor_dachu_rgb: {
        edit: true,
        verify: true
    },
    konstrukcja_detal_forma_typ_dachu: {
        edit: true,
        verify: true
    },
    historia_okres: {
        edit: true,
        verify: true
    },
    planowanie_typ_krajobrazu: {
        edit: true,
        verify: true
    },
    planowanie_krajobraz_priorytetowy: {
        edit: true,
        verify: true
    },
    zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni: {
        edit: true,
        verify: true
    },
    zrownowazona_adaptacyjnosc_bariery_architektoniczne: {
        edit: true,
        verify: true,
        sqlCast: 'za_bariery_dict[]'
    },
    zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc: {
        edit: true,
        verify: true
    },
    spoleczenstwo_bezpieczenstwo: {
        edit: true,
        verify: true
    },
    spoleczenstwo_identyfikacja_miejsce: {
        edit: true,
        verify: true
    },
    spoleczenstwo_percepcja_rozpoznawalnosc: {
        edit: true,
        verify: true
    },
    spoleczenstwo_percepcja_obrazowosc: {
        edit: true,
        verify: true
    },
    spoleczenstwo_percepcja_atrakcyjnosc: {
        edit: true,
        verify: true
    },
    spoleczenstwo_percepcja_czytelnosc: {
        edit: true,
        verify: true
    },
    spoleczenstwo_inicjatywa_spoleczna: {
        edit: true,
        verify: true
    },

});


export const buildingUserAttributesConfig = valueType<DataFieldConfig>()({

});

export const allAttributesConfig = Object.assign({}, buildingAttributesConfig, buildingUserAttributesConfig);
