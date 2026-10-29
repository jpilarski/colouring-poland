import React, { useState, useEffect, useCallback } from 'react';
import { leaderboardApi } from '../api';
import type { Leader } from '../api';

export const LeaderboardPage: React.FC = () => {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [fetching, setFetching] = useState<boolean>(false);
    const [numberLimit, setNumberLimit] = useState<number>(10);
    const [timeLimit, setTimeLimit] = useState<number>(-1);

    const fetchLeaders = useCallback(async (num: number, time: number) => {
        setFetching(true);
        try {
            const data = await leaderboardApi.getLeaders(num, time);
            if (data && data.leaders) {
                setLeaders(data.leaders);
            } else {
                setLeaders([]);
            }
        } catch (err) {
            console.error(err);
            setLeaders([]);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaders(numberLimit, timeLimit);
    }, [fetchLeaders, numberLimit, timeLimit]);

    const handleNumberLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setNumberLimit(val);
    };

    const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setTimeLimit(val);
    };

    return (
        <article>
            <section className="main-col">
                <h1 className="h2">Leaderboard</h1>
                <form>
                    <label>Select number of users to be displayed</label>
                    <div className="form-group">
                        <div className="form-check-inline">
                            <input
                                type="radio"
                                name="number_limit"
                                id="number_10"
                                className="form-check-input"
                                value="10"
                                onChange={handleNumberLimitChange}
                                checked={numberLimit === 10}
                            />
                            <label className="form-check-label" htmlFor="number_10">10</label>
                        </div>
                        <div className="form-check-inline">
                            <input
                                type="radio"
                                name="number_limit"
                                id="number_100"
                                className="form-check-input"
                                value="100"
                                onChange={handleNumberLimitChange}
                                checked={numberLimit === 100}
                            />
                            <label className="form-check-label" htmlFor="number_100">100</label>
                        </div>
                    </div>
                    <label>Select time period</label>
                    <div className="form-group">
                        <div className="form-check-inline">
                            <input
                                type="radio"
                                name="time_limit"
                                id="time_all"
                                className="form-check-input"
                                value="-1"
                                onChange={handleTimeLimitChange}
                                checked={timeLimit === -1}
                            />
                            <label className="form-check-label" htmlFor="time_all">All time</label>
                        </div>
                        <div className="form-check-inline">
                            <input
                                type="radio"
                                name="time_limit"
                                id="time_7"
                                className="form-check-input"
                                value="7"
                                onChange={handleTimeLimitChange}
                                checked={timeLimit === 7}
                            />
                            <label className="form-check-label" htmlFor="time_7">Last 7 days</label>
                        </div>
                        <div className="form-check-inline">
                            <input
                                type="radio"
                                name="time_limit"
                                id="time_30"
                                className="form-check-input"
                                value="30"
                                onChange={handleTimeLimitChange}
                                checked={timeLimit === 30}
                            />
                            <label className="form-check-label" htmlFor="time_30">Last 30 days</label>
                        </div>
                    </div>
                </form>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Username</th>
                            <th scope="col">Contributions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((u, i) => (
                            <tr key={u.username}>
                                <th scope="row">{i + 1}</th>
                                <td>{u.username}</td>
                                <td>{u.number_edits.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </article>
    );
};

export default LeaderboardPage;
