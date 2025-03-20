"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Calculator, FlaskConical, Globe, History, LucideIcon, Microscope, Music, Palette, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardSelector, { CardOption } from "../CardSelector";
import { cn } from "@/lib/utils";

// Mock data - you would replace this with real data from your API
const subjectsData: (CardOption & { icon: LucideIcon; topics: CardOption[] })[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    description: "Numbers, algebra, geometry and more",
    icon: Calculator,
    topics: [
      { id: "algebra", title: "Algebra", description: "Equations, expressions, and variables" },
      { id: "geometry", title: "Geometry", description: "Shapes, areas, and spatial reasoning" },
      { id: "calculus", title: "Calculus", description: "Differentiation and integration" },
      { id: "trigonometry", title: "Trigonometry", description: "Sine, cosine, tangent and their applications" },
      { id: "statistics", title: "Statistics", description: "Data collection, analysis and interpretation" },
      { id: "arithmetic", title: "Arithmetic", description: "Basic number operations and properties" },
    ]
  },
  {
    id: "science",
    title: "Science",
    description: "Physics, chemistry, biology concepts",
    icon: FlaskConical,
    topics: [
      { id: "motion", title: "Laws of Motion", description: "Newton's laws and their applications" },
      { id: "periodic_table", title: "Periodic Table", description: "Elements and their properties" },
      { id: "cell_biology", title: "Cell Biology", description: "Structure and function of cells" },
      { id: "electricity", title: "Electricity", description: "Current, voltage, and circuits" },
      { id: "genetics", title: "Genetics", description: "DNA, inheritance, and genetic disorders" },
      { id: "chemical_reactions", title: "Chemical Reactions", description: "Types and balancing of reactions" },
    ]
  },
  {
    id: "english",
    title: "English",
    description: "Grammar, literature, and writing skills",
    icon: BookOpen,
    topics: [
      { id: "grammar", title: "Grammar", description: "Parts of speech and sentence structure" },
      { id: "literature", title: "Literature", description: "Classic and modern literary works" },
      { id: "writing", title: "Writing", description: "Essays, stories, and creative writing" },
      { id: "poetry", title: "Poetry", description: "Poems, rhymes, and poetic devices" },
      { id: "comprehension", title: "Comprehension", description: "Reading and understanding texts" },
      { id: "vocabulary", title: "Vocabulary", description: "Word meanings and usage" },
    ]
  },
  {
    id: "social_studies",
    title: "Social Studies",
    description: "History, geography, and civics",
    icon: Globe,
    topics: [
      { id: "ancient_civilizations", title: "Ancient Civilizations", description: "Early human societies and cultures" },
      { id: "geography", title: "Geography", description: "Landforms, climate, and human geography" },
      { id: "civics", title: "Civics", description: "Government and citizenship" },
      { id: "economics", title: "Economics", description: "Basic economic concepts and systems" },
      { id: "world_wars", title: "World Wars", description: "Causes and effects of global conflicts" },
      { id: "indian_freedom", title: "Indian Freedom Movement", description: "Struggle for independence" },
    ]
  },
  {
    id: "hindi",
    title: "Hindi",
    description: "भाषा, साहित्य और व्याकरण",
    icon: Volume2,
    topics: [
      { id: "vyakaran", title: "व्याकरण", description: "हिंदी भाषा का व्याकरण" },
      { id: "kavita", title: "कविता", description: "हिंदी कविता और काव्य" },
      { id: "kahani", title: "कहानी", description: "हिंदी साहित्य की कहानियाँ" },
      { id: "nibandh", title: "निबंध", description: "विभिन्न विषयों पर निबंध" },
      { id: "muhavare", title: "मुहावरे", description: "हिंदी के मुहावरे और लोकोक्तियाँ" },
      { id: "patra_lekhan", title: "पत्र लेखन", description: "औपचारिक और अनौपचारिक पत्र" },
    ]
  },
  {
    id: "art",
    title: "Art",
    description: "Drawing, painting, and artistic techniques",
    icon: Palette,
    topics: [
      { id: "sketching", title: "Sketching", description: "Basic drawing techniques" },
      { id: "painting", title: "Painting", description: "Color theory and painting methods" },
      { id: "art_history", title: "Art History", description: "Important art movements and artists" },
      { id: "craft", title: "Craft", description: "Handmade projects and techniques" },
      { id: "digital_art", title: "Digital Art", description: "Creating art with digital tools" },
      { id: "sculpture", title: "Sculpture", description: "3D art forms and techniques" },
    ]
  },
];

