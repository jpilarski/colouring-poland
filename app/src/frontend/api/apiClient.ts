export type JsonReviver = (name: string, value: any) => any;

export interface ApiOptions {
    jsonReviver?: JsonReviver;
    headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T = any>(
    path: string,
    method: HttpMethod = 'GET',
    data?: object | null,
    options?: ApiOptions
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
    };

    const res = await fetch(path, {
        method,
        credentials: 'same-origin',
        headers,
        body: data == undefined ? null : JSON.stringify(data)
    });

    const contentType = res.headers.get('content-type') || '';
    let result: any;

    if (contentType.includes('application/json')) {
        const text = await res.text();
        const reviver = options?.jsonReviver;
        result = text ? JSON.parse(text, reviver) : {};
    } else {
        const text = await res.text();
        if (!res.ok) {
            result = { error: text || res.statusText || `HTTP ${res.status}` };
        } else {
            result = text;
        }
    }

    if (!res.ok && typeof result === 'object' && result !== null && !result.error) {
        result.error = result.message || res.statusText || `HTTP ${res.status}`;
    }

    return result as T;
}

export function apiGet<T = any>(path: string, options?: ApiOptions): Promise<T> {
    return apiRequest<T>(path, 'GET', null, options);
}

export function apiPost<T = any>(path: string, data?: object, options?: ApiOptions): Promise<T> {
    return apiRequest<T>(path, 'POST', data, options);
}

export function apiPut<T = any>(path: string, data?: object, options?: ApiOptions): Promise<T> {
    return apiRequest<T>(path, 'PUT', data, options);
}

export function apiDelete<T = any>(path: string, options?: ApiOptions): Promise<T> {
    return apiRequest<T>(path, 'DELETE', null, options);
}
