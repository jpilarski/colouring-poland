import { buildingAttributesConfig, buildingUserAttributesConfig } from './dataFields';

export type AggregationMethod = 'countTrue' | 'countSubmissions' | 'countTotal' | 'countAverage';

export interface AggregationConfig {
    aggregateFieldName: keyof typeof buildingAttributesConfig;
    aggregationMethod: AggregationMethod;
};

/**
 * Configuration for building-user attribute aggregations.
 * The config defines how attributes that are collected per building, per user are aggregated into per building attributes.
 * An example is the building like mechanism: 
 */
export const aggregationsConfig: { [key in keyof typeof buildingUserAttributesConfig]?: AggregationConfig[] } = {

};
