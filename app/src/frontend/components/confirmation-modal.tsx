import React, { useEffect } from 'react';

import './confirmation-modal.css';

interface ConfirmationModalProps {
    show: boolean;
    title: string;
    description: string;
    confirmButtonText?: string;
    confirmButtonClass?: string;
    cancelButtonClass?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FunctionComponent<ConfirmationModalProps> = ({
    confirmButtonText = 'OK',
    confirmButtonClass = 'btn-primary',
    cancelButtonClass = 'btn-outline-secondary',
    ...props
}) => {
    const { show, onCancel } = props;

    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show, onCancel]);

    const modalShowClass = show ? 'modal-show' : 'modal-hide';
    return (
        <div
            className={`modal confirmation-modal ${modalShowClass}`}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            onClick={event => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{props.title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => onCancel()}
                        />
                    </div>
                    <div className="modal-body">
                        <p className="mb-0">{props.description}</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className={`btn ${cancelButtonClass}`}
                            onClick={() => onCancel()}
                        >Cancel</button>
                        <button
                            type="button"
                            className={`btn ${confirmButtonClass}`}
                            onClick={() => props.onConfirm()}
                        >{confirmButtonText}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
