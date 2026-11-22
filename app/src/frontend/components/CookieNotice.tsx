import React, { useEffect, useState } from 'react';

import './CookieNotice.css';

export const COOKIE_NOTICE_STORAGE_KEY = 'cp_cookie_accepted';

function readCookieNoticeAccepted(): boolean {
    try {
        return typeof window !== 'undefined' && window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function writeCookieNoticeAccepted(): void {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, 'true');
        }
    } catch {
        // Storage may be unavailable in restricted browser contexts; hide notice for current visit only.
    }
}

export const CookieNotice: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!readCookieNoticeAccepted()) {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        writeCookieNoticeAccepted();
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <aside
            className="cookie-notice-bar"
            aria-label="Informacja o plikach cookies"
        >
            <p className="cookie-notice-text">
                Serwis Colouring Poland wykorzystuje wyłącznie niezbędne techniczne pliki cookies (utrzymanie sesji logowania).
                Nie stosujemy plików śledzących ani marketingowych. Szczegóły w{' '}
                <a className="cookie-notice-link" href="/privacy-policy.html#cookies">
                    Polityce Prywatności
                </a>
                .
            </p>
            <button
                type="button"
                className="cookie-notice-button"
                onClick={handleAccept}
            >
                Rozumiem
            </button>
        </aside>
    );
};
