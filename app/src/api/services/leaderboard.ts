import {
    LeaderboardRow,
    selectLeadersAllTime,
    selectLeadersWithTimeLimit
} from '../dataAccess/leaderboard';

export interface LeaderEntry {
    username: string;
    number_edits: number;
}

async function getLeaders(numberLimit: number, timeLimit: number): Promise<LeaderEntry[]> {
    // Hard constraint on number of users returned
    const maxLimit = 100;
    const effectiveLimit = Math.min(numberLimit, maxLimit);

    let leaders: LeaderboardRow[];
    if (timeLimit > 0) {
        leaders = await selectLeadersWithTimeLimit(timeLimit, effectiveLimit);
    } else {
        leaders = await selectLeadersAllTime(effectiveLimit);
    }

    return leaders.map(d => ({
        username: d.username,
        number_edits: Number(d.number_edits)
    }));
}

export {
    getLeaders
};
