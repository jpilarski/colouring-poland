import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth-context';
import ConfirmationModal from '../../../components/confirmation-modal';
import ErrorBox from '../../../components/error-box';
import { SpinnerIcon } from '../../../components/icons';
import { ccConfig as config } from '../../../config/ccConfig';

export const MyAccountPage: React.FC = () => {
    const { isLoading, user, userError, logout, generateApiKey, deleteAccount } = useAuth();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [generatedApiKey, setGeneratedApiKey] = useState<string | undefined>(undefined);
    const [copiedApiKey, setCopiedApiKey] = useState(false);
    const [error, setError] = useState(undefined);
    const copyResetTimerRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        return () => {
            if (copyResetTimerRef.current !== undefined) {
                window.clearTimeout(copyResetTimerRef.current);
            }
        };
    }, []);

    const handleLogout = useCallback((e) => {
        e.preventDefault();
        logout(setError);
    }, [logout]);

    const handleGenerateKey = useCallback(async (e) => {
        e.preventDefault();
        setError(undefined);
        setCopiedApiKey(false);
        const newKey = await generateApiKey(setError);
        if (newKey) {
            setGeneratedApiKey(newKey);
        }
    }, [generateApiKey]);

    const handleCopyApiKey = useCallback(async () => {
        if (!generatedApiKey) return;
        let copied = false;
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(generatedApiKey);
                copied = true;
            }
        } catch {
            copied = false;
        }
        if (!copied) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = generatedApiKey;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                copied = document.execCommand('copy');
                document.body.removeChild(textarea);
            } catch {
                copied = false;
            }
        }
        if (copied) {
            setCopiedApiKey(true);
            if (copyResetTimerRef.current !== undefined) {
                window.clearTimeout(copyResetTimerRef.current);
            }
            copyResetTimerRef.current = window.setTimeout(() => {
                setCopiedApiKey(false);
            }, 2500);
        }
    }, [generatedApiKey]);

    const handleDeleteAccount = useCallback(() => {
        setError(undefined);
        deleteAccount(setError, () => {
            window.location.replace('/login.html?account_deleted=1');
        });
    }, [deleteAccount]);

    if (!user && isLoading) {
        return (
            <article>
                <section className="main-col">
                    <SpinnerIcon spin={true} /> Loading user info...
                </section>
            </article>
        );
    }

    const issuesURL = config.githubURL + "/issues";
    const discussURL = config.githubURL + "/discussions";

    return (
        <article>
            <section className="main-col">
                {!isLoading && userError && <ErrorBox msg={userError} />}
                {!userError && (<>
                    <h1 className="h1">Welcome, {user.username}!</h1>
                    <p>
                        Colouring {config.cityName} is under active development. Please{' '}
                        <a href={discussURL}>discuss suggestions for improvements</a> and{' '}
                        <a href={issuesURL}> report issues or problems</a>.
                    </p>
                    <p>
                        For reference, here are the{' '}
                        <Link to="/privacy-policy.html">privacy policy</Link>,{' and the  '}
                        <a href="https://github.com/colouring-cities/manual/wiki/F2.-PROTOCOLS-&-CODES-OF-CONDUCT#ccrp-contributor--data-user-data-accuracy--ethical-use-agreement">contributor & data user data accuracy & ethical use agreement</a>
                    </p>
                    {error && <ErrorBox msg={error} />}
                    <form onSubmit={handleLogout}>
                        <div className="buttons-container">
                            <Link to="/edit/age-history" className="btn btn-warning"><h1>Start colouring</h1></Link>
                            <input className="btn btn-secondary" type="submit" value="Log out" />
                        </div>
                    </form>

                    <hr />
                    <h2 className="h2">My Details</h2>
                    <h3 className="h3">Username</h3>
                    <p>{user.username}</p>
                    <h3 className="h3">Email Address</h3>
                    <p>{user.email || '-'}</p>
                    <h3 className="h3">Registered</h3>
                    <p>{user.registered.toString()}</p>

                    <hr />

                    <h2 className="h2">Technical details</h2>
                    <p>Are you a software developer? If so, you might be interested in these.</p>
                    <h3 className="h3">API key</h3>
                    {generatedApiKey ? (
                        <div className="alert alert-warning" role="alert">
                            <strong>Skopiuj klucz API teraz – jest wyświetlany tylko jeden raz:</strong>
                            <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
                                <code style={{ wordBreak: 'break-all' }}>{generatedApiKey}</code>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-dark"
                                    onClick={handleCopyApiKey}
                                >
                                    {copiedApiKey ? 'Skopiowano ✓' : 'Kopiuj klucz'}
                                </button>
                            </div>
                            <small className="d-block mt-2">
                                Ze względów bezpieczeństwa w bazie przechowywany jest wyłącznie skrót kryptograficzny (SHA-256). Po opuszczeniu lub odświeżeniu strony klucz nie będzie już widoczny.
                            </small>
                        </div>
                    ) : (
                        <p>
                            {user.has_api_key
                                ? 'Klucz API jest aktywny (ukryty ze względów bezpieczeństwa). Wygenerowanie nowego klucza unieważni poprzedni.'
                                : '-'}
                        </p>
                    )}
                    <form onSubmit={handleGenerateKey} className="form-group mb-3">
                        <input
                            className="btn btn-secondary"
                            type="submit"
                            value={user.has_api_key || generatedApiKey ? 'Regenerate API key' : 'Generate API key'}
                        />
                    </form>

                    <h3 className="h3">Open Source Code</h3>
                    Colouring {config.cityName} site code is developed at <a href={config.githubURL}>colouring-cities</a> on Github

                    <hr />

                    <h2 className="h2">Account actions</h2>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            setShowDeleteConfirm(true);
                        }}
                        className="form-group mb-3"
                    >
                        <input className="btn btn-danger" type="submit" value="Delete account" />
                    </form>

                    <ConfirmationModal
                        show={showDeleteConfirm}
                        title="Confirm account deletion"
                        description="Are you sure you want to delete your account? This cannot be undone."
                        confirmButtonText="Delete account"
                        confirmButtonClass="btn-danger"
                        onConfirm={() => handleDeleteAccount()}
                        onCancel={() => setShowDeleteConfirm(false)}
                    />
                </>)}
            </section>
        </article>
    );
};
