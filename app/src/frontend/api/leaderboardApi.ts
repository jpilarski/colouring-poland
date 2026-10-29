import { apiGet } from './apiClient';

export interface Leader {
    number_edits: number;
    username: string;
}

export interface LeaderboardResponse {
    leaders: Leader[];
    error?: string;
}

export const leaderboardApi = {
    getLeaders: (numberLimit: number, timeLimit: number): Promise<LeaderboardResponse> => {
        return apiGet<LeaderboardResponse>(
            `/api/leaderboard/leaders?number_limit=${numberLimit}&time_limit=${timeLimit}`
        );
    }
};
