import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { CookieNotice, COOKIE_NOTICE_STORAGE_KEY } from '../CookieNotice';

describe('CookieNotice component', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        window.localStorage.clear();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        act(() => {
            ReactDOM.unmountComponentAtNode(container);
        });
        container.remove();
        jest.restoreAllMocks();
    });

    it('renders the technical cookie notice with privacy policy link when not yet acknowledged', () => {
        act(() => {
            ReactDOM.render(<CookieNotice />, container);
        });

        const bar = container.querySelector('.cookie-notice-bar');
        expect(bar).not.toBeNull();
        expect(bar?.tagName).toBe('ASIDE');
        expect(bar?.getAttribute('aria-label')).toBe('Informacja o plikach cookies');

        const link = container.querySelector('a.cookie-notice-link') as HTMLAnchorElement | null;
        expect(link).not.toBeNull();
        expect(link?.getAttribute('href')).toBe('/privacy-policy.html#cookies');

        const button = container.querySelector('button.cookie-notice-button') as HTMLButtonElement | null;
        expect(button).not.toBeNull();
        expect(button?.type).toBe('button');
        expect(button?.textContent).toBe('Rozumiem');
    });

    it('stores acknowledgement in localStorage and hides the notice on click', () => {
        act(() => {
            ReactDOM.render(<CookieNotice />, container);
        });

        const button = container.querySelector('button.cookie-notice-button') as HTMLButtonElement;
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY)).toBe('true');
        expect(container.querySelector('.cookie-notice-bar')).toBeNull();
    });

    it('does not render when already acknowledged in localStorage', () => {
        window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, 'true');

        act(() => {
            ReactDOM.render(<CookieNotice />, container);
        });

        expect(container.querySelector('.cookie-notice-bar')).toBeNull();
    });

    it('degrades gracefully when localStorage throws a SecurityError', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });

        act(() => {
            ReactDOM.render(<CookieNotice />, container);
        });

        expect(container.querySelector('.cookie-notice-bar')).not.toBeNull();

        const button = container.querySelector('button.cookie-notice-button') as HTMLButtonElement;
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(container.querySelector('.cookie-notice-bar')).toBeNull();
    });
});
