-- ============================================================================
-- 00_extensions.sql
-- ============================================================================

-- Obsługa danych przestrzennych
CREATE EXTENSION IF NOT EXISTS postgis;

-- Funkcje kryptograficzne
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Indeksowanie trigramowe dla wyszukiwarki lokalizacji
CREATE EXTENSION IF NOT EXISTS pg_trgm;
