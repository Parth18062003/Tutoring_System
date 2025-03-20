export type ClassType = '6' | '7' | '8' | '9' | '10' | '11' | '12'

export type SubjectType = 
  | 'mathematics' 
  | 'science' 
  | 'socialScience' 
  | 'english' 
  | 'hindi'

type TopicData = {
  [subject in SubjectType]: {
    [classNum in ClassType]?: string[]
  }
}

// This is sample topic data - expand it with more accurate NCERT topics
export const topicsData: TopicData = {
  mathematics: {
    '6': [
      'Knowing Our Numbers',
      'Whole Numbers',
      'Playing with Numbers',
      'Basic Geometrical Ideas',
      'Understanding Elementary Shapes',
      'Integers',
      'Fractions',
      'Decimals',
      'Data Handling',
      'Mensuration',
      'Algebra',
      'Ratio and Proportion',
      'Symmetry',
      'Practical Geometry'
    ],
    '7': [
      'Integers',
      'Fractions and Decimals',
      'Data Handling',
      'Simple Equations',
      'Lines and Angles',
      'Triangles',
      'Comparing Quantities',
      'Rational Numbers',
      'Practical Geometry',
      'Perimeter and Area',
      'Algebraic Expressions',
      'Exponents and Powers',
      'Symmetry',
      'Visualizing Solid Shapes'
    ],
    '8': [
      'Rational Numbers',
      'Linear Equations in One Variable',
      'Understanding Quadrilaterals',
      'Practical Geometry',
      'Data Handling',
      'Squares and Square Roots',
      'Cubes and Cube Roots',
      'Comparing Quantities',
      'Algebraic Expressions and Identities',
      'Visualizing Solid Shapes',
      'Mensuration',
      'Exponents and Powers',
      'Direct and Inverse Proportions',
      'Factorization',
      'Introduction to Graphs',
      'Playing with Numbers'
    ],
    '9': [
      'Number Systems',
      'Polynomials',
      'Coordinate Geometry',
      'Linear Equations in Two Variables',
      'Introduction to Euclid\'s Geometry',
      'Lines and Angles',
      'Triangles',
      'Quadrilaterals',
      'Areas of Parallelograms and Triangles',
      'Circles',
      'Constructions',
      'Heron\'s Formula',
      'Surface Areas and Volumes',
      'Statistics',
      'Probability'
    ],
    '10': [
      'Real Numbers',
      'Polynomials',
      'Pair of Linear Equations in Two Variables',
      'Quadratic Equations',
      'Arithmetic Progressions',
      'Triangles',
      'Coordinate Geometry',
      'Introduction to Trigonometry',
      'Some Applications of Trigonometry',
      'Circles',
      'Constructions',
      'Areas Related to Circles',
      'Surface Areas and Volumes',
      'Statistics',
      'Probability'
    ],
    '11': [
      'Sets',
      'Relations and Functions',
      'Trigonometric Functions',
      'Principle of Mathematical Induction',
      'Complex Numbers and Quadratic Equations',
      'Linear Inequalities',
      'Permutations and Combinations',
      'Binomial Theorem',
      'Sequences and Series',
      'Straight Lines',
      'Conic Sections',
      'Introduction to Three Dimensional Geometry',
      'Limits and Derivatives',
      'Mathematical Reasoning',
      'Statistics',
      'Probability'
    ],
    '12': [
      'Relations and Functions',
      'Inverse Trigonometric Functions',
      'Matrices',
      'Determinants',
      'Continuity and Differentiability',
      'Application of Derivatives',
      'Integrals',
      'Application of Integrals',
      'Differential Equations',
      'Vector Algebra',
      'Three Dimensional Geometry',
      'Linear Programming',
      'Probability'
    ]
  },
  science: {
    '6': [
      'Food: Where Does It Come From?',
      'Components of Food',
      'Fibre to Fabric',
      'Sorting Materials into Groups',
      'Separation of Substances',
      'Changes Around Us',
      'Getting to Know Plants',
      'Body Movements',
      'The Living Organisms and Their Surroundings',
      'Motion and Measurement of Distances',
      'Light, Shadows and Reflections',
      'Electricity and Circuits',
      'Fun with Magnets',
      'Water',
      'Air Around Us',
      'Garbage In, Garbage Out'
    ],
    '9': [
      'Matter in Our Surroundings',
      'Is Matter Around Us Pure',
      'Atoms and Molecules',
      'Structure of the Atom',
      'The Fundamental Unit of Life',
      'Tissues',
      'Diversity in Living Organisms',
      'Motion',
      'Force and Laws of Motion',
      'Gravitation',
      'Work and Energy',
      'Sound',
      'Why Do We Fall Ill',
      'Natural Resources',
      'Improvement in Food Resources'
    ],
    '10': [
      'Chemical Reactions and Equations',
      'Acids, Bases and Salts',
      'Metals and Non-metals',
      'Carbon and its Compounds',
      'Periodic Classification of Elements',
      'Life Processes',
      'Control and Coordination',
      'How do Organisms Reproduce?',
      'Heredity and Evolution',
      'Light - Reflection and Refraction',
      'Human Eye and Colorful World',
      'Electricity',
      'Magnetic Effects of Electric Current',
      'Sources of Energy',
      'Our Environment',
      'Management of Natural Resources'
    ]
  },
  socialScience: {
    '9': [
      'The French Revolution',
      'Socialism in Europe and the Russian Revolution',
      'Nazism and the Rise of Hitler',
      'Forest Society and Colonialism',
      'Pastoralists in the Modern World',
      'Peasants and Farmers',
      'India - Size and Location',
      'Physical Features of India',
      'Drainage',
      'Climate',
      'Natural Vegetation and Wildlife',
      'Population',
      'Democracy in the Contemporary World',
      'What is Democracy? Why Democracy?',
      'Constitutional Design',
      'Electoral Politics',
      'Working of Institutions',
      'Democratic Rights',
      'The Story of Village Palampur',
      'People as Resource',
      'Poverty as a Challenge',
      'Food Security in India'
    ]
  },
  english: {
    '10': [
      'A Letter to God',
      'Nelson Mandela: Long Walk to Freedom',
      'Two Stories About Flying',
      'From the Diary of Anne Frank',
      'The Hundred Dresses',
      'Glimpses of India',
      'Mijbil the Otter',
      'Madam Rides the Bus',
      'The Sermon at Benares',
      'The Proposal'
    ]
  },
  hindi: {
    '7': [
      'हम पंछी उन्मुक्त गगन के',
      'दादी माँ',
      'हिमालय की बेटियाँ',
      'कठपुतली',
      'मीठाईवाला',
      'रक्त और हमारा शरीर',
      'पापा खो गए',
      'शाम - एक किसान'
    ]
  }
}

export function topicsBySubjectAndClass(subject: SubjectType, classNum: ClassType): string[] {
  return topicsData[subject]?.[classNum] || [];
}