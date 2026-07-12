import React, { createContext, useCallback, useContext, useState } from 'react';

import { LayerEnablementState, MapTheme } from './config/map-config';

interface DisplayPreferencesContextState {
    showOverlayList: (e: React.FormEvent<HTMLFormElement>) => void;
    resetLayersAndHideTheirList: (e: React.FormEvent<HTMLFormElement>) => void;

    dzialki: LayerEnablementState;
    dzialkiSwitch: (e: React.FormEvent<HTMLFormElement>) => void;
    dzialkiOpacity: number;
    setDzialkiOpacity: (opacity: number) => void;

    lokalneFormy: LayerEnablementState;
    lokalneFormySwitch: (e: React.FormEvent<HTMLFormElement>) => void;
    lokalneFormyOpacity: number;
    setLokalneFormyOpacity: (opacity: number) => void;

    editableBuildings: LayerEnablementState;
    editableBuildingsSwitch: (e: React.FormEvent<HTMLFormElement>) => void;
    editableBuildingsSwitchOnClick: React.MouseEventHandler<HTMLButtonElement>;

    darkLightTheme: MapTheme;
    darkLightThemeSwitch: (e: React.FormEvent<HTMLFormElement>) => void;
    darkLightThemeSwitchOnClick: React.MouseEventHandler<HTMLButtonElement>;

    showLayerSelection: LayerEnablementState;
    showLayerSelectionSwitch: (e: React.FormEvent<HTMLFormElement>) => void;
    showLayerSelectionSwitchOnClick: React.MouseEventHandler<HTMLButtonElement>;
}

const stub = (): never => {
    throw new Error('DisplayPreferencesProvider not set up');
};

// 1. POPRAWKA: Dodane brakujące wartości domyślne dla createContext
export const DisplayPreferencesContext = createContext<DisplayPreferencesContextState>({
    showOverlayList: stub,
    resetLayersAndHideTheirList: stub,

    dzialki: 'disabled',
    dzialkiSwitch: stub,
    dzialkiOpacity: 0.5,
    setDzialkiOpacity: stub,

    lokalneFormy: 'disabled',
    lokalneFormySwitch: stub,
    lokalneFormyOpacity: 0.6,
    setLokalneFormyOpacity: stub,

    editableBuildings: undefined as any,
    editableBuildingsSwitch: stub,
    editableBuildingsSwitchOnClick: undefined as any,

    darkLightTheme: undefined as any,
    darkLightThemeSwitch: stub,
    darkLightThemeSwitchOnClick: undefined as any,

    showLayerSelection: undefined as any,
    showLayerSelectionSwitch: stub,
    showLayerSelectionSwitchOnClick: undefined as any,
});

const noop = () => { };

export const DisplayPreferencesProvider: React.FC<{}> = ({ children }) => {
    const defaultEditableBuildings = 'enabled';
    const defaultShowLayerSelection = 'disabled';

    const [editableBuildings, setEditableBuildings] = useState<LayerEnablementState>(defaultEditableBuildings);
    const [darkLightTheme, setDarkLightTheme] = useState<MapTheme>('night');
    const [showLayerSelection, setShowLayerSelection] = useState<LayerEnablementState>(defaultShowLayerSelection);

    const defaultDzialki = 'disabled';
    const defaultLokalneFormy = 'disabled';

    const [dzialki, setDzialki] = useState<LayerEnablementState>(defaultDzialki);
    const [dzialkiOpacity, setDzialkiOpacity] = useState<number>(0.5);

    const [lokalneFormy, setLokalneFormy] = useState<LayerEnablementState>(defaultLokalneFormy);
    const [lokalneFormyOpacity, setLokalneFormyOpacity] = useState<number>(0.6);

    const showOverlayList = useCallback(
        (e) => {
            setShowLayerSelection('enabled')
        },
        []
    );

    const resetLayersAndHideTheirList = useCallback(
        (e) => {
            setShowLayerSelection('disabled');
        },
        []
    );

    function anyLayerModifiedState() {
        if (editableBuildings != defaultEditableBuildings) {
            return true;
        }
        return false;
    }

    const dzialkiSwitch = useCallback((e) => {
        e.preventDefault();
        setDzialki(prev => prev === 'enabled' ? 'disabled' : 'enabled');
    }, []);

    const lokalneFormySwitch = useCallback((e) => {
        e.preventDefault();
        setLokalneFormy(prev => prev === 'enabled' ? 'disabled' : 'enabled');
    }, []);

    const editableBuildingsSwitch = useCallback(
        (e) => {
            flipEditableBuildings(e)
        },
        [editableBuildings],
    );
    const editableBuildingsSwitchOnClick = (e) => {
        flipEditableBuildings(e)
    };
    function flipEditableBuildings(e) {
        e.preventDefault();
        const newValue = (editableBuildings === 'enabled') ? 'disabled' : 'enabled';
        setEditableBuildings(newValue);
    }

    const darkLightThemeSwitch = useCallback(
        (e) => {
            flipDarkLightTheme(e)
        },
        [darkLightTheme],
    );
    const darkLightThemeSwitchOnClick = (e) => {
        flipDarkLightTheme(e)
    };
    function flipDarkLightTheme(e) {
        e.preventDefault();
        const newDarkLightTheme = (darkLightTheme === 'light') ? 'night' : 'light';
        setDarkLightTheme(newDarkLightTheme);
    }

    const showLayerSelectionSwitch = useCallback(
        (e) => {
            flipShowLayerSelection(e)
        },
        [showLayerSelection],
    );
    const showLayerSelectionSwitchOnClick = (e) => {
        flipShowLayerSelection(e)
    };
    function flipShowLayerSelection(e) {
        e.preventDefault();
        const newShowLayerSelection = (showLayerSelection === 'enabled') ? 'disabled' : 'enabled';
        setShowLayerSelection(newShowLayerSelection);
    }

    return (
        // 2. POPRAWKA: Dodanie setDzialkiOpacity i setLokalneFormyOpacity do exportowanego obiektu value
        <DisplayPreferencesContext.Provider value={{
            showOverlayList,
            resetLayersAndHideTheirList,

            dzialki,
            dzialkiSwitch,
            dzialkiOpacity,
            setDzialkiOpacity,

            lokalneFormy,
            lokalneFormySwitch,
            lokalneFormyOpacity,
            setLokalneFormyOpacity,

            editableBuildings,
            editableBuildingsSwitch,
            editableBuildingsSwitchOnClick,

            darkLightTheme,
            darkLightThemeSwitch,
            darkLightThemeSwitchOnClick,

            showLayerSelection,
            showLayerSelectionSwitch,
            showLayerSelectionSwitchOnClick
        }}>
            {children}
        </DisplayPreferencesContext.Provider>
    );
};

export const useDisplayPreferences = (): DisplayPreferencesContextState => {
    return useContext(DisplayPreferencesContext);
};