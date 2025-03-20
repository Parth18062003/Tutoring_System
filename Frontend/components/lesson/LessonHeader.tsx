import { motion } from "framer-motion";
import { Bell, BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonHeaderProps {
  className: string;
  subject: string;
  topic: string;
}

export default function LessonHeader({ className, subject, topic }: LessonHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b"
    >
      <div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium text-muted-foreground">{className} | {subject}</p>
        </div>
        <h1 className="text-3xl font-bold mt-1">{topic}</h1>
      </div>
      
      <div className="flex space-x-2 mt-4 md:mt-0">
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-1" /> Remind
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" /> Share
        </Button>
      </div>
    </motion.div>
  );
}