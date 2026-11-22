import { apiErrorHandler } from '../errorHandler';
import { ApiUserError } from '../api';
import { ConflictError, DatabaseError, InvalidOperationError, NotFoundError, UserError } from '../general';
import { TokenVerificationError, ValidationError } from '../validation';
import { setNoStoreHeaders } from '../../common/securityHeadersConfig';
import authController from '../../auth/authController';
import userController from '../../users/userController';
import searchController from '../../search/searchController';
import extractController from '../../extracts/extractController';
import leaderboardController from '../../leaderboard/leaderboardController';
import buildingCoreController from '../../buildings/controllers/buildingCoreController';
import buildingSpatialController from '../../buildings/controllers/buildingSpatialController';
import buildingVerifyController from '../../buildings/controllers/buildingVerifyController';
import { verifyBuildingAttributes } from '../../buildings/services/verify';
import { validateFieldChange } from '../../buildings/services/domainLogic/validateUpdate';
import { getAutofillOptions } from '../../autofill/autofillService';
import * as userService from '../../users/services/userService';
import * as passwordResetService from '../../users/services/passwordResetService';
import * as searchService from '../../search/searchService';
import * as dataExtractService from '../../extracts/dataExtractService';
import * as leaderboardService from '../../leaderboard/leaderboardService';
import * as buildingService from '../../buildings/services/base';
import * as buildingDataAccess from '../../dataAccess/building';
import * as verifyDataAccess from '../../dataAccess/verify';

jest.mock('../../users/services/userService', () => ({
    authUser: jest.fn(),
    getNewUserAPIKey: jest.fn(),
    logout: jest.fn(),
    createUser: jest.fn(),
    activateUser: jest.fn(),
    getUserById: jest.fn(),
    deleteUser: jest.fn(),
    authAPIUser: jest.fn()
}));

jest.mock('../../users/services/passwordResetService', () => ({
    sendPasswordResetToken: jest.fn(),
    resetPassword: jest.fn()
}));

jest.mock('../../search/searchService', () => ({
    queryLocation: jest.fn()
}));

jest.mock('../../extracts/dataExtractService', () => ({
    listDataExtracts: jest.fn(),
    getDataExtractById: jest.fn()
}));

jest.mock('../../leaderboard/leaderboardService', () => ({
    getLeaders: jest.fn()
}));

jest.mock('../../buildings/services/base', () => ({
    getBuildingById: jest.fn(),
    editBuilding: jest.fn(),
    getBuildingUserAttributesById: jest.fn(),
    getBuildingEditHistory: jest.fn(),
    getLatestRevisionId: jest.fn(),
    queryBuildingsAtPoint: jest.fn(),
    getUserVerifiedAttributes: jest.fn(),
    verifyBuildingAttributes: jest.fn()
}));

jest.mock('../../dataAccess/building', () => ({
    getBuildingData: jest.fn()
}));

jest.mock('../../dataAccess/verify', () => ({
    updateBuildingUserVerifiedAttribute: jest.fn(),
    removeBuildingUserVerifiedAttribute: jest.fn()
}));

const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedPasswordResetService = passwordResetService as jest.Mocked<typeof passwordResetService>;
const mockedSearchService = searchService as jest.Mocked<typeof searchService>;
const mockedExtractService = dataExtractService as jest.Mocked<typeof dataExtractService>;
const mockedLeaderboardService = leaderboardService as jest.Mocked<typeof leaderboardService>;
const mockedBuildingService = buildingService as jest.Mocked<typeof buildingService>;
const mockedBuildingDA = buildingDataAccess as jest.Mocked<typeof buildingDataAccess>;
const mockedVerifyDA = verifyDataAccess as jest.Mocked<typeof verifyDataAccess>;

const flushAsync = () => new Promise(resolve => setTimeout(resolve, 0));

function createMockRes() {
    const res: any = {
        statusCode: 200,
        body: undefined,
        headersSent: false,
        headers: {} as Record<string, string>,
        setHeader: jest.fn((name: string, value: string) => {
            res.headers[name.toLowerCase()] = value;
        }),
        clearCookie: jest.fn(),
        status: jest.fn(),
        send: jest.fn(),
        json: jest.fn()
    };
    res.status.mockImplementation((code: number) => {
        res.statusCode = code;
        return res;
    });
    res.send.mockImplementation((payload: any) => {
        res.body = payload;
        return res;
    });
    res.json.mockImplementation((payload: any) => {
        res.body = payload;
        return res;
    });
    return res;
}

