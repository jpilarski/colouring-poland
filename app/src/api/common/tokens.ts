import crypto from 'crypto';

/**
 * Computes a lowercase 64-character hexadecimal SHA-256 digest of a raw secret token.
 */
export function hashTokenSha256(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generates a high-entropy API key (192 bits of randomness) with a recognizable prefix.
 */
export function generateApiKey(): string {
    return `cp_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Generates a high-entropy password reset token (256 bits of randomness).
 */
export function generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}
