import React from 'react';
import './map-button.css';
import './slider.css';

export interface LayerSwitcherProps {
    label: string;
    enabled: boolean;
    onToggle: (e: React.FormEvent) => void;
    theme: string;
    opacity?: number;
    onOpacityChange?: (opacity: number) => void;
}

export const LayerSwitcher: React.FC<LayerSwitcherProps> = ({
    label,
    enabled,
    onToggle,
    theme,
    opacity,
    onOpacityChange,
}) => {
    const stateClass = enabled ? 'enabled-state' : 'disabled-state';
    const buttonText = enabled ? `${label} włączone` : `${label} wyłączone`;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onOpacityChange) {
            onOpacityChange(parseFloat(e.target.value));
        }
    };

    return (
        <>
            <form className={`switcher map-button ${stateClass} ${theme}`} onSubmit={onToggle}>
                <button className="btn btn-outline btn-outline-dark" type="submit">
                    {buttonText}
                </button>
            </form>

            {enabled && opacity !== undefined && onOpacityChange && (
                <div className={`slider-box map-button enabled-state ${theme}`}>
                    <div className="slider-inner">
                        <div className="slider-labels">
                            <span>Widoczność</span>
                            <span>{`${Math.round(opacity * 100)}%`}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={opacity}
                            onChange={handleSliderChange}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default LayerSwitcher;
