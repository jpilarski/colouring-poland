import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth-context';
import ErrorBox from '../../../components/error-box';
import { SpinnerIcon } from '../../../components/icons';
import InfoBox from '../../../components/info-box';
import SupporterLogos from '../../../components/supporter-logos';
import { ccConfig as config } from '../../../config/ccConfig';
import { PasswordChecklist, isPasswordValid } from '../components/password-checklist';

export const SignUp: React.FC = () => {
    const { isLoading, signup } = useAuth();
    const [error, setError] = useState<string | undefined>(undefined);
    const [activationMessage, setActivationMessage] = useState<string | undefined>(undefined);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmConditions, setConfirmConditions] = useState(false);

    const validPassword = isPasswordValid(password);

    const onSubmit = useCallback(
        e => {
            e.preventDefault();
            setError(undefined);
            if (!validPassword) {
                setError('Password does not meet the security requirements / Hasło nie spełnia wymagań bezpieczeństwa.');
                return;
            }
            if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
                setError('Podane adresy e-mail nie są identyczne.');
                return;
            }
            signup(
                { username, email, confirmEmail, password },
                setError,
                msg => {
                    setError(undefined);
                    setActivationMessage(msg);
                }
            );
        },
        [username, email, confirmEmail, password, confirmConditions, signup, validPassword]
    );

    const msgName = `Welcome to Colouring ${config.cityName}. You're one of the first people to sign up!`;
    const issuesURL = `${config.githubURL}/issues`;
    const discussURL = `${config.githubURL}/discussions`;

    return (
        <article>
            <section className="main-col">
                <h1 className="h2">Sign up</h1>
                <InfoBox msg={msgName}>
                    <br />Please <a href={discussURL}>discuss suggestions for improvements</a> and {' '}
                    <a href={issuesURL}>report issues or problems</a>.
                </InfoBox>
                {activationMessage ? (
                    <div>
                        <InfoBox msg={activationMessage} />
                        <div className="buttons-container with-space">
                            <Link to="/login.html" className="btn btn-primary">Przejdź do logowania</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p>
                            Create an account to start colouring in.
                        </p>
                        {error && <ErrorBox msg={error} />}
                        <form onSubmit={onSubmit}>
                            <label htmlFor="username">Username*</label>
                            <input name="username" id="username"
                                className="form-control" type="text"
                                value={username} onChange={e => setUsername(e.target.value)}
                                placeholder="Twój pseudonim w serwisie" required
                                minLength={4}
                                maxLength={30}
                                pattern="\w+"
                                title="Usernames can contain only letters, numbers and the underscore"
                            />

                            <label htmlFor="email">Email*</label>
                            <input name="email" id="email"
                                className="form-control" type="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="user@example.org" required
                                maxLength={254}
                            />
                            <InfoBox msg="Rejestracja wymaga adresu e-mail w jednej z dozwolonych domen instytucjonalnych. Na podany adres wyślemy link aktywacyjny ważny przez 48 godzin." />

                            <label htmlFor="confirm_email">Confirm email*</label>
                            <input name="confirm_email" id="confirm_email"
                                className="form-control" type="email"
                                value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)}
                                required
                                maxLength={254}
                            />

                            <label htmlFor="password">Password (at least 10 characters / min. 10 znaków)</label>
                            <input name="password" id="password"
                                className="form-control"
                                type={(showPassword) ? 'text' : 'password'}
                                value={password} onChange={e => setPassword(e.target.value)}
                                required
                                minLength={10}
                                maxLength={128}
                            />

                            <PasswordChecklist password={password} />

                            <div className="form-check">
                                <input id="show_password" name="show_password"
                                    className="form-check-input" type="checkbox"
                                    checked={showPassword}
                                    onChange={e => setShowPassword(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="show_password">
                                    Show password?
                                </label>
                            </div>

                            <div className="form-check">
                                <input id="confirm_conditions" name="confirm_conditions"
                                    className="form-check-input" type="checkbox"
                                    checked={confirmConditions}
                                    onChange={e => setConfirmConditions(e.target.checked)}
                                    required />
                                <label className="form-check-label" htmlFor="confirm_conditions">
                                    I confirm that I have read and agree to the {' '}
                                    <Link to="/privacy-policy.html">privacy policy</Link>,{' and the '}
                                    <a href="https://github.com/colouring-cities/manual/wiki/F2.-PROTOCOLS-&-CODES-OF-CONDUCT#ccrp-contributor--data-user-data-accuracy--ethical-use-agreement">contributor & data user data accuracy & ethical use agreement</a>.
                                </label>
                            </div>

                            <div className="buttons-container with-space">
                                <input
                                    type="submit"
                                    disabled={isLoading || !validPassword}
                                    value="Sign Up"
                                    className="btn btn-primary"
                                />
                                {isLoading && <span><SpinnerIcon />Sending sign up data...</span>}
                            </div>
                            <InfoBox msg="">
                                Please also read our <a href="https://github.com/colouring-cities/manual/wiki/ETHICAL-FRAMEWORK#ccrp-data-ethics-policies">data ethics policy</a> before using or sharing our data
                            </InfoBox>

                            Do you already have an account?

                            <div className="buttons-container with-space">
                                <Link to="login.html" className="btn btn-outline-dark">Log in</Link>
                            </div>

                        </form>
                    </>
                )}
            </section>
            <hr />
            <section className="main-col">
                <SupporterLogos />
            </section>
        </article>
    );
};
