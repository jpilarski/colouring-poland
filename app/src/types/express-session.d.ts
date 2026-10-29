import 'express-session';

declare module 'express-session' {
    interface SessionData {
        user_id: string;
    }
}

declare global {
    interface NodeModule {
        hot?: {
            accept(path?: string, callback?: () => void): void;
        };
    }
}
