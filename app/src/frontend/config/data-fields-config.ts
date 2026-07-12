import { Category } from './categories-config';
import { CCConfig } from '../../cc-config';
let ccconfig: CCConfig = require('../../cc-config.json')

/*
 * Common list of Source Types, used in multiple menus
*/
export const commonSourceTypes = [
    "Assessed by eye/personal knowledge of the building",
    "Assessed using professional knowledge of building or building type",
    "Assessed using streetview photographs, satellite imagery or maps",
    "Assessed by specialist emergency group",
    "Central government record/online database",
    "Local government record/online database",
    "Live streamed from a government source",
    "Open database (non-profit)",
    "Open database (commercial)",
    "Website (non-profit)",
    "Website (commercial)",
    "Inferred computationally from CCRP data",
    "Inferred by eye from CCRP data",
    "Synthetic data",
    "Other"
];

const freeTextDisclaimer: string =
    "<br/><br/>(For security reasons, we are not currently allowing free-text input and are looking into other ways of collecting this data).";

/**
 * This interface is used only in code which uses dataFields, not in the dataFields definition itself
 * Cannot make dataFields an indexed type ({[key: string]: DataFieldDefinition}),
 * because then we wouldn't have type-checking for whether a given key exists on dataFields,
 * e.g. dataFields.foo_bar would not be highlighted as an error.
 */
export interface DataFieldDefinition {
    /**
     * The primary category to which the field belongs.
     * 
     * A field could be displayed in several categories, but this value will be used
     * when a single category needs to be shown in the context of a field, e.g.
     * in the case of edit history or the copy-paste tool (multi-edit)
     *  */
    category: Category;

    /**
     * The human-readable title of the field to be displayed as label.
     */
    title: string;

    /**
     * Text to be displayed in the hint tooltip next to the input field.
     * 
     * This supports a simple Markdown-like syntax for embedding clickable URLs in the hint
     * for example "see [here](http://example.com/info.html) for more information"
     */
    tooltip?: string;

    /**
     * If the defined type is an array, this describes the fields of each array item.
     * The nested fields don't currently need a category field to be defined.
     */
    items?: { [key: string]: Omit<DataFieldDefinition, 'category'> };


    /**
     * If the defined type is a dictionary, this describes the types of the dictionary's fields
     */
    fields?: { [key: string]: Omit<DataFieldDefinition, 'category'> }

    /**
     * The example is used to determine the runtime type in which the attribute data is stored (e.g. number, string, object)
     * This gives the programmer auto-complete of all available building attributes when implementing a category view.
     * 
     * E.g. if the field is a text value, an empty string ("") is the simplest example.
     * 
     * Making it semantically correct is useful but not necessary.
     * E.g. for building attachment form, you could use "Detached" as example
     * 
     * This field is later processed by AttributesBasedOnExample
     */
    example: any;

    /**
     * Whether the field is a field that has an independent value for each user.
     * For example, user building likes are one of such fields.
     * By default this is false - fields are treated as not user-specific.
     */
    perUser?: boolean;
}

export const buildingUserFields = {

};

