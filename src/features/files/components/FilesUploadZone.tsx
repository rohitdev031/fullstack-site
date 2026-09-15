import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FilesUploadZoneProps {
  uploadingCount: number;
  onUploadClick: () => void;
}

export function FilesUploadZone({ uploadingCount, onUploadClick }: FilesUploadZoneProps) {
  return (
    <Card 
      className="shrink-0 border-dashed border-2 border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors shadow-none cursor-pointer group rounded-2xl overflow-hidden relative"
      onClick={onUploadClick}
    >
      <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
        {uploadingCount > 0 ? (
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold mb-2">Uploading {uploadingCount} File{uploadingCount > 1 ? 's' : ''}...</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Please wait while your files are being uploaded.
            </p>
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
  );
}
