import React from 'react';
import './map-button.css';
import './slider.css';
import { useDisplayPreferences } from '../displayPreferences-context';

export const DzialkiSwitcher: React.FC = () => {
    const { dzialki, dzialkiSwitch, darkLightTheme, dzialkiOpacity, setDzialkiOpacity } = useDisplayPreferences();

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDzialkiOpacity(parseFloat(e.target.value));
    };

    return (
        <>
            <form className={`switcher map-button ${dzialki}-state ${darkLightTheme}`} onSubmit={dzialkiSwitch}>
                <button className="btn btn-outline btn-outline-dark" type="submit">
                    {(dzialki === 'enabled') ? 'Działki włączone' : 'Działki wyłączone'}
                </button>
            </form>

            {dzialki === 'enabled' && (
                <div className={`slider-box map-button enabled-state ${darkLightTheme}`}>
                    <div className="slider-inner">
                        <div className="slider-labels">
                            <span>Widoczność</span>
                            <span>{`${Math.round(dzialkiOpacity * 100)}%`}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={dzialkiOpacity}
                            onChange={handleSliderChange}
                        />
                    </div>
                </div>
            )}
        </>
    );
}