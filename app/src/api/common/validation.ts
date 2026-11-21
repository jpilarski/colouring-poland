/**
 * User & Account Domain Validation
 *
 * Validates account domain rules:
 * - username format and length (4-30 alphanumeric/underscore chars)
 * - email normalization, format, length, and allowed domain whitelist from ALLOWED_EMAIL_DOMAINS
 * - password complexity (min. 10 chars, upper/lower case, digit, special char)
 */
import { ValidationError } from '../errors';

const EMAIL_FORMAT_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

function getAllowedEmailDomains(): string[] {
    const envDomains = process.env.ALLOWED_EMAIL_DOMAINS;
    if (typeof envDomains !== 'string' || envDomains.trim().length === 0) {
        return [];
    }
    return envDomains
        .split(',')
        .map(d => d.trim().toLowerCase().replace(/^@/, ''))
        .filter(d => d.length > 0 && d !== 'tbd');
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function validateEmail(email: unknown): string {
    if (typeof email !== 'string' || email.trim().length === 0) {
        throw new ValidationError('Adres e-mail jest wymagany.');
    }

    const normalized = normalizeEmail(email);

    if (normalized.length > MAX_EMAIL_LENGTH) {
        throw new ValidationError('Adres e-mail jest zbyt długi (maksymalnie 254 znaki).');
    }

    if (!EMAIL_FORMAT_REGEX.test(normalized)) {
        throw new ValidationError('Nieprawidłowy format adresu e-mail.');
    }

    const allowedDomains = getAllowedEmailDomains();
    if (allowedDomains.length === 0) {
        throw new ValidationError('Rejestracja jest tymczasowo niedostępna (brak skonfigurowanych dozwolonych domen e-mail).');
    }

    const atIndex = normalized.lastIndexOf('@');
    const domain = normalized.slice(atIndex + 1);

    if (!allowedDomains.includes(domain)) {
        const formattedDomains = allowedDomains.map(d => `@${d}`).join(', ');
        throw new ValidationError(
            `Rejestracja jest dostępna wyłącznie dla adresów e-mail w domenach: ${formattedDomains}.`
        );
    }

    return normalized;
}

function validateUsername(username: string): void {
    if (username == undefined) {
        throw new ValidationError('Username is required');
    }
    if (!username.match(/^\w+$/)) {
        throw new ValidationError('Username can only contain alphanumeric characters and underscore');
    }
    if (username.length < 4) {
        throw new ValidationError('Username must be at least 4 characters long');
    }
    if (username.length > 30) {
        throw new ValidationError('Username must be at most 30 characters long');
    }
}

function validatePassword(password: string): void {
    if (!password || password.length === 0) {
        throw new ValidationError('Hasło jest wymagane.');
    }
    if (password.length < 10) {
        throw new ValidationError('Hasło musi mieć co najmniej 10 znaków.');
    }
    if (password.length > 128) {
        throw new ValidationError('Hasło nie może mieć więcej niż 128 znaków.');
    }
    if (!/[A-Z]/.test(password)) {
        throw new ValidationError('Hasło musi zawierać co najmniej jedną wielką literę.');
    }
    if (!/[a-z]/.test(password)) {
        throw new ValidationError('Hasło musi zawierać co najmniej jedną małą literę.');
    }
    if (!/[0-9]/.test(password)) {
        throw new ValidationError('Hasło musi zawierać co najmniej jedną cyfrę.');
    }
    if (!/[^A-Za-z0-9\s]/.test(password)) {
        throw new ValidationError('Hasło musi zawierać co najmniej jeden znak specjalny.');
    }
}

export {
    ValidationError,
    getAllowedEmailDomains,
    normalizeEmail,
    validateEmail,
    validateUsername,
    validatePassword
};
