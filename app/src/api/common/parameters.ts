import { ApiParamError, ApiParamInvalidFormatError, ApiParamRequiredError } from './errors/api';

/**
 * Przetwarza i waliduje pojedynczy parametr (query, params lub body)
 */
export function processParam<T>(
    source: Record<string, any>,
    paramName: string,
    transformFn: (val: string) => T | undefined,
    required: boolean = false
): T | undefined {
    const rawValue = source ? source[paramName] : undefined;

    if (rawValue === undefined || rawValue === null || rawValue === '') {
        if (required) {
            throw new ApiParamRequiredError(`Parametr '${paramName}' jest wymagany.`, paramName);
        }
        return undefined;
    }

    const transformed = transformFn(String(rawValue));
    if (transformed === undefined) {
        throw new ApiParamInvalidFormatError(`Nieprawidłowy format parametru '${paramName}'.`, paramName);
    }

    return transformed;
}

/**
 * Parsuje parametr jako dodatnią liczbę całkowitą (np. ID, limit)
 */
export function parsePositiveIntParam(param: string): number | undefined {
    const num = Number(param);
    if (!Number.isInteger(num) || num <= 0) {
        return undefined;
    }
    return num;
}

/**
 * Parsuje wartości logiczne z URL ('true', 'false', '1', '0')
 */
export function parseBooleanParam(param: string): boolean | undefined {
    const lower = param.trim().toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
    return undefined;
}

/**
 * Waliduje parametr za pomocą wyrażenia regularnego
 */
export function checkRegexParam(param: string, regex: RegExp): string | undefined {
    if (regex.test(param)) {
        return param;
    }
    return undefined;
}
