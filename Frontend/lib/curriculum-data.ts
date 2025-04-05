// src/lib/curriculum-data.ts

export interface CurriculumData {
  [subject: string]: {
    // Optional: Add metadata like grade level if needed per subject
    topics: {
      displayName: string; // e.g., "Components of Food"
      apiName: string; // e.g., "Science-Components of Food"
    }[];
  };
}

export const ncertCurriculum: CurriculumData = {
  Science: {
    topics: [
      {
        displayName: "Food: Where Does It Come From?",
        apiName: "Science-Food: Where Does It Come From?",
      },
      {
        displayName: "Components of Food",
        apiName: "Science-Components of Food",
      },
      { displayName: "Fibre to Fabric", apiName: "Science-Fibre to Fabric" },
      {
        displayName: "Sorting Materials into Groups",
        apiName: "Science-Sorting Materials into Groups",
      },
      {
        displayName: "Separation of Substances",
        apiName: "Science-Separation of Substances",
      },
      {
        displayName: "Changes Around Us",
        apiName: "Science-Changes Around Us",
      },
      {
        displayName: "Getting to Know Plants",
        apiName: "Science-Getting to Know Plants",
      },
      { displayName: "Body Movements", apiName: "Science-Body Movements" },
      {
        displayName: "The Living Organisms and Their Surroundings",
        apiName: "Science-The Living Organisms and Their Surroundings",
      },
      {
        displayName: "Motion and Measurement of Distances",
        apiName: "Science-Motion and Measurement of Distances",
      },
      {
        displayName: "Light, Shadows and Reflection",
        apiName: "Science-Light, Shadows and Reflection",
      },
      {
        displayName: "Electricity and Circuits",
        apiName: "Science-Electricity and Circuits",
      },
      { displayName: "Fun with Magnets", apiName: "Science-Fun with Magnets" },
      { displayName: "Water", apiName: "Science-Water" },
      { displayName: "Air Around Us", apiName: "Science-Air Around Us" },
      {
        displayName: "Garbage In, Garbage Out",
        apiName: "Science-Garbage In, Garbage Out",
      },
    ],
  },
  Mathematics: {
    topics: [
      {
        displayName: "Knowing Our Numbers",
        apiName: "Mathematics-Knowing Our Numbers",
      },
      { displayName: "Whole Numbers", apiName: "Mathematics-Whole Numbers" },
      {
        displayName: "Playing with Numbers",
        apiName: "Mathematics-Playing with Numbers",
      },
      {
        displayName: "Basic Geometrical Ideas",
        apiName: "Mathematics-Basic Geometrical Ideas",
      },
      {
        displayName: "Understanding Elementary Shapes",
        apiName: "Mathematics-Understanding Elementary Shapes",
      },
      { displayName: "Integers", apiName: "Mathematics-Integers" },
      { displayName: "Fractions", apiName: "Mathematics-Fractions" },
      { displayName: "Decimals", apiName: "Mathematics-Decimals" },
      { displayName: "Data Handling", apiName: "Mathematics-Data Handling" },
      { displayName: "Mensuration", apiName: "Mathematics-Mensuration" },
      { displayName: "Algebra", apiName: "Mathematics-Algebra" },
      {
        displayName: "Ratio and Proportion",
        apiName: "Mathematics-Ratio and Proportion",
      },
      { displayName: "Symmetry", apiName: "Mathematics-Symmetry" },
      {
        displayName: "Practical Geometry",
        apiName: "Mathematics-Practical Geometry",
      },
    ],
  },
  "Social Science - History": {
    topics: [
      {
        displayName: "What, Where, How and When?",
        apiName: "Social_Science-History-What, Where, How and When?",
      },
      {
        displayName: "On the Trail of the Earliest People",
        apiName: "Social_Science-History-On the Trail of the Earliest People",
      },
      {
        displayName: "From Gathering to Growing Food",
        apiName: "Social_Science-History-From Gathering to Growing Food",
      },
      {
        displayName: "In the Earliest Cities",
        apiName: "Social_Science-History-In the Earliest Cities",
      },
      {
        displayName: "What Books and Burials Tell Us",
        apiName: "Social_Science-History-What Books and Burials Tell Us",
      },
      {
        displayName: "Kingdoms, Kings and an Early Republic",
        apiName: "Social_Science-History-Kingdoms, Kings and an Early Republic",
      },
      {
        displayName: "New Questions and Ideas",
        apiName: "Social_Science-History-New Questions and Ideas",
      },
      {
        displayName: "Ashoka, the Emperor Who Gave Up War",
        apiName: "Social_Science-History-Ashoka, the Emperor Who Gave Up War",
      },
      {
        displayName: "Vital Villages, Thriving Towns",
        apiName: "Social_Science-History-Vital Villages, Thriving Towns",
      },
      {
        displayName: "Tribes, Nomads and Settled Communities",
        apiName:
          "Social_Science-History-Tribes, Nomads and Settled Communities",
      },
    ],
  },
  "Social Science - Geography": {
    topics: [
      {
        displayName: "The Earth in the Solar System",
        apiName: "Social_Science-Geography-The Earth in the Solar System",
      },
      {
        displayName: "Latitudes and Longitudes",
        apiName: "Social_Science-Geography-Latitudes and Longitudes",
      },
      {
        displayName: "Globe: Latitudes and Longitudes",
        apiName: "Social_Science-Geography-Globe: Latitudes and Longitudes",
      },
      { displayName: "Maps", apiName: "Social_Science-Geography-Maps" },
      {
        displayName: "Major Domains of the Earth",
        apiName: "Social_Science-Geography-Major Domains of the Earth",
      },
      {
        displayName: "Major Landforms of the Earth",
        apiName: "Social_Science-Geography-Major Landforms of the Earth",
      },
      {
        displayName: "Our Country – India",
        apiName: "Social_Science-Geography-Our Country – India",
      },
      {
        displayName: "India: Climate, Vegetation and Wildlife",
        apiName:
          "Social_Science-Geography-India: Climate, Vegetation and Wildlife",
      },
    ],
  },
  "Social Science - Civics": {
    topics: [
      {
        displayName: "Understanding Diversity",
        apiName: "Social_Science-Civics-Understanding Diversity",
      },
      {
        displayName: "Diversity and Discrimination",
        apiName: "Social_Science-Civics-Diversity and Discrimination",
      },
      {
        displayName: "What is Government?",
        apiName: "Social_Science-Civics-What is Government?",
      },
      {
        displayName: "Key Elements of a Democratic Government",
        apiName:
          "Social_Science-Civics-Key Elements of a Democratic Government",
      },
      {
        displayName: "Panchayati Raj",
        apiName: "Social_Science-Civics-Panchayati Raj",
      },
      {
        displayName: "Rural Administration",
        apiName: "Social_Science-Civics-Rural Administration",
      },
      {
        displayName: "Urban Administration",
        apiName: "Social_Science-Civics-Urban Administration",
      },
      {
        displayName: "Disaster Management",
        apiName: "Social_Science-Civics-Disaster Management",
      },
      {
        displayName: "The Constitution",
        apiName: "Social_Science-Civics-The Constitution",
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
