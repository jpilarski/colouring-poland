import db from '../../db';

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
    } catch (err) {
        console.error('Error in selectAllDataExtracts:', err);
        return undefined;
    }
}

/**
 * Pobiera metadane pojedynczej paczki danych po jej identyfikatorze
 */
export async function selectDataExtractById(extractId: number): Promise<DataExtractRow> {
    try {
        return await db.one<DataExtractRow>(
            `SELECT 
                extract_id, extracted_on, extract_path
            FROM bulk_extracts
            WHERE extract_id = $1`,
            [extractId]
        );
    } catch (err) {
        console.error('Error in selectDataExtractById:', err);
        return undefined;
    }
}

