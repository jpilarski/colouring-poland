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
    const maxLimit = 100;
    const effectiveLimit = Math.min(Number(numberLimit) || 50, maxLimit);
    const effectiveTime = Number(timeLimit) || 0;

    let leaders: LeaderboardRow[];
    if (effectiveTime > 0) {
        leaders = await selectLeadersWithTimeLimit(effectiveTime, effectiveLimit);
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
