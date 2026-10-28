import db from '../../db';

export interface LeaderboardRow {
    username: string;
    number_edits: string | number;
}

/**
 * Pobiera ranking najbardziej aktywnych użytkowników z zadanego przedziału dni (time_limit)
 */
export async function selectLeadersWithTimeLimit(timeLimit: number, numberLimit: number): Promise<LeaderboardRow[]> {
    try {
        return await db.manyOrNone<LeaderboardRow>(
            `SELECT count(log_id) as number_edits, username
            FROM logs, users
            WHERE logs.user_id = users.user_id
            AND CURRENT_TIMESTAMP::DATE - log_timestamp::DATE <= $1
                    AND NOT (users.username = 'casa_friendly_robot')
                    AND NOT (users.username = 'colouringlondon')
            GROUP by users.username
            ORDER BY number_edits DESC
            LIMIT $2`,
            [timeLimit, numberLimit]
        );
    } catch (error) {
        console.error('Error in selectLeadersWithTimeLimit:', error);
        return [];
    }
}

/**
 * Pobiera ranking najbardziej aktywnych użytkowników wszech czasów
 */
export async function selectLeadersAllTime(numberLimit: number): Promise<LeaderboardRow[]> {
    try {
        return await db.manyOrNone<LeaderboardRow>(
            `SELECT count(log_id) as number_edits, username
            FROM logs, users
            WHERE logs.user_id = users.user_id
                    AND NOT (users.username = 'casa_friendly_robot')
                    AND NOT (users.username = 'colouringlondon')
            GROUP by users.username
            ORDER BY number_edits DESC
            LIMIT $1`,
            [numberLimit]
        );
    } catch (error) {
        console.error('Error in selectLeadersAllTime:', error);
        return [];
    }
}

