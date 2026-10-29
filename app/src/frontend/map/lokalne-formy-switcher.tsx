import React from 'react';
import { useDisplayPreferences } from '../displayPreferences-context';
import { LayerSwitcher } from './layer-switcher';

export const LokalneFormySwitcher: React.FC = () => {
    const { lokalneFormy, lokalneFormySwitch, darkLightTheme, lokalneFormyOpacity, setLokalneFormyOpacity } = useDisplayPreferences();

    return (
        <LayerSwitcher
            label="Lokalne formy arch."
            enabled={lokalneFormy === 'enabled'}
            onToggle={lokalneFormySwitch}
            theme={darkLightTheme}
            opacity={lokalneFormyOpacity}
            onOpacityChange={setLokalneFormyOpacity}
        />
    );
};

export default LokalneFormySwitcher;
