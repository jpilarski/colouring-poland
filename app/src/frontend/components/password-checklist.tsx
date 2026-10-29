import React from 'react';

export interface PasswordRule {
    label: string;
    valid: boolean;
}

export function getPasswordRules(password: string): PasswordRule[] {
    const p = password || '';
    return [
        { label: 'At least 10 characters (min. 10 znaków)', valid: p.length >= 10 && p.length <= 128 },
        { label: 'At least one uppercase letter (wielka litera: A-Z)', valid: /[A-Z]/.test(p) },
        { label: 'At least one lowercase letter (mała litera: a-z)', valid: /[a-z]/.test(p) },
        { label: 'At least one number (cyfra: 0-9)', valid: /[0-9]/.test(p) },
        { label: 'At least one special character (znak specjalny: !@#$%^&*...)', valid: /[^A-Za-z0-9\s]/.test(p) },
    ];
}

export function isPasswordValid(password: string): boolean {
    return getPasswordRules(password).every(r => r.valid);
}

interface PasswordChecklistProps {
    password: string;
}

export const PasswordChecklist: React.FC<PasswordChecklistProps> = ({ password }) => {
    const rules = getPasswordRules(password);

    return (
        <div className="password-requirements my-2 p-2 border rounded bg-light" style={{ fontSize: '0.85rem' }}>
            <div className="fw-bold mb-1" style={{ fontWeight: 600 }}>Password requirements / Wymagania dotyczące hasła:</div>
            <ul className="list-unstyled mb-0" style={{ paddingLeft: '0.5rem', marginBottom: 0 }}>
                {rules.map((rule, idx) => (
                    <li key={idx} style={{ color: rule.valid ? '#198754' : '#6c757d', fontWeight: rule.valid ? 500 : 400 }}>
                        <span style={{ display: 'inline-block', width: '1.2rem', fontWeight: 'bold' }}>
                            {rule.valid ? '✓' : '○'}
                        </span>
                        {rule.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordChecklist;
