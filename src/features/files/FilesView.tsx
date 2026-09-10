import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFiles } from './hooks/useFiles';
import { FilesSidebar } from './components/FilesSidebar';
import { FilesUploadZone } from './components/FilesUploadZone';
import { FilesToolbar } from './components/FilesToolbar';
import { FilesList } from './components/FilesList';

export function FilesView() {
  const {
    files,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentFilter,
    setCurrentFilter,
    uploadFile,
    deleteFile,
    toggleStar
  } = useFiles();

  // Support native file input ref here to pass down
  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        // Can handle multiple files here if desired, currently supports one per click
        uploadFile(target.files[0]);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-20 md:pb-10 h-full">
      <FilesSidebar currentFilter={currentFilter} onFilterChange={setCurrentFilter} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Files</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <FilesUploadZone 
          onUploadClick={handleUploadClick} 
          uploadingCount={files.filter(f => f.status === 'uploading').length}
        />

        <FilesToolbar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />

        <FilesList 
          files={files} 
          isLoading={isLoading}
          searchQuery={searchQuery} 
          onDelete={deleteFile}
          onToggleStar={toggleStar}
        />

      </div>
    </div>
  );
}
