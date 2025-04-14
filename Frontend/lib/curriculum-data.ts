// src/lib/curriculum-data.ts

export interface CurriculumData {
  [subject: string]: {
    // Optional: Add metadata like grade level if needed per subject
    topics: {
      displayName: string; // e.g., "Components of Food"
      apiName: string; // e.g., "Components of Food"
    }[];
  };
}

export const ncertCurriculum: CurriculumData = {
  Science: {
    topics: [
      {
        displayName: "Food: Where Does It Come From?",
        apiName: "Food: Where Does It Come From?",
      },
      {
        displayName: "Components of Food",
        apiName: "Components of Food",
      },
      { displayName: "Fibre to Fabric", apiName: "Fibre to Fabric" },
      {
        displayName: "Sorting Materials into Groups",
        apiName: "Sorting Materials into Groups",
      },
      {
        displayName: "Separation of Substances",
        apiName: "Separation of Substances",
      },
      {
        displayName: "Changes Around Us",
        apiName: "Changes Around Us",
      },
      {
        displayName: "Getting to Know Plants",
        apiName: "Getting to Know Plants",
      },
      { displayName: "Body Movements", apiName: "Body Movements" },
      {
        displayName: "The Living Organisms and Their Surroundings",
        apiName: "The Living Organisms and Their Surroundings",
      },
      {
        displayName: "Motion and Measurement of Distances",
        apiName: "Motion and Measurement of Distances",
      },
      {
        displayName: "Light, Shadows and Reflection",
        apiName: "Light, Shadows and Reflection",
      },
      {
        displayName: "Electricity and Circuits",
        apiName: "Electricity and Circuits",
      },
      { displayName: "Fun with Magnets", apiName: "Fun with Magnets" },
      { displayName: "Water", apiName: "Water" },
      { displayName: "Air Around Us", apiName: "Air Around Us" },
      {
        displayName: "Garbage In, Garbage Out",
        apiName: "Garbage In, Garbage Out",
      },
    ],
  },
  Mathematics: {
    topics: [
      {
        displayName: "Knowing Our Numbers",
        apiName: "Knowing Our Numbers",
      },
      { displayName: "Whole Numbers", apiName: "Whole Numbers" },
      {
        displayName: "Playing with Numbers",
        apiName: "Playing with Numbers",
      },
      {
        displayName: "Basic Geometrical Ideas",
        apiName: "Basic Geometrical Ideas",
      },
      {
        displayName: "Understanding Elementary Shapes",
        apiName: "Understanding Elementary Shapes",
      },
      { displayName: "Integers", apiName: "Integers" },
      { displayName: "Fractions", apiName: "Fractions" },
      { displayName: "Decimals", apiName: "Decimals" },
      { displayName: "Data Handling", apiName: "Data Handling" },
      { displayName: "Mensuration", apiName: "Mensuration" },
      { displayName: "Algebra", apiName: "Algebra" },
      {
        displayName: "Ratio and Proportion",
        apiName: "Ratio and Proportion",
      },
      { displayName: "Symmetry", apiName: "Symmetry" },
      {
        displayName: "Practical Geometry",
        apiName: "Practical Geometry",
      },
    ],
  },
  "Social Science - History": {
    topics: [
      {
        displayName: "What, Where, How and When?",
        apiName: "What, Where, How and When?",
      },
      {
        displayName: "On the Trail of the Earliest People",
        apiName: "On the Trail of the Earliest People",
      },
      {
        displayName: "From Gathering to Growing Food",
        apiName: "From Gathering to Growing Food",
      },
      {
        displayName: "In the Earliest Cities",
        apiName: "In the Earliest Cities",
      },
      {
        displayName: "What Books and Burials Tell Us",
        apiName: "What Books and Burials Tell Us",
      },
      {
        displayName: "Kingdoms, Kings and an Early Republic",
        apiName: "Kingdoms, Kings and an Early Republic",
      },
      {
        displayName: "New Questions and Ideas",
        apiName: "New Questions and Ideas",
      },
      {
        displayName: "Ashoka, the Emperor Who Gave Up War",
        apiName: "Ashoka, the Emperor Who Gave Up War",
      },
      {
        displayName: "Vital Villages, Thriving Towns",
        apiName: "Vital Villages, Thriving Towns",
      },
      {
        displayName: "Tribes, Nomads and Settled Communities",
        apiName:
          "Tribes, Nomads and Settled Communities",
      },
    ],
  },
  "Social Science - Geography": {
    topics: [
      {
        displayName: "The Earth in the Solar System",
        apiName: "The Earth in the Solar System",
      },
      {
        displayName: "Latitudes and Longitudes",
        apiName: "Latitudes and Longitudes",
      },
      {
        displayName: "Globe: Latitudes and Longitudes",
        apiName: "Globe: Latitudes and Longitudes",
      },
      { displayName: "Maps", apiName: "Maps" },
      {
        displayName: "Major Domains of the Earth",
        apiName: "Major Domains of the Earth",
      },
      {
        displayName: "Major Landforms of the Earth",
        apiName: "Major Landforms of the Earth",
      },
      {
        displayName: "Our Country – India",
        apiName: "Our Country – India",
      },
      {
        displayName: "India: Climate, Vegetation and Wildlife",
        apiName:
          "India: Climate, Vegetation and Wildlife",
      },
    ],
  },
  "Social Science - Civics": {
    topics: [
      {
        displayName: "Understanding Diversity",
        apiName: "Understanding Diversity",
      },
      {
        displayName: "Diversity and Discrimination",
        apiName: "Diversity and Discrimination",
      },
      {
        displayName: "What is Government?",
        apiName: "What is Government?",
      },
      {
        displayName: "Key Elements of a Democratic Government",
        apiName:
          "Key Elements of a Democratic Government",
      },
      {
        displayName: "Panchayati Raj",
        apiName: "Panchayati Raj",
      },
      {
        displayName: "Rural Administration",
        apiName: "Rural Administration",
      },
      {
        displayName: "Urban Administration",
        apiName: "Urban Administration",
      },
      {
        displayName: "Disaster Management",
        apiName: "Disaster Management",
      },
      {
        displayName: "The Constitution",
        apiName: "The Constitution",
      },
    ],
  },
};

// Define available actions
export const contentActions = [
  {
    id: "lesson",
    label: "Learn",
    description: "Start an interactive lesson.",
    icon: "BookOpenText",
    page: "/learn/lesson",
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Test your understanding.",
    icon: "FileQuestion",
    page: "/learn/quiz",
  },
  {
    id: "flashcard",
    label: "Flashcards",
    description: "Review key terms.",
    icon: "Layers",
    page: "/learn/flashcards",
  },
  {
    id: "cheatsheet",
    label: "Cheatsheet",
    description: "Get a quick summary.",
    icon: "ScrollText",
    page: "/learn/cheatsheet",
  },
  {
    id: "explanation",
    label: "Explain",
    description: "Get a detailed explanation.",
    icon: "Lightbulb",
    page: "/learn/explanation",
  },
] as const; // Use "as const" for stricter type inference

export type ContentActionId = (typeof contentActions)[number]["id"];
