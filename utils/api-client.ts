import { Page, expect } from '@playwright/test';
import { APIResponse } from './types';

/**
 * Simple API Client Wrapper
 * Provides type-safe API calls with error handling and response validation
 *
 * Usage Example:
 * ```typescript
 * const api = new APIClient(page, baseURL);
 * const response = await api.get('/api/users');
 * expect(response.data.users).toHaveLength(10);
 * ```
 */
export class APIClient {
  constructor(
    private readonly page: Page,
    private readonly baseURL: string,
    private readonly apiKey?: string
  ) {
    this.page = page;
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  /**
   * Perform GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<APIResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    // Add query parameters
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const requestOptions: any = {
      headers,
      timeout: options?.timeout || 30000,
    };

    const response = await this.page.context().request.get(url.toString(), requestOptions);

    return this.validateResponse<T>(response, endpoint);
  }

  /**
   * Perform POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<APIResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const requestOptions: any = {
      method: 'POST',
      data: JSON.stringify(data),
      headers,
      timeout: options?.timeout || 30000,
    };

    const response = await this.page.context().request.post(url.toString(), requestOptions);

    return this.validateResponse<T>(response, endpoint);
  }

  /**
   * Perform PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<APIResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const requestOptions: any = {
      method: 'PUT',
      data: JSON.stringify(data),
      headers,
      timeout: options?.timeout || 30000,
    };

    const response = await this.page.context().request.put(url.toString(), requestOptions);

    return this.validateResponse<T>(response, endpoint);
  }

  /**
   * Perform DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<APIResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    // Default headers
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const requestOptions: any = {
      headers,
      timeout: options?.timeout || 30000,
    };

    const response = await this.page.context().request.delete(url.toString(), requestOptions);

    return this.validateResponse<T>(response, endpoint);
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Validate API response
   */
  private validateResponse<T>(
    response: any,
    endpoint: string
  ): APIResponse<T> {
    if (!response.ok()) {
      const status = response.status();
      const statusText = response.statusText();
      const message = `API request failed to ${endpoint}: ${status} ${statusText}`;

      throw new Error(message);
    }

    let data: any;
    try {
      data = response.json();
    } catch {
      data = response.text();
    }

    // Log API call
    console.log(`✓ ${response.request().method()} ${endpoint}: ${response.status()}`);

    return {
      status: response.status(),
      statusText: response.statusText(),
      data: data as T,
      headers: response.headers(),
    };
  }

  /**
   * Check if response is OK
   */
  ok(response: any): response is boolean {
    return response.status >= 200 && response.status < 300;
  }

  /**
   * Get response data
   */
  data<T = any>(response: any): T {
    return response.data;
  }
}
