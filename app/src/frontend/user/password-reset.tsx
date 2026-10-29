import React, { FormEvent } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import ErrorBox from '../components/error-box';

interface PasswordResetState {
    error: string;
    success: boolean;
    token: string;
    password: string;
    confirmPassword: string;
}

export default class PasswordReset extends React.Component<RouteComponentProps, PasswordResetState> {

    static tokenMissingMessage = 'Password reset token is missing. Make sure to follow the link from a password reset email!';

    constructor(props: RouteComponentProps) {
        super(props);

        this.state = {
            error: undefined,
            success: undefined,
            token: undefined,
            password: '',
            confirmPassword: ''
        };
    }

    componentDidMount(): void {
        const queryParams = new URLSearchParams(this.props.location.search);
        const token = queryParams.get('token');
        if (token == undefined) {
            this.setState({ error: PasswordReset.tokenMissingMessage });
        } else {
            this.setState({ token: token });
        }
    }

    handleChange(event: FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        this.setState({
            [name]: value,
        } as any);
    }

    async handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();

        this.setState({ error: undefined });

        if (this.state.token == undefined) {
            this.setState({ error: PasswordReset.tokenMissingMessage });
            return;
        }
        if (this.state.password !== this.state.confirmPassword) {
            this.setState({ error: 'Passwords do not match / Hasła nie są identyczne' });
            return;
        }

        const password = this.state.password || '';
        const isPasswordValid =
            password.length >= 10 &&
            password.length <= 128 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9\s]/.test(password);

        if (!isPasswordValid) {
            this.setState({ error: 'Hasło nie spełnia wymagań bezpieczeństwa.' });
            return;
        }

        const requestData = {
            token: this.state.token,
            password: this.state.password
        };

        const res = await fetch('/api/users/password', {
            method: 'PUT',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();

        if (data.error != undefined) {
            this.setState({ error: data.error });
        } else if (data.success === true) {
            this.setState({ success: true });
        } else {
            this.setState({ error: 'Unexpected result.' });
        }
    }

    render(): JSX.Element {
        if (this.state.success) {
            return <Redirect to="/my-account.html" />;
        }

        const password = this.state.password || '';
        const confirmPassword = this.state.confirmPassword || '';

        const passwordRules = [
            { label: 'At least 10 characters (min. 10 znaków)', valid: password.length >= 10 && password.length <= 128 },
            { label: 'At least one uppercase letter (wielka litera: A-Z)', valid: /[A-Z]/.test(password) },
            { label: 'At least one lowercase letter (mała litera: a-z)', valid: /[a-z]/.test(password) },
            { label: 'At least one number (cyfra: 0-9)', valid: /[0-9]/.test(password) },
            { label: 'At least one special character (znak specjalny: !@#$%^&*...)', valid: /[^A-Za-z0-9\s]/.test(password) },
        ];
        const isPasswordValid = passwordRules.every(r => r.valid);
        const passwordsMatch = password.length > 0 && password === confirmPassword;

        return (
            <article>
                <section className="main-col">
                    <h1 className="h2">Forgotten password</h1>
                    <p>Please input the new password you want to set for your account. If your password reset token does not work, go back to the <Link to="/forgotten-password.html">forgotten password page</Link> to request a new link.</p>
                    <ErrorBox msg={this.state.error} />
                    <form onSubmit={e => this.handleSubmit(e)}>
                        <label htmlFor="password">New password (at least 10 characters / min. 10 znaków)</label>
                        <input name="password" id="password"
                            className="form-control" type="password"
                            placeholder="New password" required
                            minLength={10}
                            maxLength={128}
                            value={password}
                            onChange={e => this.handleChange(e)}
                        />

                        <div className="password-requirements my-2 p-2 border rounded bg-light" style={{ fontSize: '0.85rem' }}>
                            <div className="fw-bold mb-1" style={{ fontWeight: 600 }}>Password requirements / Wymagania dotyczące hasła:</div>
                            <ul className="list-unstyled mb-0" style={{ paddingLeft: '0.5rem', marginBottom: 0 }}>
                                {passwordRules.map((rule, idx) => (
                                    <li key={idx} style={{ color: rule.valid ? '#198754' : '#6c757d', fontWeight: rule.valid ? 500 : 400 }}>
                                        <span style={{ display: 'inline-block', width: '1.2rem', fontWeight: 'bold' }}>
                                            {rule.valid ? '✓' : '○'}
                                        </span>
                                        {rule.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <label htmlFor="confirmPassword">Confirm new password</label>
                        <input name="confirmPassword" id="confirmPassword"
                            className="form-control" type="password"
                            placeholder="Confirm new password" required
                            minLength={10}
                            maxLength={128}
                            value={confirmPassword}
                            onChange={e => this.handleChange(e)}
                        />
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <small className="text-danger d-block mt-1" style={{ color: '#dc3545' }}>
                                Passwords do not match / Hasła nie są zgodne
                            </small>
                        )}

                        <input name="token" id="token" type="hidden" value={this.state.token || ''} />

                        <div className="buttons-container mt-3">
                            <input
                                type="submit"
                                value="Change password"
                                className="btn btn-primary"
                                disabled={!isPasswordValid || !passwordsMatch}
                            />
                        </div>
                    </form>
                </section>
            </article>
        );
    }
}
