"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MatchingQuestion, UserAnswer } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface MatchingQuestionCardProps {
  question: MatchingQuestion;
  index: number;
  onAnswer: (answer: UserAnswer) => void;
  userAnswer?: { itemId: string; matchId: string }[];
  showCorrectAnswer?: boolean;
}

export default function MatchingQuestionCard({
  question,
  index,
  onAnswer,
  userAnswer = [],
  showCorrectAnswer = false,
}: MatchingQuestionCardProps) {
  // Ensure these arrays exist, or provide empty arrays as fallback
  const items = Array.isArray(question.items) ? question.items : [];
  const matches = Array.isArray(question.matches) ? question.matches : [];
  const correctPairs = Array.isArray(question.correctPairs) ? question.correctPairs : [];

  // Check if question has valid data
  const isValidQuestion = items.length > 0 && matches.length > 0;
  
  const [pairings, setPairings] = useState<{ itemId: string; matchId: string }[]>(
    userAnswer || []
  );

  const handleSelectMatch = (itemId: string, matchId: string) => {
    // If the special "none" value is selected, it means user wants to clear the selection
    if (matchId === "none") {
      const updatedPairings = pairings.filter(p => p.itemId !== itemId);
      setPairings(updatedPairings);
      return;
    }
    
    const updatedPairings = [...pairings.filter(p => p.itemId !== itemId)];
    
    // Only add if match is selected
    if (matchId) {
      updatedPairings.push({ itemId, matchId });
    }
    
    setPairings(updatedPairings);
  };

  useEffect(() => {
    // When user changes a match, automatically submit the answer
    if (pairings.length > 0) {
      onAnswer({
        questionId: question.id,
        type: 'matching',
        pairs: pairings,
      });
    }
  }, [pairings, question.id, onAnswer]);

  const getMatchForItem = (itemId: string) => {
    return pairings.find(p => p.itemId === itemId)?.matchId || "";
  };

  const isCorrectPair = (itemId: string, matchId: string) => {
    if (!showCorrectAnswer || !matchId) return false;
    
    return correctPairs.some(
      pair => pair.itemId === itemId && pair.matchId === matchId
    );
  };

  const isWrongPair = (itemId: string, userMatchId: string) => {
    if (!showCorrectAnswer || !userMatchId) return false;
    
    return !correctPairs.some(
      pair => pair.itemId === itemId && pair.matchId === userMatchId
    );
  };

  const getCorrectMatchForItem = (itemId: string) => {
    const correctPair = correctPairs.find(p => p.itemId === itemId);
    if (!correctPair) return "";
    
    const match = matches.find(m => m.id === correctPair.matchId);
    return match?.text || "";
  };

  // Filter out matches that are already selected (to prevent duplicates)
  const getAvailableMatches = (currentItemId: string) => {
    const selectedMatchIds = pairings
      .filter(pair => pair.itemId !== currentItemId)
      .map(pair => pair.matchId);
      
    return matches.filter(match => !selectedMatchIds.includes(match.id));
  };

  // If question is malformed, render an error message
  if (!isValidQuestion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {index + 1}. {question.question || "Matching question"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                This matching question is missing required data. Please try a different question or regenerate the quiz.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {index + 1}. {question.question || "Match the following items"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Items</h3>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-md border ${
                      showCorrectAnswer && getMatchForItem(item.id)
                        ? isCorrectPair(item.id, getMatchForItem(item.id))
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200"
                    }`}
                  >
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Matches</h3>
                {items.map((item) => {
                  const userMatchId = getMatchForItem(item.id);
                  const availableMatches = getAvailableMatches(item.id);
                  // For correct answer display, always show all options
                  const displayMatches = showCorrectAnswer ? matches : availableMatches;
                  
                  // Find the text of the selected match
                  const selectedMatch = matches.find(m => m.id === userMatchId);
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-2">
                      {showCorrectAnswer ? (
                        <div className={`p-3 rounded-md border flex-grow ${
                          userMatchId
                            ? isCorrectPair(item.id, userMatchId)
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200"
                        }`}>
                          <p>{selectedMatch ? selectedMatch.text : "Not answered"}</p>
                          {isWrongPair(item.id, userMatchId) && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Correct: {getCorrectMatchForItem(item.id)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Select
                          value={userMatchId || "none"}
                          onValueChange={(value) => handleSelectMatch(item.id, value)}
                          disabled={showCorrectAnswer}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a match..." />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Fixed: changed empty string to "none" value */}
                            <SelectItem value="none">-- Select --</SelectItem>
                            {displayMatches.map((match) => (
                              <SelectItem key={match.id} value={match.id}>
                                {match.text}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {showCorrectAnswer && question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm font-medium">Explanation:</p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}