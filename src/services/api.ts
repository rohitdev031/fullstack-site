/**
 * Base API Service (Mock)
 * This file serves as the abstraction layer for API calls.
 * When the backend is ready, the backend developer will replace these mock delays
 * with actual fetch/axios requests.
 */

// Simulated network delay with abort support
const delay = (ms: number, signal?: AbortSignal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    return reject(new DOMException('Aborted', 'AbortError'));
  }
  
  const timer = setTimeout(resolve, ms);
  
  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  }
});

export interface ApiOptions {
  signal?: AbortSignal;
  failRate?: number; // 0.0 to 1.0
}

const simulateFailure = (failRate: number = 0) => {
  if (Math.random() < failRate) {
    throw new Error('Simulated network failure');
  }
};

export const apiClient = {
  get: async <T>(endpoint: string, mockData: T, options?: ApiOptions): Promise<T> => {
    console.log(`[MOCK GET] ${endpoint}`);
    await delay(500, options?.signal); // Simulate network latency
    simulateFailure(options?.failRate);
    return mockData;
  },
  
  post: async <T>(endpoint: string, body: any, mockResponse: T, options?: ApiOptions): Promise<T> => {
    console.log(`[MOCK POST] ${endpoint}`, body);
    await delay(800, options?.signal); // Simulate network latency
    simulateFailure(options?.failRate);
    return mockResponse;
  }
};
