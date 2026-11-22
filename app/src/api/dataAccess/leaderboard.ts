import db from '../../db';
import { DatabaseError } from '../errors';

export interface LeaderboardRow {
    username: string;
    number_edits: string | number;
}

const PSEUDONYM_SQL = "concat('Użytkownik #', substring(cast(logs.user_id as text) from 1 for 8)) as username";

/**
 * Pobiera ranking najbardziej aktywnych użytkowników z zadanego przedziału dni (time_limit)
 * z pseudonimizacją identyfikatora użytkownika (bez ujawniania jawnego loginu)
 */
export async function selectLeadersWithTimeLimit(timeLimit: number, numberLimit: number): Promise<LeaderboardRow[]> {
    try {
        return await db.manyOrNone<LeaderboardRow>(
            `SELECT
                count(logs.log_id) as number_edits,
                ${PSEUDONYM_SQL}
            FROM logs
            JOIN users ON logs.user_id = users.user_id
            WHERE CURRENT_TIMESTAMP::DATE - logs.log_timestamp::DATE <= $1
                AND NOT (users.username = 'casa_friendly_robot')
                AND NOT (users.username = 'colouringlondon')
            GROUP BY logs.user_id
            ORDER BY number_edits DESC
            LIMIT $2`,
            [timeLimit, numberLimit]
        );
    } catch (error: any) {
        console.error('Error in selectLeadersWithTimeLimit:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        throw new DatabaseError(error?.message);
    }
}

/**
 * Pobiera ranking najbardziej aktywnych użytkowników wszech czasów
 * z pseudonimizacją identyfikatora użytkownika (bez ujawniania jawnego loginu)
 */
export async function selectLeadersAllTime(numberLimit: number): Promise<LeaderboardRow[]> {
    try {
        return await db.manyOrNone<LeaderboardRow>(
            `SELECT
                count(logs.log_id) as number_edits,
                ${PSEUDONYM_SQL}
            FROM logs
            JOIN users ON logs.user_id = users.user_id
            WHERE NOT (users.username = 'casa_friendly_robot')
                AND NOT (users.username = 'colouringlondon')
            GROUP BY logs.user_id
            ORDER BY number_edits DESC
            LIMIT $1`,
            [numberLimit]
        );
    } catch (error: any) {
        console.error('Error in selectLeadersAllTime:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        throw new DatabaseError(error?.message);
    }
}
