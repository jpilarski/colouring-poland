import { useUrlParam } from './use-url-param';

export type Mode = 'view' | 'edit' | 'multi-edit';

const modeParamTransform = {
    fromParam: (x: string) => x as Mode,
    toParam: (x: Mode) => x
};

export function useUrlModeParam() {
    return useUrlParam<Mode>('mode', modeParamTransform);
}