describe('HTTP Status Codes, Cache-Control & API Security Hardening', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;
    const originalOrigin = process.env.WEBAPP_ORIGIN;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.WEBAPP_ORIGIN = 'https://example.org';
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        if (originalOrigin === undefined) {
            delete process.env.WEBAPP_ORIGIN;
        } else {
            process.env.WEBAPP_ORIGIN = originalOrigin;
        }
    });

    describe('setNoStoreHeaders helper', () => {
        it('sets Cache-Control: no-store and Pragma: no-cache', () => {
            const res = createMockRes();
            setNoStoreHeaders(res);
            expect(res.headers['cache-control']).toBe('no-store');
            expect(res.headers['pragma']).toBe('no-cache');
        });
    });

    describe('authController.login semantic HTTP statuses & no internal field leakage', () => {
        it('returns 401 with no-store on invalid credentials without exposing statusCode', async () => {
            mockedUserService.authUser.mockResolvedValue({
                error: 'Niepoprawny login lub hasło.',
                statusCode: 401
            });
            const req: any = { body: { username: 'test_user', password: 'wrong' }, session: {} };
            const res = createMockRes();

            authController.login(req, res, jest.fn());
            await flushAsync();

            expect(res.statusCode).toBe(401);
            expect(res.headers['cache-control']).toBe('no-store');
            expect(res.body).toEqual({ error: 'Niepoprawny login lub hasło.' });
            expect(res.body.statusCode).toBeUndefined();
        });

        it('returns 429 with Retry-After header on brute-force lockout without exposing retryAfterSeconds in body', async () => {
            mockedUserService.authUser.mockResolvedValue({
                error: 'Account locked',
                statusCode: 429,
                retryAfterSeconds: 900
            });
            const req: any = { body: { username: 'test_user', password: 'wrong' }, session: {} };
            const res = createMockRes();

            authController.login(req, res, jest.fn());
            await flushAsync();

            expect(res.statusCode).toBe(429);
            expect(res.headers['retry-after']).toBe('900');
            expect(res.headers['cache-control']).toBe('no-store');
            expect(res.body).toEqual({ error: 'Account locked' });
            expect(res.body.retryAfterSeconds).toBeUndefined();
            expect(res.body.statusCode).toBeUndefined();
        });

        it('returns 403 for inactive or blocked account', async () => {
            mockedUserService.authUser.mockResolvedValue({
                error: 'Account not activated',
                statusCode: 403
            });
            const req: any = { body: { username: 'test_user', password: 'ExamplePass2026!' }, session: {} };
            const res = createMockRes();

            authController.login(req, res, jest.fn());
            await flushAsync();

            expect(res.statusCode).toBe(403);
            expect(res.headers['cache-control']).toBe('no-store');
            expect(res.body).toEqual({ error: 'Account not activated' });
        });

        it('returns 200 with no-store and sets session user_id on success', async () => {
            mockedUserService.authUser.mockResolvedValue({
                user_id: '00000000-0000-4000-8000-000000000001'
            });
            const req: any = { body: { username: 'test_user', password: 'ExamplePass2026!' }, session: {} };
            const res = createMockRes();

            authController.login(req, res, jest.fn());
            await flushAsync();

            expect(res.statusCode).toBe(200);
            expect(res.headers['cache-control']).toBe('no-store');
            expect(req.session.user_id).toBe('00000000-0000-4000-8000-000000000001');
            expect(res.body).toEqual({ user_id: '00000000-0000-4000-8000-000000000001' });
        });
    });

    describe('Error leakage prevention (no raw Error objects in responses) & 401 enforcement', () => {
        it('authController.generateApiKey returns 401 without session and 500 without leaking raw Error on failure', async () => {
            const unauthRes = createMockRes();
            authController.generateApiKey({ session: {} } as any, unauthRes, jest.fn());
            await flushAsync();
            expect(unauthRes.statusCode).toBe(401);
            expect(unauthRes.headers['cache-control']).toBe('no-store');

            const secretErr = Object.assign(new Error('SQL syntax error'), { code: '42601', query: 'SELECT secret' });
            mockedUserService.getNewUserAPIKey.mockRejectedValueOnce(secretErr);
            const errRes = createMockRes();
            authController.generateApiKey({ session: { user_id: 'uid-1' } } as any, errRes, jest.fn());
            await flushAsync();
            expect(errRes.statusCode).toBe(500);
            expect(errRes.body).toEqual({ error: 'Failed to generate API key.' });
            expect(JSON.stringify(errRes.body)).not.toContain('SQL syntax');
            expect(JSON.stringify(errRes.body)).not.toContain('SELECT secret');
        });

        it('userController.getCurrentUser returns 401 without session, cleans stale session when user missing, and returns safe 500 on DB failure', async () => {
            const unauthRes = createMockRes();
            userController.getCurrentUser({ session: {} } as any, unauthRes, jest.fn());
            await flushAsync();
            expect(unauthRes.statusCode).toBe(401);
            expect(unauthRes.headers['cache-control']).toBe('no-store');

            mockedUserService.getUserById.mockResolvedValueOnce(undefined);
            mockedUserService.logout.mockResolvedValueOnce(undefined);
            const staleReq: any = { session: { user_id: 'deleted-uid' }, app: { get: jest.fn().mockReturnValue('development') } };
            const staleRes = createMockRes();
            userController.getCurrentUser(staleReq, staleRes, jest.fn());
            await flushAsync();
            expect(staleRes.statusCode).toBe(401);
            expect(mockedUserService.logout).toHaveBeenCalledWith(staleReq.session);
            expect(staleRes.clearCookie).toHaveBeenCalled();

            mockedUserService.getUserById.mockRejectedValueOnce(new DatabaseError('connection reset'));
            const dbErrRes = createMockRes();
            userController.getCurrentUser({ session: { user_id: 'uid-1' } } as any, dbErrRes, jest.fn());
            await flushAsync();
            expect(dbErrRes.statusCode).toBe(500);
            expect(dbErrRes.body).toEqual({ error: 'Server error' });
            expect(JSON.stringify(dbErrRes.body)).not.toContain('connection reset');
        });

        it('searchController.searchLocations returns 400 on missing/blank query and forwards DB errors to next() without res.send(error)', async () => {
            const emptyRes = createMockRes();
            searchController.searchLocations({ query: { q: '   ' } } as any, emptyRes, jest.fn());
            await flushAsync();
            expect(emptyRes.statusCode).toBe(400);
            expect(emptyRes.body).toEqual({ error: 'Please provide a search term' });

            const dbErr = new DatabaseError('pg down');
            mockedSearchService.queryLocation.mockRejectedValueOnce(dbErr);
            const failRes = createMockRes();
            const next = jest.fn();
            searchController.searchLocations({ query: { q: 'Poznan' } } as any, failRes, next);
            await flushAsync();
            expect(failRes.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(dbErr);
        });
    });

    describe('userController.createUser & resetPassword HTTP status codes', () => {
        it('returns 409 on duplicate registration and 503 on SMTP delivery failure', async () => {
            mockedUserService.createUser.mockResolvedValueOnce({
                error: 'Email already registered',
                statusCode: 409
            });
            const req: any = {
                session: {},
                body: {
                    username: 'test_user',
                    email: 'user@example.org',
                    confirm_email: 'user@example.org',
                    password: 'ExamplePass2026!'
                }
            };
            const dupRes = createMockRes();
            userController.createUser(req, dupRes, jest.fn());
            await flushAsync();
            expect(dupRes.statusCode).toBe(409);
            expect(dupRes.headers['cache-control']).toBe('no-store');
            expect(dupRes.body).toEqual({ error: 'Email already registered' });

            mockedUserService.createUser.mockResolvedValueOnce({
                error: 'SMTP unavailable',
                statusCode: 503
            });
            const smtpRes = createMockRes();
            userController.createUser(req, smtpRes, jest.fn());
            await flushAsync();
            expect(smtpRes.statusCode).toBe(503);
            expect(smtpRes.body).toEqual({ error: 'SMTP unavailable' });
        });

        it('returns 400 for invalid stage-2 resetPassword requests and 202 for stage-1', async () => {
            const resEmpty = createMockRes();
            userController.resetPassword({ body: {}, session: {} } as any, resEmpty, jest.fn());
            await flushAsync();
            expect(resEmpty.statusCode).toBe(400);
            expect(resEmpty.headers['cache-control']).toBe('no-store');

            const resNoPass = createMockRes();
            userController.resetPassword({ body: { token: 'abc' }, session: {} } as any, resNoPass, jest.fn());
            await flushAsync();
            expect(resNoPass.statusCode).toBe(400);

            mockedPasswordResetService.resetPassword.mockRejectedValueOnce(new TokenVerificationError('invalid'));
            const resBadTok = createMockRes();
            userController.resetPassword({ body: { token: 'abc', password: 'ExamplePass2026!' }, session: {} } as any, resBadTok, jest.fn());
            await flushAsync();
            expect(resBadTok.statusCode).toBe(400);
            expect(resBadTok.body).toEqual({ error: 'Could not verify token' });

            mockedPasswordResetService.resetPassword.mockRejectedValueOnce(new ValidationError('Weak password'));
            const resWeakPass = createMockRes();
            userController.resetPassword({ body: { token: 'abc', password: 'weak' }, session: {} } as any, resWeakPass, jest.fn());
            await flushAsync();
            expect(resWeakPass.statusCode).toBe(400);
            expect(resWeakPass.body).toEqual({ error: 'Weak password' });

            mockedPasswordResetService.sendPasswordResetToken.mockResolvedValueOnce(undefined);
            const resStage1 = createMockRes();
            userController.resetPassword({ body: { email: 'user@example.org' }, session: {} } as any, resStage1, jest.fn());
            await flushAsync();
            expect(resStage1.statusCode).toBe(202);
            expect(resStage1.body).toEqual({ success: true });
        });
    });

    describe('apiErrorHandler mappings & safe server logging', () => {
        it('maps malformed JSON to 400 and oversized payloads to 413', () => {
            const parseErr: any = new SyntaxError('Unexpected token');
            parseErr.status = 400;
            parseErr.type = 'entity.parse.failed';
            const res400 = createMockRes();
            apiErrorHandler(parseErr, {} as any, res400, jest.fn());
            expect(res400.statusCode).toBe(400);
            expect(res400.body).toEqual({ error: 'Invalid JSON payload' });

            const largeErr: any = new Error('request entity too large');
            largeErr.status = 413;
            largeErr.type = 'entity.too.large';
            const res413 = createMockRes();
            apiErrorHandler(largeErr, {} as any, res413, jest.fn());
            expect(res413.statusCode).toBe(413);
            expect(res413.body).toEqual({ error: 'Request payload too large' });
        });

        it('maps NotFoundError to 404, ConflictError/InvalidOperationError to 409, and UserError to 400', () => {
            const res404 = createMockRes();
            apiErrorHandler(new NotFoundError('Building ID 999 does not exist'), {} as any, res404, jest.fn());
            expect(res404.statusCode).toBe(404);
            expect(res404.body).toEqual({ error: 'Building ID 999 does not exist' });

            const res409a = createMockRes();
            apiErrorHandler(new ConflictError('Value mismatch'), {} as any, res409a, jest.fn());
            expect(res409a.statusCode).toBe(409);

            const res409b = createMockRes();
            apiErrorHandler(new InvalidOperationError('Already verified'), {} as any, res409b, jest.fn());
            expect(res409b.statusCode).toBe(409);

            const res400 = createMockRes();
            apiErrorHandler(new UserError('Invalid payload'), {} as any, res400, jest.fn());
            expect(res400.statusCode).toBe(400);
        });

        it('logs only safe error fields and never dumps raw error objects with SQL queries', () => {
            const rawPgErr: any = Object.assign(new Error('connection failed'), {
                code: '08006',
                query: "SELECT crypt('SuperSecretPass!', pass) FROM users"
            });
            const res500 = createMockRes();
            apiErrorHandler(rawPgErr, {} as any, res500, jest.fn());

            expect(res500.statusCode).toBe(500);
            expect(res500.body).toEqual({ error: 'Server error' });
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            const loggedText = consoleErrorSpy.mock.calls[0].map(String).join(' ');
            expect(loggedText).toContain('08006');
            expect(loggedText).not.toContain('SuperSecretPass!');
        });
    });

    describe('Prototype-key safety & domain error types (verify, autofill, validateUpdate)', () => {
        it('rejects prototype keys and unknown fields in autofillService with ApiUserError (400)', () => {
            expect(() => getAutofillOptions('toString', 'a', false)).toThrow(ApiUserError);
            expect(() => getAutofillOptions('constructor', 'a', false)).toThrow(ApiUserError);
            expect(() => getAutofillOptions('nonexistent', 'a', false)).toThrow(ApiUserError);
        });

        it('rejects prototype keys in validateFieldChange with InvalidFieldError', () => {
            expect(() => validateFieldChange('toString', 'x', true)).toThrow('Field does not exist');
            expect(() => validateFieldChange('constructor', 'x', true)).toThrow('Field does not exist');
        });

        it('rejects invalid payloads, prototype keys, value mismatches (ConflictError), and duplicate verifications (InvalidOperationError) in verifyBuildingAttributes', async () => {
            await expect(verifyBuildingAttributes(1, 'uid-1', null as any)).rejects.toThrow(UserError);
            await expect(verifyBuildingAttributes(1, 'uid-1', [] as any)).rejects.toThrow(UserError);

            mockedBuildingDA.getBuildingData.mockResolvedValue({
                lokalizacja_id_budynku: 1,
                typologia_ilosc_kondygnacji: 3
            } as any);

            await expect(verifyBuildingAttributes(1, 'uid-1', { toString: 'x' })).rejects.toThrow(UserError);
            await expect(verifyBuildingAttributes(1, 'uid-1', { typologia_ilosc_kondygnacji: 5 })).rejects.toThrow(ConflictError);

            mockedVerifyDA.updateBuildingUserVerifiedAttribute.mockRejectedValueOnce(
                new InvalidOperationError('User already verified that attribute for this building')
            );
            await expect(verifyBuildingAttributes(1, 'uid-1', { typologia_ilosc_kondygnacji: 3 })).rejects.toThrow(InvalidOperationError);
        });
    });

    describe('Spatial, Building, Verify, Extract, and Leaderboard controllers', () => {
        it('buildingSpatialController rejects invalid coordinates with 400', async () => {
            for (const query of [
                { lat: 'abc', lng: '20' },
                { lat: '999', lng: '20' },
                { lat: '52', lng: '200' },
                { lat: '', lng: '20' }
            ]) {
                const res = createMockRes();
                buildingSpatialController.getBuildingsByLocation({ query } as any, res, jest.fn());
                await flushAsync();
                expect(res.statusCode).toBe(400);
            }
            expect(mockedBuildingService.queryBuildingsAtPoint).not.toHaveBeenCalled();
        });

        it('buildingCoreController and buildingVerifyController enforce 401 and no-store when unauthenticated', async () => {
            const res1 = createMockRes();
            buildingCoreController.getBuildingById({ params: { lokalizacja_id_budynku: '42' }, query: { user_attributes: 'true' }, session: {} } as any, res1, jest.fn());
            await flushAsync();
            expect(res1.statusCode).toBe(401);
            expect(res1.headers['cache-control']).toBe('no-store');

            const res2 = createMockRes();
            buildingCoreController.updateBuildingById({ params: { lokalizacja_id_budynku: '42' }, query: {}, body: {}, session: {} } as any, res2, jest.fn());
            await flushAsync();
            expect(res2.statusCode).toBe(401);
            expect(res2.headers['cache-control']).toBe('no-store');

            const res3 = createMockRes();
            buildingVerifyController.getUserVerifiedAttributes({ params: { lokalizacja_id_budynku: '42' }, session: {} } as any, res3, jest.fn());
            await flushAsync();
            expect(res3.statusCode).toBe(401);
            expect(res3.headers['cache-control']).toBe('no-store');

            const res4 = createMockRes();
            buildingVerifyController.verifyBuildingAttributes({ params: { lokalizacja_id_budynku: '42' }, body: {}, session: {} } as any, res4, jest.fn());
            await flushAsync();
            expect(res4.statusCode).toBe(401);
            expect(res4.headers['cache-control']).toBe('no-store');
        });

        it('extractController.getDataExtract returns 404 when extract does not exist', async () => {
            mockedExtractService.getDataExtractById.mockResolvedValueOnce(undefined);
            const res = createMockRes();
            extractController.getDataExtract({ params: { extract_id: '999' } } as any, res, jest.fn());
            await flushAsync();
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Data extract not found' });
        });

        it('leaderboardController rejects invalid number_limit/time_limit with 400 and allows valid values', async () => {
            const badRes1 = createMockRes();
            leaderboardController.getLeaders({ query: { number_limit: 'abc' } } as any, badRes1, jest.fn());
            await flushAsync();
            expect(badRes1.statusCode).toBe(400);

            const badRes2 = createMockRes();
            leaderboardController.getLeaders({ query: { time_limit: 'yesterday' } } as any, badRes2, jest.fn());
            await flushAsync();
            expect(badRes2.statusCode).toBe(400);

            mockedLeaderboardService.getLeaders.mockResolvedValueOnce([]);
            const okRes = createMockRes();
            leaderboardController.getLeaders({ query: { number_limit: '10', time_limit: '-1' } } as any, okRes, jest.fn());
            await flushAsync();
            expect(okRes.statusCode).toBe(200);
            expect(mockedLeaderboardService.getLeaders).toHaveBeenCalledWith(10, -1);
        });
    });
});
