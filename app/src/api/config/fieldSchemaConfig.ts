import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { allAttributesConfig } from './dataFields';

export const fieldSchemaConfig: { [key in keyof typeof allAttributesConfig]?: SomeJSONSchema } = { /*eslint-disable @typescript-eslint/camelcase */

} as const;
