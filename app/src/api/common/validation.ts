/**
 * User & Account Domain Validation (Warstwa Logiki Domenowej)
 * 
 * Moduł weryfikujący reguły biznesowe dla kont użytkowników:
 * - format i długość nazwy użytkownika (username)
 * - reguły złożoności hasła (Zadanie 1.1.1 z TODO_MASTER.md - standard PP: min. 10 znaków, wielka/mała litera, cyfra, znak specjalny)
 */
import { ValidationError } from '../errors';

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
    validateUsername,
    validatePassword
};
