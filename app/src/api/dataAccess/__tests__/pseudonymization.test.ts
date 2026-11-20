import db from '../../../db';
import { getHistoryAfterId, getHistoryBeforeId, selectBuildingEditHistory } from '../editHistory';
import { selectLeadersAllTime, selectLeadersWithTimeLimit } from '../leaderboard';

jest.mock('../../../db', () => ({
    __esModule: true,
    default: {
        any: jest.fn(),
        manyOrNone: jest.fn(),
        oneOrNone: jest.fn()
    }
}));

const mockedDb = db as unknown as {
    any: jest.Mock;
    manyOrNone: jest.Mock;
};

describe('Public Edit History & Leaderboard Pseudonymization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedDb.any.mockResolvedValue([]);
        mockedDb.manyOrNone.mockResolvedValue([]);
    });

    it('uses pseudonymized UUID prefix and does not join users in getHistoryBeforeId', async () => {
        await getHistoryBeforeId(undefined as any, 10, false);

        const sql: string = mockedDb.any.mock.calls[0][0];
        expect(sql).toContain("concat('Użytkownik #', substring(cast(logs.user_id as text) from 1 for 8)) as username");
        expect(sql).not.toMatch(/JOIN\s+users/i);
    });

    it('uses pseudonymized UUID prefix and does not join users in getHistoryAfterId', async () => {
        await getHistoryAfterId('100', 10, false);

        const sql: string = mockedDb.any.mock.calls[0][0];
        expect(sql).toContain("concat('Użytkownik #', substring(cast(logs.user_id as text) from 1 for 8)) as username");
        expect(sql).not.toMatch(/JOIN\s+users/i);
    });

    it('uses pseudonymized UUID prefix and does not query users table in selectBuildingEditHistory', async () => {
        await selectBuildingEditHistory(42);

        const sql: string = mockedDb.manyOrNone.mock.calls[0][0];
        expect(sql).toContain("concat('Użytkownik #', substring(cast(logs.user_id as text) from 1 for 8)) as username");
        expect(sql).not.toMatch(/FROM\s+logs\s*,\s*users/i);
        expect(sql).not.toMatch(/JOIN\s+users/i);
    });

    it('pseudonymizes usernames and groups by logs.user_id in selectLeadersWithTimeLimit', async () => {
        await selectLeadersWithTimeLimit(30, 10);

        const sql: string = mockedDb.manyOrNone.mock.calls[0][0];
        expect(sql).toContain("concat('Użytkownik #', substring(cast(logs.user_id as text) from 1 for 8)) as username");
        expect(sql).toContain('GROUP BY logs.user_id');
        expect(sql).not.toContain('GROUP by users.username');
    });

    it('pseudonymizes usernames and groups by logs.user_id in selectLeadersAllTime', async () => {
        await selectLeadersAllTime(10);

        const sql: string = mockedDb.manyOrNone.mock.calls[0][0];
        expect(sql).toContain("concat('Użytkownik #', substring(cast(logs.user_id as text) from 1 for 8)) as username");
        expect(sql).toContain('GROUP BY logs.user_id');
        expect(sql).not.toContain('GROUP by users.username');
    });
});
