"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubjectSelector } from "@/components/learning/subject-selector";
import { TopicSelector } from "@/components/learning/topic-selector";
import { ContentTypeSelector } from "@/components/learning/content-type-selector";
import ReturnButtons from "@/components/return-buttons";

export default function LearningPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(null);
  };

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleSelectContentType = (contentType: string) => {
    if (contentType && selectedSubject && selectedTopic) {
      router.push(
        `/learning/${contentType}?subject=${encodeURIComponent(
          selectedSubject
        )}&topic=${encodeURIComponent(selectedTopic)}`
      );
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
  };

  return (
    <main className="min-h-screen px-4 md:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto rounded-lg p-6 space-y-8">
        <div className="text-center">
          <ReturnButtons className="absolute"/>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Adaptive Learning
          </h1>
          <p className="mt-2 text-sm md:text-base">
            Select a subject, topic, and content type to continue.
          </p>
        </div>

        {!selectedSubject && (
          <SubjectSelector onSelect={handleSelectSubject} />
        )}

        {selectedSubject && !selectedTopic && (
          <TopicSelector
            subjectId={selectedSubject}
            onSelect={handleSelectTopic}
            onBack={handleBackToSubjects}
          />
        )}

        {selectedSubject && selectedTopic && (
          <ContentTypeSelector
            subjectId={selectedSubject}
            topic={selectedTopic}
            onSelect={handleSelectContentType}
            onBack={handleBackToTopics}
          />
        )}
      </div>
    </main>
  );
}
