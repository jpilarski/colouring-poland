import { FieldTypeError, InvalidFieldError } from '../../../../errors';
import { TYPOLOGIA_TYP_ZABUDOWY_VALUES } from '../../../../config/fieldSchemaConfig';
import { validateChangeSet, validateFieldChange } from '../validateUpdate';

describe('Building Update Validation (validateUpdate)', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('Read-only location fields', () => {
        const readOnlyLocationFields = [
            'lokalizacja_id_gml',
            'lokalizacja_lat',
            'lokalizacja_lon',
            'lokalizacja_crs',
            'lokalizacja_wysokosc_npm',
            'lokalizacja_ulica',
            'lokalizacja_numer',
            'lokalizacja_kod_pocztowy'
        ];

        it.each(readOnlyLocationFields)('rejects external edits to read-only field %s', (field) => {
            expect(() => validateFieldChange(field, 'test', true)).toThrow(InvalidFieldError);
        });

        it('rejects unknown attributes', () => {
            expect(() => validateFieldChange('non_existent_column', 123, true)).toThrow(InvalidFieldError);
        });
    });

    describe('Numeric bounds (0..99999, angles 0..90, scales 1..5)', () => {
        it('accepts valid integer and decimal values within bounds as well as null', () => {
            expect(() => validateChangeSet({
                uzytkowanie_funkcja_szczegolowa: 1110,
                typologia_ilosc_kondygnacji: 5,
                typologia_powierzchnia_parteru: 245.75,
                typologia_wysokosc_maksymalna: 18.4,
                typologia_zwartosc_zabudowy: 0.65,
                typologia_kat_srodkowy: 45.5,
                konstrukcja_detal_forma_nachylenie_dachu: 30,
                zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc: 250,
                typologia_aktywny_parter: 3,
                spoleczenstwo_bezpieczenstwo: 4
            })).not.toThrow();

            expect(() => validateChangeSet({
                uzytkowanie_funkcja_szczegolowa: null,
                typologia_powierzchnia_parteru: null,
                konstrukcja_detal_forma_nachylenie_dachu: null,
                spoleczenstwo_bezpieczenstwo: null
            })).not.toThrow();
        });

        it('rejects numeric values exceeding 99999 (e.g. 11-digit numbers) and negative values', () => {
            expect(() => validateFieldChange('uzytkowanie_funkcja_szczegolowa', 100000)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('uzytkowanie_funkcja_szczegolowa', 90010112345)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('typologia_ilosc_kondygnacji', -1)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('typologia_powierzchnia_parteru', 100000)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('typologia_wysokosc_maksymalna', -0.5)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc', 999999)).toThrow(FieldTypeError);
        });

        it('rejects fractional values for integer columns', () => {
            expect(() => validateFieldChange('typologia_ilosc_kondygnacji', 2.5)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('konstrukcja_detal_forma_nachylenie_dachu', 15.5)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('uzytkowanie_funkcja_szczegolowa', 12.3)).toThrow(FieldTypeError);
        });

        it('enforces 0..90 bounds for angles and 1..5 bounds for rating scales', () => {
            expect(() => validateFieldChange('typologia_kat_srodkowy', 91)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('konstrukcja_detal_forma_nachylenie_dachu', 95)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('typologia_aktywny_parter', 0)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('typologia_aktywny_parter', 6)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('spoleczenstwo_percepcja_czytelnosc', 0)).toThrow(FieldTypeError);
            expect(() => validateFieldChange('spoleczenstwo_percepcja_czytelnosc', 6)).toThrow(FieldTypeError);
        });
    });

    describe('Roof RGB color validation (#RRGGBB)', () => {
        it('accepts valid #RRGGBB hex strings and null', () => {
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', '#a1B2c3')).not.toThrow();
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', '#000000')).not.toThrow();
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', null)).not.toThrow();
        });

        it('rejects malformed colors and arbitrary free text', () => {
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', 'red')).toThrow(FieldTypeError);
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', '#FFF')).toThrow(FieldTypeError);
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', '123456')).toThrow(FieldTypeError);
            expect(() => validateFieldChange('konstrukcja_detal_forma_kolor_dachu_rgb', '#GGGGGG')).toThrow(FieldTypeError);
        });
    });

    describe('Building typology dictionary (typologia_typ_zabudowy)', () => {
        it('accepts every value from the 16-item dictionary and null', () => {
            expect(TYPOLOGIA_TYP_ZABUDOWY_VALUES).toHaveLength(16);
            for (const val of TYPOLOGIA_TYP_ZABUDOWY_VALUES) {
                expect(() => validateFieldChange('typologia_typ_zabudowy', val)).not.toThrow();
            }
            expect(() => validateFieldChange('typologia_typ_zabudowy', null)).not.toThrow();
        });

        it('rejects arbitrary free text outside the dictionary', () => {
            expect(() => validateFieldChange('typologia_typ_zabudowy', 'Dowolny tekst')).toThrow(FieldTypeError);
            expect(() => validateFieldChange('typologia_typ_zabudowy', 'wolnostojąca')).toThrow(FieldTypeError);
        });
    });
});
