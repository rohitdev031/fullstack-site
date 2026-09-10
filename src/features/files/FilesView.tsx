import { useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Search, Filter, MoreVertical, HardDrive, Clock, Star, Folder } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const initialFiles = [
  { id: '1', name: 'Q3_Financial_Report.pdf', size: '2.4 MB', date: '2 hours ago', type: 'PDF Document', icon: FileText, color: 'text-red-500' },
  { id: '2', name: 'Product_Roadmap_2024.docx', size: '1.1 MB', date: 'Yesterday', type: 'Word Document', icon: FileText, color: 'text-blue-500' },
  { id: '3', name: 'Team_Offsite_Photos.zip', size: '14.5 MB', date: 'Aug 15, 2024', type: 'Archive', icon: Folder, color: 'text-yellow-500' },
  { id: '4', name: 'Competitor_Analysis.xlsx', size: '3.8 MB', date: 'Aug 10, 2024', type: 'Spreadsheet', icon: FileText, color: 'text-green-500' },
  { id: '5', name: 'UI_Mockups_Final.png', size: '4.2 MB', date: 'Aug 05, 2024', type: 'Image', icon: ImageIcon, color: 'text-purple-500' },
];

export function FilesView() {
  const [files, setFiles] = useState(initialFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleUploadClick = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            
            // Add new mock file
            const newFile = {
              id: Date.now().toString(),
              name: `New_Upload_${Math.floor(Math.random() * 1000)}.pdf`,
              size: '1.2 MB',
              date: 'Just now',
              type: 'PDF Document',
              icon: FileText,
              color: 'text-red-500'
            };
            setFiles(prev => [newFile, ...prev]);
          }, 500);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-20 md:pb-10 h-full">
      
      {/* Left Sidebar (Desktop only) */}
      <div className="hidden md:flex flex-col w-64 gap-6 shrink-0">
        <h1 className="text-2xl font-bold mb-2">Files</h1>
        
        <nav className="flex flex-col gap-1">
          <Button variant="secondary" className="justify-start gap-3 bg-muted text-foreground font-semibold rounded-xl h-11"><HardDrive className="w-4 h-4" /> My Files</Button>
          <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground font-medium rounded-xl h-11"><Clock className="w-4 h-4" /> Recent</Button>
          <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground font-medium rounded-xl h-11"><Star className="w-4 h-4" /> Starred</Button>
          <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground font-medium rounded-xl h-11"><Folder className="w-4 h-4" /> Shared with me</Button>
        </nav>

        <div className="mt-auto pt-6 border-t border-border/50">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="font-semibold text-muted-foreground">Storage</span>
            <span className="font-bold">45.5 GB / 100 GB</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[45%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Files</h1>
          <Button variant="ghost" size="icon" className="rounded-full"><Search className="w-5 h-5" /></Button>
        </div>

        {/* Upload Zone */}
        <Card 
          className="border-dashed border-2 border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors shadow-none cursor-pointer group rounded-2xl overflow-hidden relative"
          onClick={handleUploadClick}
        >
          <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
            
            {isUploading ? (
              <div className="flex flex-col items-center w-full max-w-sm">
                 <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                   <UploadCloud className="w-7 h-7 animate-pulse" />
                 </div>
                 <h3 className="text-lg font-bold mb-2">Uploading File...</h3>
                 <div className="w-full flex items-center gap-3">
                   <Progress value={uploadProgress} className="h-2 flex-1" />
                   <span className="text-xs font-bold text-muted-foreground">{uploadProgress}%</span>
                 </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-background border shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Upload your documents</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                  Drag and drop files here, or click to browse. Supported formats include PDF, DOCX, XLSX, and images.
                </p>
                <Button className="bg-primary hover:bg-primary/90 rounded-full h-10 px-8 shadow-sm">
                  Browse Files
                </Button>
              </>
            )}

          </CardContent>
        </Card>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search files by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/60 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm font-medium placeholder:text-muted-foreground/60"
            />
          </div>
          <Button variant="outline" className="gap-2 h-11 rounded-xl shadow-sm bg-background hidden sm:flex">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        {/* File List */}
        <div>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h3 className="font-bold text-lg">Recent documents</h3>
            <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-bold rounded-full">{filteredFiles.length} files</Badge>
          </div>
          
          <div className="flex flex-col gap-3">
            {filteredFiles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No files found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredFiles.map((file) => {
                const Icon = file.icon;
                return (
                <Card key={file.id} className="shadow-sm border-border/60 hover:shadow-md transition-shadow group cursor-pointer rounded-xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-muted group-hover:bg-background transition-colors`}>
                        <Icon className={`w-5 h-5 ${file.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{file.name}</span>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-1">
                          <span>{file.size}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                          <span>{file.type}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 hidden md:block"></span>
                          <span className="hidden md:block">{file.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-60 group-hover:opacity-100 rounded-full hover:bg-muted"><MoreVertical className="w-4 h-4" /></Button>
                  </CardContent>
                </Card>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
