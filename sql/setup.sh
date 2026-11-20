#!/usr/bin/env bash
# ============================================================================
# setup.sh – Inicjalizacja pełnego schematu bazy danych Colouring Poland
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $# -ge 1 ]]; then
    export PGDATABASE="$1"
fi

if [[ -z "${PGDATABASE:-}" ]]; then
    echo "Błąd: Podaj nazwę bazy danych jako argument (./sql/setup.sh <dbname>) lub ustaw PGDATABASE." >&2
    exit 1
fi

FILES=(
    "00_extensions.sql"
    "01_types.sql"
    "02_regions.sql"
    "03_users_and_auth.sql"
    "04_geometries_and_buildings.sql"
    "05_history_and_verification.sql"
    "06_audit_and_system.sql"
)

echo "=== Inicjalizacja schematu Colouring Poland w bazie: ${PGDATABASE} ==="

for file in "${FILES[@]}"; do
    path="${SCRIPT_DIR}/${file}"
    if [[ ! -f "${path}" ]]; then
        echo "Błąd: Brak pliku ${path}" >&2
        exit 1
    fi
    echo "--> Wykonywanie: ${file}"
    psql -v ON_ERROR_STOP=1 --single-transaction -f "${path}"
done

echo "=== Gotowe! Wszystkie ${#FILES[@]} plików SQL wykonano pomyślnie. ==="
