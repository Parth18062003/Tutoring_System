import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonNavigationProps {
  currentSection: number;
  totalSections: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function LessonNavigation({ 
  currentSection, 
  totalSections, 
  onPrevious, 
  onNext 
}: LessonNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex justify-between items-center mt-8 pt-6 border-t"
    >
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentSection === 0}
        className="flex items-center"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous Section
      </Button>
      
      <div className="text-sm text-muted-foreground">
        {currentSection + 1} of {totalSections}
      </div>
      
      <Button
        variant={currentSection === totalSections - 1 ? "default" : "outline"}
        onClick={onNext}
        disabled={currentSection === totalSections - 1}
        className="flex items-center"
      >
        Next Section
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
}