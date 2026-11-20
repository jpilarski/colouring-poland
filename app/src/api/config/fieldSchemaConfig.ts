import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { allAttributesConfig } from './dataFields';

export const TYPOLOGIA_TYP_ZABUDOWY_VALUES = [
    'Wolnostojąca',
    'Bliźniacza',
    'Szeregowa',
    'Gniazdowa',
    'Atrialna',
    'Łanowa',
    'Zagrodowa',
    'Pierzejowa',
    'Pasmowa',
    'Grzebieniowa',
    'Punktowa',
    'Wstęgowa',
    'Klastrowa',
    'Obrzeżna',
    'Komercyjno-usługowa',
    'Inny'
] as const;

const nullableIntRange = (minimum: number, maximum: number): SomeJSONSchema => ({
    type: 'integer',
    minimum,
    maximum,
    nullable: true
});

const nullableNumberRange = (minimum: number, maximum: number): SomeJSONSchema => ({
    type: 'number',
    minimum,
    maximum,
    nullable: true
});

const nullableScale1To5: SomeJSONSchema = nullableIntRange(1, 5);

export const fieldSchemaConfig: { [key in keyof typeof allAttributesConfig]?: SomeJSONSchema } = { /*eslint-disable @typescript-eslint/camelcase */
    uzytkowanie_funkcja_szczegolowa: nullableIntRange(0, 99999),

    typologia_typ_zabudowy: {
        type: 'string',
        enum: [...TYPOLOGIA_TYP_ZABUDOWY_VALUES, null],
        nullable: true
    },
    typologia_kat_srodkowy: nullableNumberRange(0, 90),
    typologia_aktywny_parter: nullableScale1To5,
    typologia_ilosc_kondygnacji: nullableIntRange(0, 99999),
    typologia_powierzchnia_parteru: nullableNumberRange(0, 99999),
    typologia_wysokosc_maksymalna: nullableNumberRange(0, 99999),
    typologia_zwartosc_zabudowy: nullableNumberRange(0, 99999),

    konstrukcja_detal_forma_nachylenie_dachu: nullableIntRange(0, 90),
    konstrukcja_detal_forma_kolor_dachu_rgb: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        nullable: true
    },

    zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc: nullableIntRange(0, 99999),

    spoleczenstwo_bezpieczenstwo: nullableScale1To5,
    spoleczenstwo_identyfikacja_miejsce: nullableScale1To5,
    spoleczenstwo_percepcja_rozpoznawalnosc: nullableScale1To5,
    spoleczenstwo_percepcja_obrazowosc: nullableScale1To5,
    spoleczenstwo_percepcja_atrakcyjnosc: nullableScale1To5,
    spoleczenstwo_percepcja_czytelnosc: nullableScale1To5
};
