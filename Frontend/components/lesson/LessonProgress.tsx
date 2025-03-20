import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonProgressProps {
  sections: string[];
  currentSection: number;
  onSectionChange: (index: number) => void;
}

export default function LessonProgress({ 
  sections, 
  currentSection, 
  onSectionChange 
}: LessonProgressProps) {
  // Format section names for display
  const formatSectionName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-base mb-4">Lesson Progress</h3>
      <div className="space-y-2">
        {sections.map((section, index) => {
          const isActive = currentSection === index;
          const isPast = index < currentSection;
          
          return (
            <motion.button
              key={section}
              whileHover={{ x: 4 }}
              onClick={() => onSectionChange(index)}
              className={cn(
                "flex items-center w-full p-2 rounded-md text-left text-sm transition-colors",
                isActive && "bg-primary/10 text-primary font-medium",
                !isActive && "hover:bg-secondary"
              )}
            >
              <div className="mr-3">
                {isPast ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : isActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-4 w-4 rounded-full bg-primary"
                  />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {formatSectionName(section)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}