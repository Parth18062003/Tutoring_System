// src/components/adaptive/FlippableCard.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Add useEffect
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface FlippableCardProps {
  frontContent: string;
  backContent: string;
  className?: string;
}

export function FlippableCard({ frontContent, backContent, className }: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    console.log('handleFlip triggered! Current state:', isFlipped); // Log before update
    setIsFlipped(prevState => {
      console.log('Updating isFlipped state to:', !prevState); // Log the new state
      return !prevState;
    });
  };

  // Log whenever isFlipped changes
  useEffect(() => {
    console.log('isFlipped state changed to:', isFlipped);
  }, [isFlipped]);

  const transition = { duration: 0.6, ease: "easeInOut" };

  const variants = {
    // Variants now directly control the 'rotateY' property
    visible: { // State when the face should be pointing forward
        rotateY: 0,
        transition: transition,
    },
    hidden: { // State when the face should be pointing backward
        rotateY: 180,
        transition: transition,
    }
  };

  const cardFaceStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformStyle: 'preserve-3d', // Apply preserve-3d here too for safety
  } as React.CSSProperties;

  // Log props to ensure content is coming through
  // console.log("FlippableCard Props:", { frontContent, backContent });

  return (
    <div
      className={cn("relative w-full aspect-video cursor-pointer", className)}
      style={{ perspective: '1000px' }}
      onClick={handleFlip} // Ensure onClick is here
      role="button"
      tabIndex={0}
      aria-label={`Flashcard. Front: ${frontContent.substring(0,30)}. Click to flip.`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); }}
    >
        {/* No extra container needed here */}
            {/* Front Face */}
            {/* Animate between 'visible' and 'hidden' based on isFlipped */}
            <motion.div
                style={cardFaceStyle}
                variants={variants}
                initial="visible" // Start visible
                animate={isFlipped ? "hidden" : "visible"} // Control animation based on state
            >
                <Card className="w-full h-full">
                    <CardContent className="flex items-center justify-center text-center h-full p-4 overflow-auto">
                         <div className='max-h-full'>
                             <MarkdownRenderer content={frontContent || 'Front'} />
                         </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Back Face */}
            {/* Animate between 'hidden' and 'visible' based on isFlipped */}
             <motion.div
                style={{...cardFaceStyle, transform: 'rotateY(180deg)'}} // Start rotated away
                variants={variants}
                initial="hidden" // Start hidden (rotated)
                animate={isFlipped ? "visible" : "hidden"} // Control animation based on state
            >
                 <Card className="w-full h-full">
                    <CardContent className="flex items-center justify-center text-center h-full p-4 overflow-auto">
                         <div className='max-h-full'>
                             <MarkdownRenderer content={backContent || 'Back'} />
                         </div>
                    </CardContent>
                </Card>
            </motion.div>

         {/* Minimal inline styles for core functionality */}
         <style jsx>{`
            .max-h-full {
                max-height: 100%;
            }
            .overflow-auto {
                overflow: auto;
            }
         `}</style>
    </div>
  );
}