import React, { Fragment, useCallback } from 'react';
import { VerifyIcon } from '../../components/icons';

import './verification.css';

export interface VerificationProps {
    slug: string;
    onVerify: (slug: string, verify: boolean, x: number, y: number) => void;
    user_verified: boolean;
    user_verified_as: string | boolean;
    verified_count: number;
    allow_verify: boolean;
}

export const Verification: React.FC<VerificationProps> = ({
    slug,
    onVerify,
    user_verified,
    user_verified_as,
    verified_count,
    allow_verify,
}) => {
    const handleClick = useCallback((verify: boolean) => (e: React.MouseEvent) => {
        e.preventDefault();
        const x = e.clientX / document.body.clientWidth;
        const y = e.clientY / document.body.clientHeight;
        onVerify(slug, verify, x, y);
    }, [slug, onVerify]);

    let displayVerifiedAs = user_verified_as;
    if (typeof displayVerifiedAs === 'boolean') {
        displayVerifiedAs = displayVerifiedAs ? 'Yes' : 'No';
    }

    return (
        <div className="verification-container">
            <span
                className="verification-status"
                title={`Verified by ${verified_count} ${(verified_count === 1) ? 'person' : 'people'}`}
            >
                <VerifyIcon />
                {verified_count || 0}
            </span>
            {user_verified ? (
                <Fragment>
                    Verified as
                    "<span>{displayVerifiedAs}</span>"
                    <button
                        className="btn btn-danger"
                        title="Remove my verification"
                        disabled={!allow_verify}
                        onClick={handleClick(false)}
                    >
                        Remove
                    </button>
                </Fragment>
            ) : (
                <Fragment>
                    <button
                        className="btn btn-success"
                        title="Confirm that the current value is correct"
                        disabled={!allow_verify}
                        onClick={handleClick(true)}
                    >
                        Verify
                    </button>
                </Fragment>
            )}
        </div>
    );
};

export default Verification;
