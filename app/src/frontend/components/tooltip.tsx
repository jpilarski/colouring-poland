import React, { useState, useCallback, FocusEvent } from 'react';

import './tooltip.css';

import { InfoIcon } from './icons';
import Markdown from 'markdown-to-jsx';

export interface TooltipProps {
    text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
    const [active, setActive] = useState(false);

    const toggleVisible = useCallback(() => {
        setActive(prev => !prev);
    }, []);

    const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setActive(false);
        }
    }, []);

    return (
        <div className="tooltip-wrap" tabIndex={0} onBlur={handleBlur}>
            <button
                type="button"
                className={(active ? 'active ' : '') + 'tooltip-hint icon-button'}
                onClick={toggleVisible}
            >
                Info
                <InfoIcon />
            </button>
            {active ? (
                <div className="tooltip bs-tooltip-bottom">
                    <div className="arrow"></div>
                    <div className="tooltip-inner">
                        <Markdown>{text}</Markdown>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Tooltip;
