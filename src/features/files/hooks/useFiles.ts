import { useState, useEffect, useRef } from 'react';
import { fileService } from '@/services/files/fileService';
import type { AetherFile, FileFilter } from '@/services/files/fileService';

export function useFiles(initialFilter: FileFilter = 'all') {
  const [files, setFiles] = useState<AetherFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FileFilter>(initialFilter);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  
  // Ref to track the current active fetch request and prevent race conditions
  const activeFetchRef = useRef<symbol | null>(null);

  // Initial fetch and fetch on filter change
  useEffect(() => {
    let isMounted = true;
      const currentFetch = Symbol('fetch');
    activeFetchRef.current = currentFetch;

    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedFiles = await fileService.getFiles(currentFilter);
        // Prevent stale updates if user rapidly changed filters
        if (isMounted && activeFetchRef.current === currentFetch) {
          // Merge fetched files with any files that are currently uploading
          setFiles(prev => {
            const uploadingFiles = prev.filter(f => f.status === 'uploading' || f.status === 'failed');
            // Remove uploading files from fetched files to avoid duplicates (though unlikely)
            const fetchedWithoutUploading = fetchedFiles.filter(ff => !uploadingFiles.find(uf => uf.id === ff.id));
            return [...uploadingFiles, ...fetchedWithoutUploading];
          });
        }
      } catch (err) {
        if (isMounted && activeFetchRef.current === currentFetch) {
          setError('Failed to load files.');
        }
      } finally {
        if (isMounted && activeFetchRef.current === currentFetch) {
          setIsLoading(false);
        }
      }
    };

    fetchFiles();

    return () => {
      isMounted = false;
    };
  }, [currentFilter]);

  // Derived state for UI
  const displayedFiles = files.filter(f => {
    // Search query filter
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // File type filter
    if (fileTypeFilter !== 'all') {
      const mime = (f.mimeType || '').toLowerCase();
      if (fileTypeFilter === 'pdf' && !mime.includes('pdf')) return false;
      if (fileTypeFilter === 'image' && !mime.startsWith('image/')) return false;
      if (fileTypeFilter === 'document' && !mime.includes('word') && !mime.includes('document')) return false;
      if (fileTypeFilter === 'spreadsheet' && !mime.includes('excel') && !mime.includes('spreadsheet')) return false;
      if (fileTypeFilter === 'archive' && !mime.includes('zip') && !mime.includes('archive')) return false;
    }

    return true;
  });

  const uploadFile = (browserFile: File) => {
    // 1. Create a unique ID and initial uploading state
    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newUploadFile: AetherFile = {
      id: fileId,
      name: browserFile.name,
      sizeBytes: browserFile.size,
      mimeType: browserFile.type,
      status: 'uploading',
      uploadProgress: 0,
      uploadedAt: new Date().toISOString(),
      isStarred: false,
    };

    // 2. Add strictly via functional update to prevent race conditions
    setFiles(prev => [newUploadFile, ...prev]);

    // 3. Simulate chunked upload
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.floor(Math.random() * 20) + 10;
      
      if (progress >= 100) {
        clearInterval(interval);
        try {
          // Finalize on backend
          const finalizedFile = await fileService.finalizeUpload(newUploadFile);
          
          setFiles(prev => prev.map(f => {
            if (f.id === fileId) return finalizedFile;
            return f;
          }));
        } catch {
          setFiles(prev => prev.map(f => {
            if (f.id === fileId) return { ...f, status: 'failed', error: 'Server rejected file' };
            return f;
          }));
        }
      } else {
        // Update progress safely
        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.status === 'uploading') {
            return { ...f, uploadProgress: progress > 99 ? 99 : progress };
          }
          return f;
        }));
      }
    }, 400);
  };

  const deleteFile = async (fileId: string) => {
    // Optimistic deletion
    const backupFiles = [...files];
    setFiles(prev => prev.filter(f => f.id !== fileId));

    try {
      await fileService.deleteFile(fileId);
    } catch {
      // Revert on failure
      setFiles(backupFiles);
      throw new Error('Failed to delete file');
    }
  };

  const toggleStar = async (fileId: string) => {
    let newStarredStatus: boolean | undefined;

    // Optimistic toggle using the latest state to determine intent
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (!file) return prev;
      newStarredStatus = !file.isStarred;
      return prev.map(f => f.id === fileId ? { ...f, isStarred: newStarredStatus! } : f);
    });
    
    if (newStarredStatus === undefined) return;
    
    try {
      await fileService.toggleStar(fileId, newStarredStatus);
    } catch {
      // Revert on failure
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isStarred: !newStarredStatus! } : f));
      throw new Error('Failed to star file');
    }
  };

  return {
    files: displayedFiles,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    fileTypeFilter,
    setFileTypeFilter,
    currentFilter,
    setCurrentFilter,
    uploadFile,
    deleteFile,
    toggleStar
  };
}

