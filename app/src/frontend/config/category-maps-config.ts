import { Category } from './categories-config';
import { BuildingMapTileset } from './tileserver-config';

export type LegendElement = {
    color: string;
    border?: string;
    text: string;
} | {
    subtitle: string;
};

export interface LegendConfig {
    title: string;
    description?: string;
    disclaimer?: string;
    isDynamicGradient?: boolean;
    isDynamicDistinct?: boolean;
    elements: LegendElement[];
}

export interface CategoryMapDefinition {
    mapStyle: BuildingMapTileset;
    legend: LegendConfig;
}

export const defaultMapCategory = Category.Location;

export const categoryMapsConfig: { [key in Category]: CategoryMapDefinition[] } = {
    [Category.Location]: [
        {
            mapStyle: 'lokalizacja_wysokosc_npm',
            legend: {
                title: 'Wzniesienie m n.p.m.',
                isDynamicGradient: true,
                elements: [
                    { color: "#FF0093", text: "Min (wczytywanie...)" },
                    { color: "#FF33A9", text: "" },
                    { color: "#FF66BF", text: "" },
                    { color: "#FF99D4", text: "" },
                    { color: "#FFCCE9", text: "" },
                    { color: "#FFFFFF", text: "Max (wczytywanie...)" }
                ]
            },
        },
    ],
    [Category.LandUse]: [
        {
            mapStyle: 'uzytkowanie_funkcja_ogolna',
            legend: {
                title: 'Funkcja ogólna',
                elements: [
                    { color: "#E9C46A", text: "Budynki mieszkalne" },
                    { color: "#4E79A7", text: "Budynki biurowe" },
                    { color: "#F28E2B", text: "Budynki handlowo-usługowe" },
                    { color: "#B07AA1", text: "Budynki przemysłowe" },
                    { color: "#8C6D31", text: "Budynki produkcyjne, usługowe i gospodarcze dla rolnictwa" },
                    { color: "#76B7B2", text: "Zbiorniki, silosy i budynki magazynowe" },
                    { color: "#59A14F", text: "Budynki transportu i łączności" },
                    { color: "#E15759", text: "Budynki szpitali i inne budynki opieki zdrowotnej" },
                    { color: "#EDC948", text: "Budynki oświaty, nauki i kultury oraz budynki sportowe" },
                    { color: "#9C9DA1", text: "Pozostałe budynki niemieszkalne" }
                ]
            },
        },
    ],
    [Category.TypologySize]: [
        {
            mapStyle: 'typologia_dominanta',
            legend: {
                title: 'Dominanta',
                elements: [
                    { color: "#59A14F", text: "Jest" },
                    { color: "#E15759", text: "Nie ma" }
                ]
            },
        },
        {
            mapStyle: 'typologia_rodzaj_dominanty',
            legend: {
                title: 'Typ dominanty',
                elements: [
                    { color: "#C65D3A", text: "Ikoniczna" },
                    { color: "#4E79A7", text: "Wysokościowa" },
                    { color: "#76B7B2", text: "Płaszczyznowa" },
                    { color: "#59A14F", text: "Domykająca" },
                    { color: "#B07AA1", text: "Funkcjonalno-użytkowa" },
                    { color: "#8FBC6B", text: "Krajobrazowa" },
                    { color: "#D4A017", text: "Wybitny element krajobrazu" },
                    { color: "#E15759", text: "Znak szczególny" }
                ]
            },
        },
        {
            mapStyle: 'typologia_aktywny_parter',
            legend: {
                title: 'Aktywny parter',
                elements: [
                    { color: "#4E79A7", text: "1" },
                    { color: "#7A9BC0", text: "2" },
                    { color: "#A6BED8", text: "3" },
                    { color: "#D2E0EC", text: "4" },
                    { color: "#FFFFFF", text: "5" }
                ]
            },
        },
        {
            mapStyle: 'typologia_powierzchnia_parteru',
            legend: {
                title: 'Powierzchnia parteru',
                isDynamicGradient: true,
                elements: [
                    { color: "#00EDFF", text: "Min (wczytywanie...)" },
                    { color: "#33F0FF", text: "" },
                    { color: "#66F4FF", text: "" },
                    { color: "#99F7FF", text: "" },
                    { color: "#CCFBFF", text: "" },
                    { color: "#FFFFFF", text: "Max (wczytywanie...)" }
                ]
            },
        },
        {
            mapStyle: 'typologia_wysokosc_maksymalna',
            legend: {
                title: 'Wysokość całkowita',
                isDynamicGradient: true,
                elements: [
                    { color: "#FF0093", text: "Min (wczytywanie...)" },
                    { color: "#FF33A9", text: "" },
                    { color: "#FF66BF", text: "" },
                    { color: "#FF99D4", text: "" },
                    { color: "#FFCCE9", text: "" },
                    { color: "#FFFFFF", text: "Max (wczytywanie...)" }
                ]
            },
        },
        {
            mapStyle: 'typologia_ilosc_kondygnacji',
            legend: {
                title: 'Ilość kondygnacji',
                elements: [
                    { color: "#FF0093", text: "1" },
                    { color: "#FF1C9F", text: "2" },
                    { color: "#FF39AB", text: "3" },
                    { color: "#FF55B7", text: "4" },
                    { color: "#FF71C3", text: "5" },
                    { color: "#FF8ECF", text: "6" },
                    { color: "#FFAADB", text: "7" },
                    { color: "#FFC6E7", text: "8" },
                    { color: "#FFE3F3", text: "9" },
                    { color: "#FFFFFF", text: "10+" }
                ]
            },
        },
    ],
    [Category.ConstructionDesign]: [
        {
            mapStyle: 'kdf_material_elewacji',
            legend: {
                title: 'Elewacja materiał wiodący',
                elements: [
                    { color: "#B55239", text: "Cegła" },
                    { color: "#8C3B2A", text: "Klinkier" },
                    { color: "#8E8B83", text: "Kamień" },
                    { color: "#B7B7B7", text: "Beton" },
                    { color: "#E8DCCB", text: "Tynk" },
                    { color: "#A06A3B", text: "Drewno" },
                    { color: "#7FCBE8", text: "Szkło" },
                    { color: "#C8CDD3", text: "Aluminium" },
                    { color: "#6E7B8B", text: "Stal" },
                    { color: "#B87333", text: "Miedź" },
                    { color: "#D97757", text: "Ceramika" },
                    { color: "#9EA7A0", text: "Płyty włókno-cementowe" },
                    { color: "#F2F2F2", text: "Tworzywo sztuczne (PVC)" },
                    { color: "#5F6F7A", text: "Panele kompozytowe" },
                    { color: "#7A8D9A", text: "Płyty warstwowe" },
                    { color: "#5A3A22", text: "Mur pruski" },
                    { color: "#C8A95B", text: "Strzecha" },
                    { color: "#8B7AA8", text: "Materiał mieszany" },
                    { color: "#D46AA0", text: "Inny materiał" },
                    { color: "#D9D9D9", text: "Nieznany materiał" }
                ]
            },
        },
        {
            mapStyle: 'kdf_material_dachu',
            legend: {
                title: 'Dach materiał wiodący',
                elements: [
                    { color: "#B24A3A", text: "Dachówka ceramiczna" },
                    { color: "#A35C4A", text: "Dachówka betonowa" },
                    { color: "#6E7B8B", text: "Blachodachówka" },
                    { color: "#5F6F7A", text: "Blacha" },
                    { color: "#3F3F3F", text: "Papa" },
                    { color: "#4B4B4B", text: "Gont bitumiczny" },
                    { color: "#6C6A6A", text: "Łupek" },
                    { color: "#9AA3A0", text: "Płyty włókno-cementowe" },
                    { color: "#8B5A2B", text: "Drewno (gont)" },
                    { color: "#C2A45A", text: "Strzecha" },
                    { color: "#7FCBE8", text: "Szkło" },
                    { color: "#5FAF5A", text: "Dach zielony" },
                    { color: "#7A8D9A", text: "Płyty warstwowe" },
                    { color: "#D9D9D9", text: "Tworzywo sztuczne" },
                    { color: "#8B7AA8", text: "Materiał mieszany" },
                    { color: "#D46AA0", text: "Inny materiał" },
                    { color: "#CFCFCF", text: "Nieznany materiał" }
                ]
            },
        },
        {
            mapStyle: 'kdf_material_okien',
            legend: {
                title: 'Okna materiał wiodący',
                elements: [
                    { color: "#8B5A2B", text: "Drewno" },
                    { color: "#EAEAEA", text: "PVC" },
                    { color: "#C5C9CD", text: "Aluminium" },
                    { color: "#6E7B8B", text: "Stal" },
                    { color: "#7FCBE8", text: "Szkło" },
                    { color: "#A07C55", text: "Drewno-Aluminium" },
                    { color: "#8B7AA8", text: "Materiał mieszany" },
                    { color: "#D46AA0", text: "Inny materiał" },
                    { color: "#CFCFCF", text: "Nieznany materiał" }
                ]
            },
        },
        {
            mapStyle: 'kdf_material_drzwi',
            legend: {
                title: 'Drzwi materiał wiodący',
                elements: [
                    { color: "#8B5A2B", text: "Drewno" },
                    { color: "#EAEAEA", text: "PVC" },
                    { color: "#C5C9CD", text: "Aluminium" },
                    { color: "#6E7B8B", text: "Stal" },
                    { color: "#7FCBE8", text: "Szkło" },
                    { color: "#A07C55", text: "Drewno-Aluminium" },
                    { color: "#8B7AA8", text: "Materiał mieszany" },
                    { color: "#D46AA0", text: "Inny materiał" },
                    { color: "#CFCFCF", text: "Nieznany materiał" }
                ]
            },
        },
        {
            mapStyle: 'kdf_kolor_dachu_rgb',
            legend: {
                title: 'Kolor dachu',
                elements: [
                    { subtitle: "Dach w kolorze parametru HEX" }
                ]
            },
        },
        {
            mapStyle: 'kdf_typ_dachu',
            legend: {
                title: 'Typ dachu',
                elements: [
                    { color: "#9C9DA1", text: "Dach płaski" },
                    { color: "#F28E2B", text: "Dach skośny" }
                ]
            },
        },
        {
            mapStyle: 'kdf_nachylenie_dachu',
            legend: {
                title: 'Nachylenie dachu',
                isDynamicGradient: true,
                elements: [
                    { color: "#00EDFF", text: "Min (wczytywanie...)" },
                    { color: "#33F0FF", text: "" },
                    { color: "#66F4FF", text: "" },
                    { color: "#99F7FF", text: "" },
                    { color: "#CCFBFF", text: "" },
                    { color: "#FFFFFF", text: "Max (wczytywanie...)" }
                ]
            },
        },
    ],
    [Category.AgeHistory]: [],
    [Category.PlanningConservation]: [
        {
            mapStyle: 'planowanie_typ_krajobrazu',
            legend: {
                title: 'Typ krajobrazu',
                elements: [
                    { color: "#1F78B4", text: "11. Wodnogospodarcze" },
                    { color: "#6E6E6E", text: "12. Przemysłowe i energetyczne" },
                    { color: "#E31A1C", text: "14. Komunikacyjne" },
                    { color: "#66C2A5", text: "2. Bagienno-łąkowe - głównie bezleśne" },
                    { color: "#228B22", text: "3. Leśne" },
                    { color: "#F2C94C", text: "6. Wiejskie" },
                    { color: "#984EA3", text: "7. Mozaikowe" },
                    { color: "#FDB462", text: "8. Podmiejskie i osadnicze" },
                    { color: "#4D4D4D", text: "9. Miejskie" }
                ]
            },
        },
        {
            mapStyle: 'planowanie_krajobraz_priorytetowy',
            legend: {
                title: 'Krajobraz priorytetowy',
                elements: [
                    { color: "#59A14F", text: "Tak" },
                    { color: "#E15759", text: "Nie" }
                ]
            },
        },
    ],
    [Category.RetrofitCondition]: [
        {
            mapStyle: 'za_dostepnosc_niepelnosprawni',
            legend: {
                title: 'Dostępność dla NP',
                elements: [
                    { color: "#59A14F", text: "Jest" },
                    { color: "#E15759", text: "Nie ma" }
                ]
            },
        },
    ],
    [Category.EnergyPerformance]: [],
    [Category.WaterGreenInfrastructure]: [],
    [Category.UrbanInfrastructure]: [],
    [Category.DisasterManagement]: [],
    [Category.Community]: [
        {
            mapStyle: 'spoleczenstwo_bezpieczenstwo',
            legend: {
                title: 'Poczucie bezpieczeństwa',
                elements: [
                    { color: "#E15759", text: "1" },
                    { color: "#E98284", text: "2" },
                    { color: "#F0ADAE", text: "3" },
                    { color: "#F7D7D7", text: "4" },
                    { color: "#FFFFFF", text: "5" }
                ]
            },
        },
        {
            mapStyle: 'spoleczenstwo_percepcja_obrazowosc',
            legend: {
                title: 'Obrazowość',
                elements: [
                    { color: "#F28E2B", text: "1" },
                    { color: "#F5AD63", text: "2" },
                    { color: "#F8CB9A", text: "3" },
                    { color: "#FBE8D0", text: "4" },
                    { color: "#FFFFFF", text: "5" }
                ]
            },
        },
        {
            mapStyle: 'spoleczenstwo_percepcja_atrakcyjnosc',
            legend: {
                title: 'Atrakcyjnosć',
                elements: [
                    { color: "#FFFFFF", text: "1" },
                    { color: "#D5ECD2", text: "2" },
                    { color: "#ABD3A5", text: "3" },
                    { color: "#82BA7A", text: "4" },
                    { color: "#59A14F", text: "5" }
                ]
            },
        },
        {
            mapStyle: 'spoleczenstwo_percepcja_czytelnosc',
            legend: {
                title: 'Czytelność',
                elements: [
                    { color: "#FFFFFF", text: "1" },
                    { color: "#E3DAE2", text: "2" },
                    { color: "#C7B4C5", text: "3" },
                    { color: "#AB8FA8", text: "4" },
                    { color: "#8E6C8A", text: "5" }
                ]
            },
        },
    ]
};
