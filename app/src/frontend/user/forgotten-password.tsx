import React, { useState, FormEvent } from 'react';

import ErrorBox from '../components/error-box';
import InfoBox from '../components/info-box';
import { authApi } from '../api';
import { ccConfig as config } from '../config/ccConfig';

export const ForgottenPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailUsed, setEmailUsed] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(undefined);
        setSuccess(false);
        setIsLoading(true);

        const emailSent = email;
        try {
            const data = await authApi.requestPasswordReset(emailSent);

            if (data.error != undefined) {
                setError(data.error);
            } else if (data.success === true) {
                setSuccess(true);
                setEmailUsed(emailSent);
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

    return (
        <article>
            <section className="main-col">
                <h1 className="h2">Forgotten password</h1>
                <p>Please provide the e-mail address associated with your account. A password reset link will be sent to your mailbox.</p>
                {error && <ErrorBox msg={error} />}
                <InfoBox msg="">
                    {success ?
                        `If the email address is registered on Colouring ${config.cityName}, a password reset link will be sent to ${emailUsed}. Please check your inbox.` :
                        null
                    }
                </InfoBox>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        name="email"
                        id="email"
                        className="form-control"
                        type="email"
                        placeholder="Your e-mail address"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <div className="buttons-container">
                        <input
                            type="submit"
                            value="Request password reset"
                            className="btn btn-primary"
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </section>
        </article>
    );
};

export default ForgottenPassword;
