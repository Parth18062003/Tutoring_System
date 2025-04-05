export interface Topic {
    name: string;
    id: string;
  }
  
  export interface SubjectData {
    id: string;
    name: string;
    description: string;
    topics: Topic[];
  }
  
  export function getSubjects(): SubjectData[] {
    return [
      {
        id: "Science",
        name: "Science",
        description: "Learn about the natural world through observation and experimentation",
        topics: [
          { id: "food-where-from", name: "Food: Where Does It Come From?" },
          { id: "components-food", name: "Components of Food" },
          { id: "fibre-fabric", name: "Fibre to Fabric" },
          { id: "sorting-materials", name: "Sorting Materials into Groups" },
          { id: "separation-substances", name: "Separation of Substances" },
          { id: "changes-around-us", name: "Changes Around Us" },
          { id: "plants", name: "Getting to Know Plants" },
          { id: "body-movements", name: "Body Movements" },
          { id: "living-organisms", name: "The Living Organisms and Their Surroundings" },
          { id: "motion-measurement", name: "Motion and Measurement of Distances" },
          { id: "light-shadows", name: "Light, Shadows and Reflection" },
          { id: "electricity-circuits", name: "Electricity and Circuits" },
          { id: "magnets", name: "Fun with Magnets" },
          { id: "water", name: "Water" },
          { id: "air", name: "Air Around Us" },
          { id: "garbage", name: "Garbage In, Garbage Out" }
        ]
      },
      {
        id: "Mathematics",
        name: "Mathematics",
        description: "Develop analytical thinking through numbers, shapes, and patterns",
        topics: [
          { id: "knowing-numbers", name: "Knowing Our Numbers" },
          { id: "whole-numbers", name: "Whole Numbers" },
          { id: "playing-numbers", name: "Playing with Numbers" },
          { id: "basic-geometry", name: "Basic Geometrical Ideas" },
          { id: "elementary-shapes", name: "Understanding Elementary Shapes" },
          { id: "integers", name: "Integers" },
          { id: "fractions", name: "Fractions" },
          { id: "decimals", name: "Decimals" },
          { id: "data-handling", name: "Data Handling" },
          { id: "mensuration", name: "Mensuration" },
          { id: "algebra", name: "Algebra" },
          { id: "ratio-proportion", name: "Ratio and Proportion" },
          { id: "symmetry", name: "Symmetry" },
          { id: "practical-geometry", name: "Practical Geometry" }
        ]
      },
      {
        id: "Social_Science",
        name: "Social Science",
        description: "Study human society and relationships through history, geography, and civics",
        topics: [
          { id: "what-where-how-when", name: "What, Where, How and When?" },
          { id: "earliest-people", name: "On the Trail of the Earliest People" },
          { id: "gathering-growing", name: "From Gathering to Growing Food" },
          { id: "earliest-cities", name: "In the Earliest Cities" },
          { id: "books-burials", name: "What Books and Burials Tell Us" },
          { id: "kings-republic", name: "Kingdoms, Kings and an Early Republic" },
          { id: "questions-ideas", name: "New Questions and Ideas" },
          { id: "ashoka", name: "Ashoka, the Emperor Who Gave Up War" },
          { id: "villages-towns", name: "Vital Villages, Thriving Towns" },
          { id: "earth-solar-system", name: "The Earth in the Solar System" },
          { id: "globe", name: "Globe: Latitudes and Longitudes" },
          { id: "earth-motion", name: "Motion of the Earth" },
          { id: "maps", name: "Maps" },
          { id: "earth-domains", name: "Major Domains of the Earth" },
          { id: "landforms", name: "Major Landforms of the Earth" },
          { id: "india", name: "Our Country – India" },
          { id: "diversity", name: "Understanding Diversity" },
          { id: "discrimination", name: "Diversity and Discrimination" },
          { id: "government", name: "What is Government?" },
          { id: "democratic-government", name: "Key Elements of a Democratic Government" },
          { id: "panchayati-raj", name: "Panchayati Raj" }
        ]
      }
    ];
  }