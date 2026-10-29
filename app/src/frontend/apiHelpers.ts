/**
 * Compatibility facade for the frontend API client.
 * Will be fully replaced by direct imports from './api/apiClient' in Step 4.
 */
export {
    JsonReviver,
    ApiOptions,
    HttpMethod,
    apiRequest,
    apiGet,
    apiPost,
    apiPut,
    apiDelete
} from './api/apiClient';
