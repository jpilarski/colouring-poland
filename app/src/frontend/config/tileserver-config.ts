/**
 * This file defines all the valid tileset names that can be obtained from the tilserver.
 * Adjust the values here if modifying the list of styles in the tileserver.
 */

export type BuildingMapTileset =
    'uzytkowanie_funkcja_ogolna' |
    'typologia_dominanta' |
    'typologia_rodzaj_dominanty' |
    'typologia_aktywny_parter' |
    'kdf_material_elewacji' |
    'kdf_material_dachu' |
    'kdf_material_okien' |
    'kdf_material_drzwi' |
    'kdf_kolor_dachu_rgb' |
    'kdf_typ_dachu' |
    'planowanie_typ_krajobrazu' |
    'planowanie_krajobraz_priorytetowy' |
    'za_dostepnosc_niepelnosprawni' |
    'spoleczenstwo_bezpieczenstwo' |
    'spoleczenstwo_percepcja_obrazowosc' |
    'spoleczenstwo_percepcja_atrakcyjnosc' |
    'spoleczenstwo_percepcja_czytelnosc' |
    'lokalizacja_wysokosc_npm' |
    'typologia_powierzchnia_parteru' |
    'typologia_wysokosc_maksymalna' |
    'typologia_ilosc_kondygnacji' |
    'kdf_nachylenie_dachu';

export type SpecialMapTileset = 'base_light' | 'base_night' | 'base_night_outlines' | 'highlight' | 'number_labels' | 'base_boroughs';

export type MapTileset = BuildingMapTileset | SpecialMapTileset;
