-- ============================================================================
-- 01_types.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Kategoria: Użytkowanie
-- ----------------------------------------------------------------------------

CREATE TYPE uzytkowanie_status_dict AS ENUM (
    'Eksploatowany',
    'Nieczynny',
    'W budowie',
    'Zniszczony'
);

CREATE TYPE uzytkowanie_funkcja_ogolna_dict AS ENUM (
    'Budynki mieszkalne',
    'Budynki biurowe',
    'Budynki handlowo-usługowe',
    'Budynki przemysłowe',
    'Budynki produkcyjne, usługowe i gospodarcze dla rolnictwa',
    'Zbiorniki, silosy i budynki magazynowe',
    'Budynki transportu i łączności',
    'Budynki szpitali i inne budynki opieki zdrowotnej',
    'Budynki oświaty, nauki i kultury oraz budynki sportowe',
    'Pozostałe budynki niemieszkalne'
);

-- ----------------------------------------------------------------------------
-- Kategoria: Typologia
-- ----------------------------------------------------------------------------

CREATE TYPE typologia_uklad_zabudowy_dict AS ENUM (
    'Kwartałowy',
    'Swobodny'
);

CREATE TYPE typologia_intensywnosc_dict AS ENUM (
    'Zwarta',
    'Rozproszona'
);

CREATE TYPE typologia_typ_zabudowy_dict AS ENUM (
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
);

CREATE TYPE typologia_rodzaj_dominanty_dict AS ENUM (
    'Ikoniczna',
    'Wysokościowa',
    'Płaszczyznowa',
    'Domykająca',
    'Funkcjonalno-użytkowa',
    'Krajobrazowa',
    'Wybitny element krajobrazu',
    'Znak szczególny'
);

-- ----------------------------------------------------------------------------
-- Kategoria: Konstrukcja, Detal, Forma (KDF)
-- ----------------------------------------------------------------------------

CREATE TYPE kdf_material_elewacji_dict AS ENUM (
    'Cegła',
    'Klinkier',
    'Kamień',
    'Beton',
    'Tynk',
    'Drewno',
    'Szkło',
    'Aluminium',
    'Stal',
    'Miedź',
    'Ceramika',
    'Płyty włókno-cementowe',
    'Tworzywo sztuczne (PVC)',
    'Panele kompozytowe',
    'Płyty warstwowe',
    'Mur pruski',
    'Strzecha',
    'Materiał mieszany',
    'Inny materiał',
    'Nieznany materiał'
);

CREATE TYPE kdf_material_dachu_dict AS ENUM (
    'Dachówka ceramiczna',
    'Dachówka betonowa',
    'Blachodachówka',
    'Blacha',
    'Papa',
    'Gont bitumiczny',
    'Łupek',
    'Płyty włókno-cementowe',
    'Drewno (gont)',
    'Strzecha',
    'Szkło',
    'Dach zielony',
    'Płyty warstwowe',
    'Tworzywo sztuczne',
    'Materiał mieszany',
    'Inny materiał',
    'Nieznany materiał'
);

CREATE TYPE kdf_material_okien_drzwi_dict AS ENUM (
    'Drewno',
    'PVC',
    'Aluminium',
    'Stal',
    'Szkło',
    'Drewno-Aluminium',
    'Materiał mieszany',
    'Inny materiał',
    'Nieznany materiał'
);

CREATE TYPE kdf_obramowanie_okien_dict AS ENUM (
    'Kamień',
    'Sztukateria gipsowa',
    'Sztukateria styropianowa',
    'Klinkier',
    'Cegła',
    'Drewno',
    'Tynk'
);

CREATE TYPE kdf_ksztalt_drzwi_dict AS ENUM (
    'Prostokątne',
    'Sklepione',
    'Inne'
);

CREATE TYPE kdf_brama_dict AS ENUM (
    'Brak',
    'Na dziedziniec',
    'Do garażu'
);

CREATE TYPE kdf_detale_dict AS ENUM (
    'Gzyms',
    'Attyka',
    'Balkon',
    'Loggia',
    'Wykusz',
    'Ryzalit',
    'Pilaster',
    'Portal',
    'Obramowania okienne',
    'Szprosy',
    'Okiennice',
    'Lukarna',
    'Balustrada',
    'Krata ozdobna',
    'Ornament elewacyjny',
    'Detale metalowe',
    'Detale kamienne',
    'Brak detali',
    'Inny',
    'Nieznany'
);

CREATE TYPE kdf_typ_dachu_dict AS ENUM (
    'Dach płaski',
    'Dach skośny'
);

-- ----------------------------------------------------------------------------
-- Kategoria: Historia
-- ----------------------------------------------------------------------------

CREATE TYPE historia_okres_dict AS ENUM (
    '700-1250 (Budownictwo wczesnodziejowe)',
    '1250-1450 (Gotyk)',
    '1450-1550 (Transformacja)',
    '1550-1640 (Manieryzm)',
    '1640-1795 (Barok)',
    '1780-1870 (Romantyzm)',
    '1870-1895 (Eklektyzm, historyzm)',
    '1895-1914 (Secesja)',
    '1914-1980 (Modernizm)',
    '1980-1999 (Późny XX wiek)',
    '2000-2025 (Wczesny XXI wiek)'
);

-- ----------------------------------------------------------------------------
-- Kategoria: Planowanie
-- ----------------------------------------------------------------------------

CREATE TYPE planowanie_typ_krajobrazu_dict AS ENUM (
    '2. Bagienno-łąkowe - głównie bezleśne',
    '3. Leśne',
    '6. Wiejskie',
    '7. Mozaikowe',
    '8. Podmiejskie i osadnicze',
    '9. Miejskie',
    '11. Wodnogospodarcze',
    '12. Przemysłowe i energetyczne',
    '14. Komunikacyjne'
);

-- ----------------------------------------------------------------------------
-- Kategoria: Zrównoważona Adaptacyjność (ZA)
-- ----------------------------------------------------------------------------

CREATE TYPE za_bariery_dict AS ENUM (
    'Brak windy',
    'Brak podjazdu',
    'Schody bez alternatywy',
    'Zbyt wąskie drzwi',
    'Próg utrudniający dostęp',
    'Brak drzwi automatycznych',
    'Brak platformy/podnośnika',
    'Brak toalety dostępnej',
    'Brak oznaczeń dla niewidomych',
    'Brak kontrastu wizualnego',
    'Brak informacji głosowej',
    'Brak miejsca parkingowego dla osób z niepełnosprawnościami',
    'Niedostępne korytarze',
    'Brak dostępnej recepcji/domofonu',
    'Inna bariera',
    'Brak barier',
    'Nieznane bariery'
);
