import db from '../../db';
import { DatabaseError } from '../errors';

export interface DataExtractRow {
    extract_id: number;
    extracted_on: Date;
    extract_path: string;
}

/**
 * Pobiera listę wszystkich wygenerowanych paczek danych (bulk extracts), posortowanych od najnowszych
 */
export async function selectAllDataExtracts(): Promise<DataExtractRow[]> {
    try {
        return await db.manyOrNone<DataExtractRow>(
            `SELECT
                extract_id, extracted_on, extract_path
            FROM bulk_extracts
            ORDER BY extracted_on DESC`
        );
    } catch (err: any) {
        console.error('Error in selectAllDataExtracts:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        throw new DatabaseError(err?.message);
    }
}

/**
 * Pobiera metadane pojedynczej paczki danych po jej identyfikatorze
 */
export async function selectDataExtractById(extractId: number): Promise<DataExtractRow | undefined> {
    try {
        const row = await db.oneOrNone<DataExtractRow>(
            `SELECT
                extract_id, extracted_on, extract_path
            FROM bulk_extracts
            WHERE extract_id = $1`,
            [extractId]
        );
        return row ?? undefined;
    } catch (err: any) {
        console.error('Error in selectDataExtractById:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        throw new DatabaseError(err?.message);
    }
}
