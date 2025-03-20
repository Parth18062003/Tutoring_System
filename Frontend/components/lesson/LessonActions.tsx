import { motion } from "framer-motion";
import { BookmarkPlus, MessageSquare, PenLine, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface LessonActionsProps {
  topic: string;
}

export default function LessonActions({ topic }: LessonActionsProps) {
  const [isNoteTaking, setIsNoteTaking] = useState(false);
  const [notes, setNotes] = useState("");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-card rounded-lg shadow-md p-4 space-y-4"
    >
      <h3 className="font-semibold text-base mb-2">Actions</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="flex items-center justify-center">
          <ThumbsUp className="h-4 w-4 mr-1" /> 
          <span>Helpful</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center justify-center">
          <BookmarkPlus className="h-4 w-4 mr-1" /> 
          <span>Save</span>
        </Button>
      </div>
      
      <div className="pt-2 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center justify-start w-full"
          onClick={() => setIsNoteTaking(!isNoteTaking)}
        >
          <PenLine className="h-4 w-4 mr-2" /> 
          <span>Take Notes</span>
        </Button>
        
        {isNoteTaking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <Textarea
              placeholder={`Write your notes about ${topic}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm">Save Notes</Button>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="pt-2 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center justify-start w-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" /> 
          <span>Ask Question</span>
        </Button>
      </div>
    </motion.div>
  );
}