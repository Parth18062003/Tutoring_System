// src/components/adaptive/ContentSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Use App Router's navigation
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ncertCurriculum,
  contentActions,
  ContentActionId,
} from "@/lib/curriculum-data"; // Adjust import path
import { toast } from "sonner";

interface TopicOption {
  displayName: string;
  apiName: string;
}

export function ContentSelector() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<TopicOption[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>(""); // Stores apiName
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ContentActionId | null>(
    null
  );

  // Load subjects on mount
  useEffect(() => {
    setSubjects(Object.keys(ncertCurriculum));
    // Optionally select the first subject by default
    // const firstSubject = Object.keys(ncertCurriculum)[0];
    // if (firstSubject) handleSubjectChange(firstSubject);
  }, []);

  // Update available topics when subject changes
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    const topics = ncertCurriculum[subject]?.topics || [];
    setAvailableTopics(topics);
    setSelectedTopic(""); // Reset topic selection
    setSelectedAction(null); // Reset action selection
  };

  // Handle topic selection
  const handleTopicChange = (topicApiName: string) => {
    setSelectedTopic(topicApiName);
    // Reset action if topic changes? Maybe not necessary.
    // setSelectedAction(null);
  };

  // Handle action card selection
  const handleActionSelect = (actionId: ContentActionId) => {
    setSelectedAction(actionId);
  };

  // Handle navigation
// Update ContentSelector.tsx to ensure the topic is properly formatted:

// Handle navigation
const handleStartLearning = () => {
  if (isNavigating || !selectedSubject || !selectedTopic || !selectedAction) {
    toast.warning("Please select a subject, topic, and action.");
    return;
  }

  setIsNavigating(true);

  const actionConfig = contentActions.find((a) => a.id === selectedAction);
  if (!actionConfig) {
    toast.error("Invalid action selected.");
    setIsNavigating(false);
    return;
  }

  // Get the topic display name to show a more user-friendly name
  const selectedTopicObj = availableTopics.find(t => t.apiName === selectedTopic);
  const topicDisplayName = selectedTopicObj?.displayName || selectedTopic;

  // Pass both API name and display name in the URL
  const targetUrl = `/learn?subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(selectedTopic)}&topicName=${encodeURIComponent(topicDisplayName)}&action=${encodeURIComponent(selectedAction)}`;
  console.log(`Navigating to: ${targetUrl}`);

  router.push(targetUrl);
};

  const isStartDisabled = !selectedSubject || !selectedTopic || !selectedAction;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Select Your Learning Activity</CardTitle>
        <CardDescription>
          Choose a subject, topic, and how you want to engage with the material.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject and Topic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="subject-select">Subject</Label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Select a subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic-select">Topic</Label>
            <Select
              value={selectedTopic}
              onValueChange={handleTopicChange}
              disabled={!selectedSubject || availableTopics.length === 0}
            >
              <SelectTrigger id="topic-select">
                <SelectValue
                  placeholder={
                    !selectedSubject
                      ? "Select subject first"
                      : "Select a topic..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic.apiName} value={topic.apiName}>
                    {topic.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Selection */}
        {selectedSubject &&
          selectedTopic && ( // Only show actions once topic is selected
            <div className="space-y-3">
              <Label>Choose an Activity</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {contentActions.map((action) => {
                  const isSelected = selectedAction === action.id;
                  return (
                    <Card
                      key={action.id}
                      onClick={() => handleActionSelect(action.id)}
                      className={cn(
                        "cursor-pointer hover:border-primary transition-colors",
                        isSelected
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : ""
                      )}
                    >
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                          {action.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        {/* Start Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleStartLearning}
            disabled={isStartDisabled || isNavigating}
            size="lg"
          >
            {isNavigating ? "Loading..." : "Start Learning"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
