import { motion } from "framer-motion";
import { BookOpen, Clock, Award } from "lucide-react";

interface QuizHeaderProps {
  className: string;
  subject: string;
  topic: string;
  isCompleted: boolean;
}

export default function QuizHeader({ className, subject, topic, isCompleted }: QuizHeaderProps) {
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
        <h1 className="text-2xl font-bold mt-1">
          {isCompleted ? 'Quiz Results: ' : 'Quiz: '}{topic}
        </h1>
      </div>
      
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        {isCompleted ? (
          <div className="flex items-center text-yellow-500">
            <Award className="h-5 w-5 mr-1" />
            <span className="font-medium">Completed</span>
          </div>
        ) : (
          <div className="flex items-center text-blue-500">
            <Clock className="h-5 w-5 mr-1" />
            <span className="font-medium">In Progress</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}