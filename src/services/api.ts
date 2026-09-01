/**
 * Base API Service (Mock)
 * This file serves as the abstraction layer for API calls.
 * When the backend is ready, the backend developer will replace these mock delays
 * with actual fetch/axios requests.
 */

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = {
  get: async <T>(endpoint: string, mockData: T): Promise<T> => {
    console.log(`[MOCK GET] ${endpoint}`);
    await delay(500); // Simulate network latency
    return mockData;
  },
  
  post: async <T>(endpoint: string, body: any, mockResponse: T): Promise<T> => {
    console.log(`[MOCK POST] ${endpoint}`, body);
    await delay(800); // Simulate network latency
    return mockResponse;
  }
};
