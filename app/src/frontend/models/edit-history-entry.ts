export interface EditHistoryEntry {
    revision_timestamp: string;
    username: string;
    revision_id: string;
    forward_patch: object;
    reverse_patch: object;
    lokalizacja_id_budynku?: number;
}