export const dataFields = { /* eslint-disable @typescript-eslint/camelcase */
    lokalizacja_id_gml: {
        category: Category.Location,
        title: "ID GML (BDOT10k)",
        example: ""
    },
    lokalizacja_lat: {
        category: Category.Location,
        title: "Szerokość geograficzna (Lat)",
        example: 52.0
    },
    lokalizacja_lon: {
        category: Category.Location,
        title: "Długość geograficzna (Lon)",
        example: 19.0
    },
    lokalizacja_crs: {
        category: Category.Location,
        title: "Układ współrzędnych (CRS)",
        example: "EPSG:2180"
    },
    lokalizacja_wysokosc_npm: {
        category: Category.Location,
        title: "Wysokość n.p.m.",
        example: 120.5
    },
    lokalizacja_ulica: {
        category: Category.Location,
        title: "Ulica",
        example: "Polna"
    },
    lokalizacja_numer: {
        category: Category.Location,
        title: "Numer budynku",
        example: "12A"
    },
    lokalizacja_kod_pocztowy: {
        category: Category.Location,
        title: "Kod pocztowy",
        example: "00-001"
    },
    uzytkowanie_status: {
        category: Category.LandUse,
        title: "Status",
        example: "",
        items: [
            "Eksploatowany",
            "Nieczynny",
            "W budowie",
            "Zniszczony"
        ]
    },
    uzytkowanie_funkcja_ogolna: {
        category: Category.LandUse,
        title: "Funkcja Ogólna",
        example: "",
        items: [
            "Budynki przemysłowe",
            "Budynki transportu i łączności",
            "Budynki handlowo-usługowe",
            "Zbiorniki, silosy i budynki magazynowe",
            "Budynki biurowe",
            "Budynki szpitali i inne budynki opieki zdrowotnej",
            "Budynki oświaty, nauki i kultury oraz budynki sportowe",
            "Budynki produkcyjne, usługowe i gospodarcze dla rolnictwa",
            "Pozostałe budynki niemieszkalne",
            "Budynki mieszkalne"
        ]
    },
    uzytkowanie_funkcja_szczegolowa: {
        category: Category.LandUse,
        title: "Funkcja Szczegółowa (ID)",
        example: 1110
    },
    typologia_uklad_zabudowy: {
        category: Category.TypologySize,
        title: "Układ zabudowy",
        example: "",
        items: [
            "Kwartałowy",
            "Swobodny"
        ]
    },
    typologia_intensywnosc: {
        category: Category.TypologySize,
        title: "Intensywność",
        example: "",
        items: [
            "Zwarta",
            "Rozproszona"
        ]
    },
    typologia_typ_zabudowy: {
        category: Category.TypologySize,
        title: "Typ zabudowy",
        example: ""
    },
    typologia_kat_srodkowy: {
        category: Category.TypologySize,
        title: "Kąt środkowy",
        example: 45.5
    },
    typologia_dominanta: {
        category: Category.TypologySize,
        title: "Czy jest dominantą?",
        example: false
    },
    typologia_rodzaj_dominanty: {
        category: Category.TypologySize,
        title: "Rodzaj dominanty",
        example: "",
        items: [
            "Ikoniczna",
            "Wysokościowa",
            "Płaszczyznowa",
            "Domykająca",
            "Funkcjonalno-użytkowa",
            "Krajobrazowa",
            "Wybitny element krajobrazu",
            "Znak szczególny"
        ]
    },
    typologia_aktywny_parter: {
        category: Category.TypologySize,
        title: "Aktywny parter (1-5)",
        example: 3
    },
    typologia_ilosc_kondygnacji: {
        category: Category.TypologySize,
        title: "Ilość kondygnacji",
        example: 4
    },
    typologia_powierzchnia_parteru: {
        category: Category.TypologySize,
        title: "Powierzchnia parteru",
        example: 120.5
    },
    typologia_wysokosc_maksymalna: {
        category: Category.TypologySize,
        title: "Wysokość maksymalna (m)",
        example: 15.0
    },
    typologia_zwartosc_zabudowy: {
        category: Category.TypologySize,
        title: "Zwartość zabudowy",
        example: 0.8
    },
    konstrukcja_detal_forma_material_elewacji: {
        category: Category.ConstructionDesign,
        title: "Materiał elewacji",
        example: "",
        items: [
            "Cegła",
            "Klinkier",
            "Kamień",
            "Beton",
            "Tynk",
            "Drewno",
            "Szkło",
            "Aluminium",
            "Stal",
            "Miedź",
            "Ceramika",
            "Płyty włókno-cementowe",
            "Tworzywo sztuczne (PVC)",
            "Panele kompozytowe",
            "Płyty warstwowe",
            "Mur pruski",
            "Strzecha",
            "Materiał mieszany",
            "Inny materiał",
            "Nieznany materiał"
        ]
    },
    konstrukcja_detal_forma_material_dachu: {
        category: Category.ConstructionDesign,
        title: "Materiał dachu",
        example: "",
        items: [
            "Dachówka ceramiczna",
            "Dachówka betonowa",
            "Blachodachówka",
            "Blacha",
            "Papa",
            "Gont bitumiczny",
            "Łupek",
            "Płyty włókno-cementowe",
            "Drewno (gont)",
            "Strzecha",
            "Szkło",
            "Dach zielony",
            "Płyty warstwowe",
            "Tworzywo sztuczne",
            "Materiał mieszany",
            "Inny materiał",
            "Nieznany materiał"
        ]
    },
    konstrukcja_detal_forma_material_okien: {
        category: Category.ConstructionDesign,
        title: "Materiał okien",
        example: "",
        items: [
            "Drewno",
            "PVC",
            "Aluminium",
            "Stal",
            "Szkło",
            "Drewno-Aluminium",
            "Materiał mieszany",
            "Inny materiał",
            "Nieznany materiał"
        ]
    },
    konstrukcja_detal_forma_okapnik: {
        category: Category.ConstructionDesign,
        title: "Okapnik",
        example: false
    },
    konstrukcja_detal_forma_obramowanie_okien: {
        category: Category.ConstructionDesign,
        title: "Obramowanie okien",
        example: "",
        items: [
            "Kamień",
            "Sztukateria gipsowa",
            "Sztukateria styropianowa",
            "Klinkier",
            "Cegła",
            "Drewno",
            "Tynk"
        ]
    },
    konstrukcja_detal_forma_okiennice: {
        category: Category.ConstructionDesign,
        title: "Okiennice",
        example: false
    },
    konstrukcja_detal_forma_material_drzwi: {
        category: Category.ConstructionDesign,
        title: "Materiał drzwi",
        example: "",
        items: [
            "Drewno",
            "PVC",
            "Aluminium",
            "Stal",
            "Szkło",
            "Drewno-Aluminium",
            "Materiał mieszany",
            "Inny materiał",
            "Nieznany materiał"
        ]
    },
    konstrukcja_detal_forma_ksztalt_drzwi: {
        category: Category.ConstructionDesign,
        title: "Kształt drzwi",
        example: "",
        items: [
            "Prostokątne",
            "Sklepione",
            "Inne"
        ]
    },
    konstrukcja_detal_forma_portal: {
        category: Category.ConstructionDesign,
        title: "Portal",
        example: false
    },
    konstrukcja_detal_forma_brama: {
        category: Category.ConstructionDesign,
        title: "Brama",
        example: "",
        items: [
            "Brak",
            "Na dziedziniec",
            "Do garażu"
        ]
    },
    konstrukcja_detal_forma_detale: {
        category: Category.ConstructionDesign,
        title: "Detale architektoniczne",
        example: ["", ""],
        items: [
            "Gzyms",
            "Attyka",
            "Balkon",
            "Loggia",
            "Wykusz",
            "Ryzalit",
            "Pilaster",
            "Portal",
            "Obramowania okienne",
            "Szprosy",
            "Okiennice",
            "Lukarna",
            "Balustrada",
            "Krata ozdobna",
            "Ornament elewacyjny",
            "Detale metalowe",
            "Detale kamienne",
            "Brak detali",
            "Inny",
            "Nieznany"
        ]
    },
    konstrukcja_detal_forma_nachylenie_dachu: {
        category: Category.ConstructionDesign,
        title: "Nachylenie dachu (stopnie)",
        example: 45
    },
    konstrukcja_detal_forma_kolor_dachu_rgb: {
        category: Category.ConstructionDesign,
        title: "Kolor dachu (HEX)",
        example: "#FF0000"
    },
    konstrukcja_detal_forma_typ_dachu: {
        category: Category.ConstructionDesign,
        title: "Typ dachu",
        example: "",
        items: [
            "Dach płaski",
            "Dach skośny"
        ]
    },
    historia_okres: {
        category: Category.AgeHistory,
        title: "Okres historyczny",
        example: "",
        items: [
            "700-1250 (Budownictwo wczesnodziejowe)",
            "1250-1450 (Gotyk)",
            "1450-1550 (Transformacja)",
            "1550-1640 (Manieryzm)",
            "1640-1795 (Barok)",
            "1780-1870 (Romantyzm)",
            "1870-1895 (Eklektyzm, historyzm)",
            "1895-1914 (Secesja)",
            "1914-1980 (Modernizm)",
            "1980-1999 (Późny XX wiek)",
            "2000-2025 (Wczesny XXI wiek)"
        ]
    },
    planowanie_typ_krajobrazu: {
        category: Category.PlanningConservation,
        title: "Typ krajobrazu",
        example: "",
        items: [
            "11. Wodnogospodarcze",
            "12. Przemysłowe i energetyczne",
            "14. Komunikacyjne",
            "2. Bagienno-łąkowe - głównie bezleśne",
            "3. Leśne",
            "6. Wiejskie",
            "7. Mozaikowe",
            "8. Podmiejskie i osadnicze",
            "9. Miejskie"
        ]
    },
    planowanie_krajobraz_priorytetowy: {
        category: Category.PlanningConservation,
        title: "Krajobraz priorytetowy",
        example: false
    },
    zrownowazona_adaptacyjnosc_dostepnosc_niepelnosprawni: {
        category: Category.RetrofitCondition,
        title: "Dostępność dla z niepełnosprawnościami",
        example: false
    },
    zrownowazona_adaptacyjnosc_bariery_architektoniczne: {
        category: Category.RetrofitCondition,
        title: "Bariery architektoniczne",
        example: ["", ""],
        items: [
            "Brak windy",
            "Brak podjazdu",
            "Schody bez alternatywy",
            "Zbyt wąskie drzwi",
            "Próg utrudniający dostęp",
            "Brak drzwi automatycznych",
            "Brak platformy/podnośnika",
            "Brak toalety dostępnej",
            "Brak oznaczeń dla niewidomych",
            "Brak kontrastu wizualnego",
            "Brak informacji głosowej",
            "Brak miejsca parkingowego dla osób z niepełnosprawnościami",
            "Niedostępne korytarze",
            "Brak dostępnej recepcji/domofonu",
            "Inna bariera",
            "Brak barier",
            "Nieznane bariery"
        ]
    },
    zrownowazona_adaptacyjnosc_komunikacja_publiczna_odleglosc: {
        category: Category.RetrofitCondition,
        title: "Odległość do komunikacji (m)",
        example: 150
    },
    spoleczenstwo_bezpieczenstwo: {
        category: Category.Community,
        title: "Bezpieczeństwo",
        example: 3,
        tooltip: "Skala Likerta 1-5"
    },
    spoleczenstwo_identyfikacja_miejsce: {
        category: Category.Community,
        title: "Identyfikacja z miejscem",
        example: 3,
        tooltip: "Skala Likerta 1-5"
    },
    spoleczenstwo_percepcja_rozpoznawalnosc: {
        category: Category.Community,
        title: "Rozpoznawalność",
        example: 3,
        tooltip: "Skala Likerta 1-5"
    },
    spoleczenstwo_percepcja_obrazowosc: {
        category: Category.Community,
        title: "Obrazowość",
        example: 3,
        tooltip: "Skala Likerta 1-5"
    },
    spoleczenstwo_percepcja_atrakcyjnosc: {
        category: Category.Community,
        title: "Atrakcyjność",
        example: 3,
        tooltip: "Skala Likerta 1-5"
    },
    spoleczenstwo_percepcja_czytelnosc: {
        category: Category.Community,
        title: "Czytelność",
        example: 3,
        tooltip: "Skala Likerta 1-5"
    },
    spoleczenstwo_inicjatywa_spoleczna: {
        category: Category.Community,
        title: "Inicjatywa społeczna",
        example: false
    },

    edit_history: {
        category: Category.UrbanInfrastructure,
        title: "PLANNING DATA",
        tooltip: null,
        example: [{}],
    },

};

export const allFieldsConfig = { ...dataFields, ...buildingUserFields };