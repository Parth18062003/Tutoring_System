import { toast } from "sonner";
import { marked } from "marked";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

export const useContentExport = () => {
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (error) {
      console.error("Failed to copy content:", error);
      toast.error("Failed to copy content");
    }
  };

  const downloadAsPDF = async (content: string, filename: string) => {
    try {
      // Convert markdown to HTML for content processing, but avoid DOM manipulation
      const htmlContent = marked.parse(content) as string;
      
      // Initialize PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set document properties
      pdf.setProperties({
        title: filename,
        subject: 'Learning Content',
        creator: 'Brain Wave',
      });
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(filename.replace(/-/g, ' '), 20, 20);
      
      // Add horizontal line
      pdf.setLineWidth(0.5);
      pdf.line(20, 25, 190, 25);
      
      // Process content in smaller chunks
      // Strip HTML tags and convert to plain text for PDF
      const plainText = htmlContent.replace(/<[^>]*>/g, '');
      const paragraphs = plainText.split('\n\n');
      
      let y = 35;
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      pdf.setFontSize(11);
      
      for (let i = 0; i < paragraphs.length; i++) {
        if (!paragraphs[i].trim()) continue;
        
        // Check if paragraph looks like a header
        let fontSize = 11;
        if (paragraphs[i].startsWith('#')) {
          const headerLevel = paragraphs[i].split(' ')[0].length;
          if (headerLevel <= 3) {
            // Adjust font size based on header level
            fontSize = 16 - (headerLevel * 2);
            // Remove the header markers
            paragraphs[i] = paragraphs[i].replace(/^#+\s+/, '');
            pdf.setFontSize(fontSize);
          }
        }
        
        // Split text to fit page width
        const textLines = pdf.splitTextToSize(paragraphs[i], maxWidth);
        
        // Check if we need a new page
        if (y + (textLines.length * (fontSize * 0.5)) > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        
        // Add content
        pdf.text(textLines, margin, y);
        y += textLines.length * (fontSize * 0.5) + 5;
        
        // Reset font size for normal text
        if (fontSize !== 11) {
          pdf.setFontSize(11);
        }
      }
      
      // Save the PDF
      pdf.save(`${filename.replace(/\s+/g, '-')}.pdf`);
      toast.success("Downloaded as PDF");
    } catch (error) {
      console.error("Failed to download as PDF:", error);
      toast.error("Failed to download as PDF");
    }
  };

  const printContent = (content: string) => {
    try {
      // Convert markdown to HTML for printing
      const htmlContent = marked.parse(content) as string;
      
      // Create a print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Could not open print window");
      }
      
      // Add content to the print window with proper styling
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Content</title>
            <style>
              @page { margin: 2cm; }
              body { 
                font-family: 'Arial', 'Helvetica', sans-serif; 
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1, h2, h3 { margin-top: 1em; color: #111; }
              h1 { font-size: 1.8em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.3em; }
              pre { 
                background: #f6f8fa; 
                padding: 16px; 
                overflow-x: auto; 
                border-radius: 5px;
                border: 1px solid #e1e4e8;
              }
              code { 
                font-family: 'Consolas', 'Monaco', monospace;
                background: #f6f8fa;
                padding: 2px 4px;
                border-radius: 3px;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
              }
              table, th, td {
                border: 1px solid #ddd;
                padding: 8px;
              }
              th {
                background-color: #f2f2f2;
                text-align: left;
              }
              img { max-width: 100%; height: auto; }
              blockquote {
                border-left: 4px solid #e1e4e8;
                margin-left: 0;
                padding-left: 16px;
                color: #6a737d;
              }
              hr { border: none; border-top: 1px solid #e1e4e8; margin: 24px 0; }
              @media print {
                a { text-decoration: none; color: #333; }
                pre, code { background: #f9f9f9 !important; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Add slight delay to ensure styles are applied before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Failed to print content:", error);
      toast.error("Failed to print content");
    }
  };

  return {
    copyToClipboard,
    downloadAsPDF,
    printContent,
  };
};