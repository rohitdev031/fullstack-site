import { Sparkles, Globe, LayoutGrid, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';

export function HomeRecommended() {
  const navigate = useNavigate();
  const { setCurrentModel, setWebSearchEnabled } = useAppContext();

  const handleStartSetup = () => {
    setCurrentModel('gemini-1.5-pro');
    setWebSearchEnabled(true);
    navigate('/ask');
  };

  const handleWhyThis = () => {
    alert("This recommendation is based on our deterministic configuration for the most capable model setup available in your current plan.");
  };

  return (
    <div className="mt-0">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[0.95rem] md:text-lg font-bold text-foreground">Recommended for you</h2>
        <Button variant="link" onClick={handleWhyThis} className="text-xs md:text-sm font-semibold text-blue-600 px-2 h-auto hover:no-underline">Why this?</Button>
      </div>
      
      <div className="bg-primary/5 rounded-[20px] md:rounded-[24px] p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 items-center border border-primary/20">
        
        {/* Left Text Side */}
        <div className="flex-1 flex flex-col items-start gap-3 md:gap-4">
           <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none shadow-none font-bold text-[10px] md:text-xs px-2.5 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1.5">
             <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> Recommended
           </Badge>
           <h3 className="text-lg md:text-2xl font-bold text-foreground tracking-tight leading-tight max-w-sm mt-0.5 md:mt-1">
             Get the most accurate and up-to-date answers
           </h3>
           <p className="text-muted-foreground font-medium text-[0.85rem] md:text-[0.95rem] max-w-md leading-snug">
             Use Gemini Pro with web search for the latest information and deeper insights.
           </p>
           <Button onClick={handleStartSetup} className="mt-1 md:mt-2 bg-[#5b52f6] hover:bg-[#4b42d6] text-white w-full sm:w-auto h-9 md:h-11 px-5 md:px-6 rounded-xl text-[0.85rem] md:text-base font-semibold shadow-md gap-2">
             Start with this setup <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
           </Button>
        </div>

        {/* Right Cards Side */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3">
           <Card className="bg-card border-none shadow-sm rounded-xl md:rounded-2xl flex flex-col justify-center p-3 md:p-4 min-h-17.5 md:min-h-22.5">
              <div className="flex items-center gap-2 md:gap-3">
                 <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#5b52f6] shrink-0" />
                 <div>
                   <h4 className="font-bold text-[0.75rem] md:text-[0.85rem] text-foreground leading-none">Gemini Pro</h4>
                   <p className="text-[9px] md:text-[10px] font-medium text-slate-500 mt-1">Best for research & analysis</p>
                 </div>
              </div>
           </Card>
           <Card className="bg-card border-none shadow-sm rounded-xl md:rounded-2xl flex flex-col justify-center p-3 md:p-4 min-h-17.5 md:min-h-22.5">
              <div className="flex items-center gap-2 md:gap-3">
                 <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0" />
                 <div>
                   <h4 className="font-bold text-[0.75rem] md:text-[0.85rem] text-foreground leading-none">Web Search</h4>
                   <p className="text-[9px] md:text-[10px] font-medium text-blue-600 mt-1">On</p>
                 </div>
              </div>
           </Card>
           <Card className="bg-card border-none shadow-sm rounded-xl md:rounded-2xl flex flex-col justify-center p-3 md:p-4 min-h-17.5 md:min-h-22.5">
              <div className="flex items-center gap-2 md:gap-3">
                 <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0" />
                 <div>
                   <h4 className="font-bold text-[0.75rem] md:text-[0.85rem] text-foreground leading-none">Deep Analysis</h4>
                   <p className="text-[9px] md:text-[10px] font-medium text-blue-600 mt-1">On</p>
                 </div>
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
}
