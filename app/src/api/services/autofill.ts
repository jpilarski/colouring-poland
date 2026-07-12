import db from '../../db';

interface AutofillOption {
    id: string;
    value: string;
    similarity?: number;
}

type GetAutofillOptionsFn = (value: string, all?: boolean) => Promise<AutofillOption[]>;

const autofillFunctionMap: { [fieldName: string]: GetAutofillOptionsFn } = {
};

function buildPartialMatchQuery(value: string) {
    return tokenizeValue(value).map(x => `${x}:*`).join(' & ');
}
function tokenizeValue(value: string) {
    return value.split(/[^\w]+/).filter(x => x !== '');
}

export function getAutofillOptions(fieldName: string, fieldValue: any, allValues: boolean) {
    const optionsFn = autofillFunctionMap[fieldName];

    if (optionsFn == undefined) {
        throw new Error(`Autofill options not available for field '${fieldName}'`);
    }

    return optionsFn(fieldValue, allValues);
}
