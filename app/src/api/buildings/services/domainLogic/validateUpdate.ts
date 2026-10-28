import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import _ from 'lodash';

import { InvalidFieldError, FieldTypeError } from '../../../common/errors/general';
import { allAttributesConfig } from '../../../config/dataFields';
import { BuildingAttributes, BuildingUserAttributes } from '../../../models/building';
import { fieldSchemaConfig } from '../../../config/fieldSchemaConfig';

const ajv = new Ajv();
addFormats(ajv);

const compiledSchemas = _.mapValues(fieldSchemaConfig, (val) => ajv.compile(val));

function isDefined(key: string) {
    return allAttributesConfig[key] !== undefined;
}

function canEdit(key: string, allowDerived: boolean = false) {
    const config = allAttributesConfig[key];
    if (config == undefined) return false;
    return allowDerived || config.derived !== true;
}

export function validateFieldChange(field: string, value: any, isExternal: boolean = true) {
    if (!isDefined(field)) {
        throw new InvalidFieldError(`Attribute ${field} not recognised.`);
    }

    if (!canEdit(field, !isExternal)) {
        throw new InvalidFieldError(`Attribute ${field} cannot be directly edited.`);
    }

    if (value !== null && compiledSchemas[field] !== undefined) {
        const validate = compiledSchemas[field];
        const valid = validate(value);
        if (!valid) {
            throw new FieldTypeError(ajv.errorsText(validate.errors), validate.errors);
        }
    }
}

export function validateChangeSet(
    update: BuildingAttributes | BuildingUserAttributes,
    isExternal: boolean = true
) {
    for (let [field, value] of Object.entries(update)) {
        validateFieldChange(field, value, isExternal);
    }
}
