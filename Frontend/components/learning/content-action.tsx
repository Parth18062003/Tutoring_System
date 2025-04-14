import { useContentExport } from '@/hooks/use-content-export';
import React from 'react';
import { Button } from '../ui/button';
import { Copy, FileDown, Printer } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface ContentActionsProps {
  content: string;
  filename?: string;
}

const ContentActions: React.FC<ContentActionsProps> = ({ content, filename = 'MyDocument' }) => {
  const { copyToClipboard, downloadAsPDF, printContent } = useContentExport();

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(content)}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => downloadAsPDF(content, filename)}>
              <FileDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download as PDF</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => printContent(content)}>
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ContentActions;