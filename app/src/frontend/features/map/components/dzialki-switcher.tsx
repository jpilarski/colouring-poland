import React from 'react';
import { useDisplayPreferences } from '../displayPreferences-context';
import { LayerSwitcher } from './layer-switcher';

export const DzialkiSwitcher: React.FC = () => {
    const { dzialki, dzialkiSwitch, darkLightTheme, dzialkiOpacity, setDzialkiOpacity } = useDisplayPreferences();

    return (
        <LayerSwitcher
            label="Działki"
            enabled={dzialki === 'enabled'}
            onToggle={dzialkiSwitch}
            theme={darkLightTheme}
            opacity={dzialkiOpacity}
            onOpacityChange={setDzialkiOpacity}
        />
    );
};

export default DzialkiSwitcher;
