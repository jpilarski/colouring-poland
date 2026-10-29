import type { CCConfig } from './cc-config';
import configJson from './cc-config.json';

export type { CCConfig };
export const ccConfig: CCConfig = configJson as unknown as CCConfig;
export default ccConfig;
