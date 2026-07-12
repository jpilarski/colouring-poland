import React from 'react';
import './map-button.css';
import './slider.css';
import { useDisplayPreferences } from '../displayPreferences-context';

export const LokalneFormySwitcher: React.FC = () => {
    const { lokalneFormy, lokalneFormySwitch, darkLightTheme, lokalneFormyOpacity, setLokalneFormyOpacity } = useDisplayPreferences();

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLokalneFormyOpacity(parseFloat(e.target.value));
    };

    return (
        <>
            <form className={`switcher map-button ${lokalneFormy}-state ${darkLightTheme}`} onSubmit={lokalneFormySwitch}>
                <button className="btn btn-outline btn-outline-dark" type="submit">
                    {(lokalneFormy === 'enabled') ? 'LFA włączone' : 'LFA wyłączone'}
                </button>
            </form>

            {lokalneFormy === 'enabled' && (
                <div className={`slider-box map-button enabled-state ${darkLightTheme}`}>
                    <div className="slider-inner">
                        <div className="slider-labels">
                            <span>Widoczność</span>
                            <span>{`${Math.round(lokalneFormyOpacity * 100)}%`}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={lokalneFormyOpacity}
                            onChange={handleSliderChange}
                        />
                    </div>
                </div>
            )}
        </>
    );
}