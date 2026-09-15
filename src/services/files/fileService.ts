

export type FileStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface AetherFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  status: FileStatus;
  uploadProgress?: number; // 0-100
  uploadedAt: string;
  isStarred: boolean;
  url?: string;
  error?: string;
}

// ----------------------------------------------------------------------
// MOCK DATA
// ----------------------------------------------------------------------
let MOCK_FILES_DB: AetherFile[] = [
  { id: 'f_1', name: 'Q3_Financial_Report.pdf', sizeBytes: 2516582, mimeType: 'application/pdf', status: 'ready', uploadedAt: new Date(Date.now() - 7200000).toISOString(), isStarred: true },
  { id: 'f_2', name: 'Product_Roadmap_2024.docx', sizeBytes: 1153433, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', status: 'ready', uploadedAt: new Date(Date.now() - 86400000).toISOString(), isStarred: false },
  { id: 'f_3', name: 'Team_Offsite_Photos.zip', sizeBytes: 15204352, mimeType: 'application/zip', status: 'ready', uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(), isStarred: false },
  { id: 'f_4', name: 'Competitor_Analysis.xlsx', sizeBytes: 3984588, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', status: 'ready', uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(), isStarred: true },
  { id: 'f_5', name: 'UI_Mockups_Final.png', sizeBytes: 4404019, mimeType: 'image/png', status: 'ready', uploadedAt: new Date(Date.now() - 86400000 * 15).toISOString(), isStarred: false },
];

export type FileFilter = 'all' | 'recent' | 'starred' | 'shared';

export const fileService = {
  /**
   * =========================================================================
   * 🛑 BACKEND INTEGRATION POINT: `fileService`
   * =========================================================================
   * TO THE BACKEND TEAM:
   * 1. Remove the `MOCK_FILES_DB` in-memory logic.
   * 2. Map these methods to your real backend endpoints (e.g. GET /api/v1/files).
   * 3. Ensure your backend returns the canonical `AetherFile` object format.
   */

  getFiles: async (filter: FileFilter = 'all'): Promise<AetherFile[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...MOCK_FILES_DB];
    
    if (filter === 'starred') {
      result = result.filter(f => f.isStarred);
    } else if (filter === 'recent') {
      // Return files from the last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(f => new Date(f.uploadedAt).getTime() > sevenDaysAgo);
    } else if (filter === 'shared') {
      // Mock shared files (none currently)
      result = [];
    }

    // Sort descending by date
    return result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    MOCK_FILES_DB = MOCK_FILES_DB.filter(f => f.id !== fileId);
  },

  toggleStar: async (fileId: string, isStarred: boolean): Promise<AetherFile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const fileIndex = MOCK_FILES_DB.findIndex(f => f.id === fileId);
    if (fileIndex === -1) throw new Error('File not found');
    
    MOCK_FILES_DB[fileIndex] = { ...MOCK_FILES_DB[fileIndex], isStarred };
    return { ...MOCK_FILES_DB[fileIndex] };
  },

  /**
   * uploadFile is handled specifically by the hook via a simulated interval 
   * to provide granular progress updates. In production, use axios or fetch 
   * with progress event listeners.
   */
  finalizeUpload: async (file: AetherFile): Promise<AetherFile> => {
    // This is called by the hook when it finishes simulating the upload chunking.
    const finalFile = { ...file, status: 'ready' as FileStatus, uploadProgress: 100 };
    MOCK_FILES_DB = [finalFile, ...MOCK_FILES_DB];
    return finalFile;
  }
};
