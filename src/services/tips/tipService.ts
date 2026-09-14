
export interface Tip {
  id: string;
  title: string;
  content: string;
}

const MOCK_TIPS: Tip[] = [
  {
    id: 'tip-1',
    title: 'Tip',
    content: 'Enable Web Search to allow the AI to fetch real-time information and current data.'
  },
  {
    id: 'tip-2',
    title: 'Pro Tip',
    content: 'Use the Compare Models tool to see how different AIs answer the exact same question.'
  },
  {
    id: 'tip-3',
    title: 'Did you know?',
    content: 'You can upload large PDF documents and ask the AI to extract or summarize the key points.'
  }
];

export const tipService = {
  /**
   * Fetches a relevant tip for the user.
   */
  getTip: async (): Promise<Tip | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Randomly select a tip for the mock
    const randomTip = MOCK_TIPS[Math.floor(Math.random() * MOCK_TIPS.length)];

    // When backend is ready, uncomment this and delete the mock logic:
    // return apiClient.get('/api/tips/current', randomTip);
    return randomTip;
  },

  /**
   * Dismisses a tip so the user doesn't see it again.
   */
  dismissTip: async (tipId: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // When backend is ready, uncomment this:
    // await apiClient.post(`/api/tips/${tipId}/dismiss`);
    console.log(`[Backend Ready] Tip ${tipId} marked as dismissed by user.`);
  }
};
