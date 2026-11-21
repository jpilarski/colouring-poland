import {
    getAllowedEmailDomains,
    normalizeEmail,
    validateEmail,
    validatePassword,
    validateUsername,
    ValidationError
} from '../validation';

describe('User Domain Validation', () => {
    describe('validatePassword', () => {
        it('should pass for a valid strong password', () => {
            expect(() => validatePassword('ExamplePass2026!')).not.toThrow();
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
            expect(() => validatePassword('examplepass2026!')).toThrow('Hasło musi zawierać co najmniej jedną wielką literę.');
        });

        it('should fail if missing lowercase letter', () => {
            expect(() => validatePassword('EXAMPLEPASS2026!')).toThrow('Hasło musi zawierać co najmniej jedną małą literę.');
        });

        it('should fail if missing digit', () => {
            expect(() => validatePassword('ExamplePassword!')).toThrow('Hasło musi zawierać co najmniej jedną cyfrę.');
        });

        it('should fail if missing special character', () => {
            expect(() => validatePassword('ExamplePass2026')).toThrow('Hasło musi zawierać co najmniej jeden znak specjalny.');
        });
    });

    describe('validateUsername', () => {
        it('should pass for a valid username', () => {
            expect(() => validateUsername('test_user')).not.toThrow();
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

    describe('validateEmail and normalizeEmail', () => {
        const originalAllowedDomains = process.env.ALLOWED_EMAIL_DOMAINS;

        beforeEach(() => {
            process.env.ALLOWED_EMAIL_DOMAINS = 'example.edu,student.example.edu,institute.org';
        });

        afterEach(() => {
            if (originalAllowedDomains === undefined) {
                delete process.env.ALLOWED_EMAIL_DOMAINS;
            } else {
                process.env.ALLOWED_EMAIL_DOMAINS = originalAllowedDomains;
            }
        });

        it('normalizes email by trimming whitespace and lowercasing', () => {
            expect(normalizeEmail('  User.Name@EXAMPLE.EDU  ')).toBe('user.name@example.edu');
        });

        it('accepts emails from configured allowed domains and returns normalized value', () => {
            expect(validateEmail('  Test.User@example.edu ')).toBe('test.user@example.edu');
            expect(validateEmail('USER_1@STUDENT.EXAMPLE.EDU')).toBe('user_1@student.example.edu');
            expect(validateEmail('contact@institute.org')).toBe('contact@institute.org');
        });

        it('rejects empty, missing, malformed, or overly long email addresses', () => {
            expect(() => validateEmail('')).toThrow(ValidationError);
            expect(() => validateEmail('   ')).toThrow(ValidationError);
            expect(() => validateEmail(null)).toThrow(ValidationError);
            expect(() => validateEmail(undefined)).toThrow(ValidationError);
            expect(() => validateEmail('not-an-email')).toThrow(ValidationError);
            expect(() => validateEmail('user@')).toThrow(ValidationError);
            const tooLong = `${'a'.repeat(245)}@example.edu`;
            expect(() => validateEmail(tooLong)).toThrow(ValidationError);
        });

        it('rejects disallowed domains and lookalike suffix/subdomain spoofing', () => {
            expect(() => validateEmail('user@gmail.com')).toThrow(ValidationError);
            expect(() => validateEmail('user@evilexample.edu')).toThrow(ValidationError);
            expect(() => validateEmail('user@sub.example.edu')).toThrow(ValidationError);
            expect(() => validateEmail('user@example.edu.evil.com')).toThrow(ValidationError);
        });

        it('fails closed when ALLOWED_EMAIL_DOMAINS is unset or placeholder tbd', () => {
            delete process.env.ALLOWED_EMAIL_DOMAINS;
            expect(getAllowedEmailDomains()).toEqual([]);
            expect(() => validateEmail('user@example.edu')).toThrow(ValidationError);

            process.env.ALLOWED_EMAIL_DOMAINS = 'tbd';
            expect(getAllowedEmailDomains()).toEqual([]);
            expect(() => validateEmail('user@example.edu')).toThrow(ValidationError);
        });

        it('parses whitespace and optional leading @ in ALLOWED_EMAIL_DOMAINS', () => {
            process.env.ALLOWED_EMAIL_DOMAINS = ' example.org , @test.example.net ';
            expect(getAllowedEmailDomains()).toEqual(['example.org', 'test.example.net']);
            expect(validateEmail('user@example.org')).toBe('user@example.org');
            expect(() => validateEmail('user@example.edu')).toThrow(ValidationError);
        });
    });
});
