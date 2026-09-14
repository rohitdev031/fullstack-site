import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AetherFile } from '@/services/files/fileService';

type FilePreviewModalProps = {
  attachedFile: File | AetherFile;
  onClose: () => void;
};

export function FilePreviewModal({ attachedFile, onClose }: FilePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 px-6 border-b bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-[15px]">{attachedFile.name}</h3>
              <span className="text-xs text-muted-foreground font-medium">Document Preview</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-background border shadow-sm hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 bg-muted/10 p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center flex flex-col items-center max-w-md mx-auto">
             <FileText className="w-20 h-20 text-muted-foreground/30 mb-6" />
             <p className="text-muted-foreground font-medium mb-4 text-[15px]">Previewing the contents of <br/><span className="font-bold text-foreground text-lg">{attachedFile.name}</span></p>
             <p className="text-[13px] text-muted-foreground/70 leading-relaxed border-t border-border/50 pt-4 mt-2">
               This is a simulated preview window. In a real application, the actual file content (image, PDF viewer, or text data) would be rendered here securely.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

