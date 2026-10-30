import React, { useState, useEffect, FormEvent } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import ErrorBox from '../../../components/error-box';
import { PasswordChecklist, isPasswordValid } from '../components/password-checklist';
import { authApi } from '../../../api';

const TOKEN_MISSING_MESSAGE = 'Password reset token is missing. Make sure to follow the link from a password reset email!';

export const PasswordReset: React.FC<RouteComponentProps> & { tokenMissingMessage?: string } = (props) => {
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(props.location.search);
        const queryToken = queryParams.get('token');
        if (!queryToken) {
            setError(TOKEN_MISSING_MESSAGE);
        } else {
            setToken(queryToken);
        }
    }, [props.location.search]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(undefined);

        if (!token) {
            setError(TOKEN_MISSING_MESSAGE);
            return;
        }

        if (!isPasswordValid(password)) {
            setError('Hasło nie spełnia wszystkich wymagań bezpieczeństwa.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const data = await authApi.resetPassword({
                token,
                password,
            });

            if (data.error != undefined) {
                setError(data.error);
            } else if (data.success === true) {
                setSuccess(true);
            } else {
                setError('Unexpected result.');
            }
        } catch (err: any) {
            const msg = err?.data?.error || err?.message || 'Something went wrong.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return <Redirect to="/my-account.html" />;
    }

    const validPassword = isPasswordValid(password);

    return (
        <article>
            <section className="main-col">
                <h1 className="h2">Forgotten password</h1>
                <p>
                    Please input the new password you want to set for your account. If your password reset token does not work,
                    go back to the <Link to="/forgotten-password.html">forgotten password page</Link> to request a new link.
                </p>
                {error && <ErrorBox msg={error} />}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="password">New password</label>
                    <input
                        name="password"
                        id="password"
                        className="form-control"
                        type="password"
                        placeholder="New password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <PasswordChecklist password={password} />

                    <label htmlFor="confirmPassword">Confirm new password</label>
                    <input
                        name="confirmPassword"
                        id="confirmPassword"
                        className="form-control"
                        type="password"
                        placeholder="Confirm new password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />

                    <input name="token" id="token" type="hidden" value={token || ''} />

                    <div className="buttons-container">
                        <input
                            type="submit"
                            value="Change password"
                            className="btn btn-primary"
                            disabled={isLoading || !validPassword || !token}
                        />
                    </div>
                </form>
            </section>
        </article>
    );
};

PasswordReset.tokenMissingMessage = TOKEN_MISSING_MESSAGE;

export default PasswordReset;
