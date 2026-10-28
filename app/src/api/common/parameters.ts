/**
 * Request Parameter Parser & Sanitizer (Warstwa Kontrolerów HTTP)
 * 
 * Moduł pomocniczy dla kontrolerów API odpowiedzialny za odczyt,
 * walidację obecności oraz konwersję typów parametrów żądań HTTP
 * (pochodzących z req.params lub req.query).
 */
import { strictParseInt } from '../../parse';
import { ApiParamError, ApiParamInvalidFormatError, ApiParamRequiredError } from '../errors';

export function processParam<T>(
    params: object,
    paramName: string,
    processingFn: (x: string) => T,
    required: boolean = false
): T {
    const stringValue = params[paramName];

    if (stringValue == undefined && required) {
        const err = new ApiParamRequiredError('Parameter required but not supplied');
        err.paramName = paramName;
        throw err;
    }

    try {
        return processingFn(stringValue);
    } catch (error) {
        if (error instanceof ApiParamError) {
            error.paramName = paramName;
        }
        throw error;
    }
}

export function parsePositiveIntParam(param: string): number | undefined {
    if (param == undefined) return undefined;

    const result = strictParseInt(param);
    if (isNaN(result)) {
        throw new ApiParamInvalidFormatError('Invalid format: not a positive integer');
    }
    return result;
}

export function parseBooleanParam(param: string): boolean | undefined {
    if (param == undefined) return undefined;

    if (param === 'true') return true;
    if (param === 'false') return false;

    throw new ApiParamInvalidFormatError('Invalid format: not a true/false value');
}

export function checkRegexParam(param: string, regex: RegExp): string | undefined {
    if (param == undefined) return undefined;

    if (param.match(regex) == undefined) {
        throw new ApiParamInvalidFormatError(`Invalid format: does not match regular expression ${regex}`);
    }

    return param;
}
