export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class TokenVerificationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenVerificationError';
    }
}
