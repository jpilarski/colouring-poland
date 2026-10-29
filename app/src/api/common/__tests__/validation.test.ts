import { validatePassword, validateUsername, ValidationError } from '../validation';

describe('User Domain Validation', () => {
    describe('validatePassword', () => {
        it('should pass for a valid strong password', () => {
            expect(() => validatePassword('Politechnika2026!')).not.toThrow();
            expect(() => validatePassword('Strong#Pass1')).not.toThrow();
            expect(() => validatePassword('Zaq1@wsxCdE3$rfv')).not.toThrow();
        });

        it('should fail if password is empty or undefined', () => {
            expect(() => validatePassword('')).toThrow(ValidationError);
            expect(() => validatePassword(undefined as any)).toThrow(ValidationError);
        });

        it('should fail if password has less than 10 characters', () => {
            expect(() => validatePassword('Ab1!efgh8')).toThrow('Hasło musi mieć co najmniej 10 znaków.');
        });

        it('should fail if password has more than 128 characters', () => {
            const longPassword = 'A1!' + 'a'.repeat(126);
            expect(() => validatePassword(longPassword)).toThrow('Hasło nie może mieć więcej niż 128 znaków.');
        });

        it('should fail if missing uppercase letter', () => {
            expect(() => validatePassword('politechnika2026!')).toThrow('Hasło musi zawierać co najmniej jedną wielką literę.');
        });

        it('should fail if missing lowercase letter', () => {
            expect(() => validatePassword('POLITECHNIKA2026!')).toThrow('Hasło musi zawierać co najmniej jedną małą literę.');
        });

        it('should fail if missing digit', () => {
            expect(() => validatePassword('PolitechnikaPoznan!')).toThrow('Hasło musi zawierać co najmniej jedną cyfrę.');
        });

        it('should fail if missing special character', () => {
            expect(() => validatePassword('Politechnika2026')).toThrow('Hasło musi zawierać co najmniej jeden znak specjalny.');
        });
    });

    describe('validateUsername', () => {
        it('should pass for a valid username', () => {
            expect(() => validateUsername('kubap')).not.toThrow();
            expect(() => validateUsername('user_123')).not.toThrow();
        });

        it('should fail if username is too short', () => {
            expect(() => validateUsername('abc')).toThrow(ValidationError);
        });

        it('should fail if username contains forbidden characters', () => {
            expect(() => validateUsername('user-name')).toThrow(ValidationError);
            expect(() => validateUsername('user@name')).toThrow(ValidationError);
        });
    });
});
