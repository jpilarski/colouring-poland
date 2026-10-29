import { apiGet } from './apiClient';
import { dateReviver } from '../../helpers';

export interface ExtractViewModel {
    extract_id: number;
    extracted_on: Date;
    download_path: string;
}

export interface ExtractsResponse {
    extracts: ExtractViewModel[];
}

export const dataExtractsApi = {
    getExtracts: () => apiGet<ExtractsResponse>('/api/extracts', { jsonReviver: dateReviver })
};