interface SubjectTopicSelectorProps {
  onSelectionComplete: (classNum: string, subject: string, topic: string) => void;
  className?: string;
}

export default function SubjectTopicSelector({ onSelectionComplete, className }: SubjectTopicSelectorProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [step, setStep] = useState<"class" | "subject" | "topic">("class");

  // Class options
  const classOptions: CardOption[] = [
    { id: "6", title: "Class 6", description: "For students aged 11-12 years" },
    { id: "7", title: "Class 7", description: "For students aged 12-13 years" },
    { id: "8", title: "Class 8", description: "For students aged 13-14 years" },
    { id: "9", title: "Class 9", description: "For students aged 14-15 years" },
    { id: "10", title: "Class 10", description: "For students aged 15-16 years" },
    { id: "11", title: "Class 11", description: "For students aged 16-17 years" },
    { id: "12", title: "Class 12", description: "For students aged 17-18 years" },
  ];

  const handleClassSelect = (option: CardOption) => {
    setSelectedClass(option.id);
    setStep("subject");
  };

  const handleSubjectSelect = (option: CardOption) => {
    setSelectedSubject(option.id);
    setStep("topic");
  };

  const handleTopicSelect = (option: CardOption) => {
    setSelectedTopic(option.id);
  };

  const handleContinue = () => {
    if (selectedClass && selectedSubject && selectedTopic) {
      const subjectTitle = subjectsData.find(s => s.id === selectedSubject)?.title || "";
      const topicTitle = subjectsData
        .find(s => s.id === selectedSubject)?.topics
        .find(t => t.id === selectedTopic)?.title || "";
        
      onSelectionComplete(selectedClass, subjectTitle, topicTitle);
    }
  };

  const handleBack = () => {
    if (step === "topic") {
      setStep("subject");
      setSelectedTopic("");
    } else if (step === "subject") {
      setStep("class");
      setSelectedSubject("");
    }
  };

  // Get subjects for the current step
  const subjects = subjectsData.map(subject => ({
    ...subject,
    icon: <subject.icon className="h-6 w-6 text-primary" />,
  }));

  // Get topics for selected subject
  const topics = subjectsData
    .find(s => s.id === selectedSubject)?.topics || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("max-w-6xl mx-auto p-4", className)}
    >
      <div className="space-y-8">
        {step === "class" && (
          <CardSelector
            title="Select Your Class"
            subtitle="Choose your class to get started"
            options={classOptions}
            selectedId={selectedClass}
            onSelect={handleClassSelect}
          />
        )}

        {step === "subject" && (
          <CardSelector
            title="Select a Subject"
            subtitle="Choose a subject to explore"
            options={subjects}
            selectedId={selectedSubject}
            onSelect={handleSubjectSelect}
          />
        )}

        {step === "topic" && (
          <CardSelector
            title="Select a Topic"
            subtitle="Choose a topic to learn about"
            options={topics}
            selectedId={selectedTopic}
            onSelect={handleTopicSelect}
          />
        )}

        <div className="flex justify-between pt-4">
          {step !== "class" && (
            <Button 
              variant="outline" 
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          
          {step === "class" ? (
            <Button 
              className="ml-auto"
              disabled={!selectedClass}
              onClick={() => setStep("subject")}
            >
              Continue
            </Button>
          ) : step === "subject" ? (
            <Button 
              className="ml-auto"
              disabled={!selectedSubject}
              onClick={() => setStep("topic")}
            >
              Continue
            </Button>
          ) : (
            <Button 
              className="ml-auto"
              disabled={!selectedTopic}
              onClick={handleContinue}
            >
              Start
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}