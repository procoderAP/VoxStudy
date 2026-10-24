import { CourseBranch, CourseDocument, AcademicYear, CourseItem, EducationTier } from '../types';
import { COLLEGE_BRANCHES, createSentencesFromText } from './bitsDubaiCourses';

// ----------------------------------------------------
// Primary School (Grades 1–5) Starter Content & Subjects
// ----------------------------------------------------

const primaryEnglishText = `Chapter 1: The Magic of Reading and Words
Reading is one of the most exciting superpowers you can ever learn. Every book is a doorway to a new world filled with adventures, curious animals, and brilliant inventors.
When you read, your brain paints pictures using words. Words are built from small building blocks called letters and sounds, which we call phonics.
For example, the letter S sounds like a gentle snake hissing, while the letter B makes a bouncy pop sound. When you combine them with vowels like A, E, I, O, and U, words come alive.
Reading every day expands your vocabulary. A rich vocabulary helps you express your happiest moments, your greatest questions, and your wildest dreams clearly to teachers, friends, and family.`;

const primaryMathText = `Chapter 1: Numbers, Shapes, and Patterns
Mathematics is the secret language of nature. Look around you and you will see math everywhere you go.
The clock on your wall counts time in numbers. Honeybees build their cozy hives in beautiful six-sided hexagons.
Numbers help us count our toys, measure how tall we grow each year, and share treats fairly with our best friends.
When we add numbers together, we are putting groups into a bigger team. For example, three red apples plus two green apples give us five crunchy apples in total.
Shapes also tell wonderful stories. A triangle has three strong sides, a square has four equal sides, and a circle rolls forever without any corners at all.`;

const primaryEvsText = `Chapter 1: Our Wonderful Planet Earth and Living Things
Earth is our beautiful home in the solar system, surrounded by a blanket of fresh air that allows us to breathe and grow.
Our planet is alive with millions of fascinating plants and animals. Plants are nature's green food factories. They use gentle sunlight, clean water, and rich soil to make sweet fruits and release crisp oxygen for us.
Animals live in many different habitats. Camels are built to walk comfortably across warm desert sands, while polar bears wear thick furry coats to stay cozy in frosty snow.
We must protect our Earth by saving clean water, planting shady trees, and keeping our parks and oceans free of plastic litter.`;

const primaryScienceText = `Chapter 1: Exploring Light, Shadow, and Energy
Science begins with asking curious questions: Why is the sky blue? How do airplanes fly? What makes a shadow appear?
Light travels in straight lines very quickly. When an object stands in the way of a beam of light, it blocks the rays and creates a dark shape behind it called a shadow.
Notice how your shadow is long and stretched out in the early morning sun, but shrinks right beneath your sneakers when the midday sun is high overhead.
Energy is what makes things move, shine, and warm up. The bright sun gives us heat energy and light energy, which powers life on Earth every single morning.`;

// Primary School Branch Definition (Zero Subject Codes)
export const PRIMARY_SCHOOL_BRANCH: CourseBranch = {
  id: 'primary-school',
  name: 'Primary Elementary Curriculum',
  shortName: 'Primary (Grades 1–5)',
  description: 'Foundational literacy, numeracy, environmental studies, and nature exploration for Grades 1 through 5.',
  iconName: 'BookOpen',
  tier: 'primary',
  years: {
    'Grade 1': [
      {
        id: 'prim-g1-eng',
        title: 'English Reading & Fun Phonics',
        description: 'Alphabet sound recognition, basic sight words, and illustrated story listening.',
        sampleDocument: {
          id: 'doc-prim-g1-eng',
          title: 'English Reading & Fun Phonics',
          branchId: 'primary-school',
          year: 'Grade 1',
          rawText: primaryEnglishText,
          sentences: createSentencesFromText(primaryEnglishText, 'Chapter 1: The Magic of Reading'),
          chapters: [{ title: 'Chapter 1: The Magic of Reading', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'prim-g1-math',
        title: 'Numbers & Playful Counting',
        description: 'Counting 1 to 100, simple addition, basic 2D shapes, and visual patterns.',
        sampleDocument: {
          id: 'doc-prim-g1-math',
          title: 'Numbers & Playful Counting',
          branchId: 'primary-school',
          year: 'Grade 1',
          rawText: primaryMathText,
          sentences: createSentencesFromText(primaryMathText, 'Chapter 1: Numbers & Shapes'),
          chapters: [{ title: 'Chapter 1: Numbers & Shapes', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'prim-g1-evs',
        title: 'Environmental Studies: My Family & Nature',
        description: 'Understanding seasons, caring for pets, plant life cycles, and healthy habits.',
        sampleDocument: {
          id: 'doc-prim-g1-evs',
          title: 'Environmental Studies: My Family & Nature',
          branchId: 'primary-school',
          year: 'Grade 1',
          rawText: primaryEvsText,
          sentences: createSentencesFromText(primaryEvsText, 'Chapter 1: Our Wonderful Earth'),
          chapters: [{ title: 'Chapter 1: Our Wonderful Earth', startSentenceIndex: 0 }],
        },
      },
    ],
    'Grade 2': [
      {
        id: 'prim-g2-eng',
        title: 'Sentence Building & Creative Vocabulary',
        description: 'Punctuation, nouns, verbs, descriptive adjectives, and short narrative reading.',
        sampleDocument: {
          id: 'doc-prim-g2-eng',
          title: 'Sentence Building & Creative Vocabulary',
          branchId: 'primary-school',
          year: 'Grade 2',
          rawText: primaryEnglishText,
          sentences: createSentencesFromText(primaryEnglishText, 'Chapter 1: Sentence Building'),
          chapters: [{ title: 'Chapter 1: Sentence Building', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'prim-g2-math',
        title: 'Addition, Subtraction & Time Telling',
        description: 'Two-digit arithmetic, reading analog clocks, and understanding coins and money.',
      },
      {
        id: 'prim-g2-sci',
        title: 'Curious Science: Light, Shadows & Weather',
        description: 'Sun, moon phases, shadow formation, rain clouds, and the four seasons.',
        sampleDocument: {
          id: 'doc-prim-g2-sci',
          title: 'Curious Science: Light, Shadows & Weather',
          branchId: 'primary-school',
          year: 'Grade 2',
          rawText: primaryScienceText,
          sentences: createSentencesFromText(primaryScienceText, 'Chapter 1: Light & Shadows'),
          chapters: [{ title: 'Chapter 1: Light & Shadows', startSentenceIndex: 0 }],
        },
      },
    ],
    'Grade 3': [
      {
        id: 'prim-g3-eng',
        title: 'Reading Comprehension & Story Writing',
        description: 'Paragraph construction, character development, metaphors, and spelling strategies.',
      },
      {
        id: 'prim-g3-math',
        title: 'Multiplication Tables & Easy Fractions',
        description: 'Times tables up to 12, dividing into equal fractions, and perimeter of shapes.',
      },
      {
        id: 'prim-g3-evs',
        title: 'Earth Habitats, Wildlife & Clean Water',
        description: 'Deserts, rainforests, ocean life, ecosystems, and water conservation.',
      },
    ],
    'Grade 4': [
      {
        id: 'prim-g4-eng',
        title: 'Intermediate English Prose & Poetry',
        description: 'Expressive speaking, figurative language, book reviews, and creative writing.',
      },
      {
        id: 'prim-g4-math',
        title: 'Long Division, Decimals & Geometry',
        description: 'Multi-digit arithmetic, angles, symmetrical shapes, area, and graph interpretation.',
      },
      {
        id: 'prim-g4-sci',
        title: 'Human Body Systems & Plant Anatomy',
        description: 'Digestive system, skeletal framework, photosynthesis, and simple machines.',
      },
    ],
    'Grade 5': [
      {
        id: 'prim-g5-eng',
        title: 'Advanced Reading Comprehension & Essays',
        description: 'Persuasive writing, vocabulary synthesis, formal letters, and literary themes.',
      },
      {
        id: 'prim-g5-math',
        title: 'Fractions, Decimals, Percentages & Volume',
        description: 'Operations on fractions, introductory percentages, 3D volume, and coordinate grids.',
      },
      {
        id: 'prim-g5-sci',
        title: 'Forces, Matter & Solar System Astronomy',
        description: 'Gravity, friction, states of matter, solutions, and planets in orbit.',
      },
      {
        id: 'prim-g5-soc',
        title: 'World Continents, Maps & Early Civilizations',
        description: 'Latitude and longitude, ancient world river civilizations, and global geography.',
      },
    ],
  },
};

// ----------------------------------------------------
// Secondary & High School (Grades 6–12) Starter Content
// ----------------------------------------------------

const secondaryPhysicsText = `Chapter 1: Newton's Laws of Motion and Gravitation
Classical mechanics forms the foundation of physics, describing how macroscopic objects move and interact under applied forces.
Newton's First Law, known as the Law of Inertia, states that an object continues in its state of rest or uniform motion in a straight line unless acted upon by an external net force.
Newton's Second Law establishes the fundamental quantitative relationship: Net Force equals mass multiplied by acceleration, F equals m times a.
When force is applied to a mass, acceleration is directly proportional to the magnitude of the force and inversely proportional to the mass.
Newton's Third Law states that for every action, there is an equal and opposite reaction.
Gravitational force, formulated by Sir Isaac Newton, states that every point mass attracts every single other point mass with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them.`;

const secondaryBiologyText = `Chapter 1: Cell Structure and Human Cellular Respiration
The cell is the basic structural, functional, and biological unit of all known living organisms.
Eukaryotic cells are distinguished by membrane-bound organelles, including the nucleus which houses genetic deoxyribonucleic acid (DNA).
The mitochondrion is known as the powerhouse of the cell, where cellular respiration occurs to synthesize adenosine triphosphate (ATP), the primary energy currency of biological life.
During glycolysis and the Krebs cycle, glucose is broken down in the presence of oxygen to yield carbon dioxide, water, and large quantities of chemical energy stored in ATP molecules.
Plant cells contain specialized chloroplasts carrying chlorophyll, capturing solar photon energy to convert ambient carbon dioxide and water into nourishing glucose through photosynthesis.`;

const secondaryChemistryText = `Chapter 1: The Periodic Table, Chemical Bonding and Stoichiometry
Chemistry investigates matter, its properties, how substances combine or separate to form new substances, and how energy interacts with chemical changes.
Atoms consist of positively charged protons and neutral neutrons located within a dense central nucleus, surrounded by a cloud of negatively charged electrons orbiting in energy shells.
The Periodic Table arranges elements systematically by ascending atomic number. Elements belonging to the same vertical group share valence electron configurations, exhibiting analogous chemical reactivity.
Ionic bonding occurs through the complete transfer of electrons from a metal cation to a nonmetal anion, forming crystalline lattice structures.
Covalent bonding involves the mutual sharing of valence electron pairs between nonmetal atoms, forming stable molecules such as water and methane.`;

const secondaryMathText = `Chapter 1: Quadratic Equations, Functions and Coordinate Geometry
Algebra provides the symbolic framework to model relationships and solve unknown quantities across science and engineering.
A standard quadratic equation is formulated in the general form ax squared plus bx plus c equals zero, where a does not equal zero.
The roots of any quadratic equation can be analytically determined using the quadratic formula: x equals negative b plus or minus the square root of b squared minus 4ac, all divided by 2a.
The discriminant, delta equals b squared minus 4ac, reveals the nature of the roots: positive yields two distinct real solutions, zero yields a single repeated real root, and negative yields complex conjugate roots.
In coordinate geometry, the Cartesian plane maps equations to geometric graphs, linking algebra directly with spatial intuition.`;

export const SECONDARY_SCHOOL_BRANCH: CourseBranch = {
  id: 'secondary-school',
  name: 'Secondary & High School Curriculum',
  shortName: 'Secondary (Grades 6–12)',
  description: 'Rigorous preparatory curricula in Sciences, Mathematics, Literature, Social Sciences, and Computer Coding for Grades 6 through 12.',
  iconName: 'GraduationCap',
  tier: 'secondary',
  years: {
    'Grade 6': [
      {
        id: 'sec-g6-sci',
        title: 'Foundational General Science',
        description: 'States of matter, mixtures, food nutrients, plant diversity, and motion.',
      },
      {
        id: 'sec-g6-math',
        title: 'Integers, Fractions, Decimals & Basic Algebra',
        description: 'Negative numbers, ratio and proportion, linear expressions, and simple equations.',
      },
      {
        id: 'sec-g6-eng',
        title: 'English Literature & Grammatical Composition',
        description: 'Narrative reading, parts of speech, active and passive voices, and essay structure.',
      },
      {
        id: 'sec-g6-soc',
        title: 'World History, Geography & Civics',
        description: 'Early human history, landforms, weather maps, and democratic governance.',
      },
    ],
    'Grade 7': [
      {
        id: 'sec-g7-sci',
        title: 'Physical & Chemical Changes, Heat & Nutrition',
        description: 'Heat transfer, acids, bases and salts, animal nutrition, and weather climates.',
      },
      {
        id: 'sec-g7-math',
        title: 'Algebraic Expressions, Lines, Angles & Triangles',
        description: 'Congruence of triangles, rational numbers, exponents, and practical geometry.',
      },
      {
        id: 'sec-g7-eng',
        title: 'World Prose, Poetry Analysis & Creative Writing',
        description: 'Figurative speech, character conflict, poetic meters, and structured debates.',
      },
    ],
    'Grade 8': [
      {
        id: 'sec-g8-sci',
        title: 'Cellular Structure, Microorganisms, Force & Pressure',
        description: 'Friction, sound acoustics, combustion, cell organelles, and electrical current effects.',
      },
      {
        id: 'sec-g8-math',
        title: 'Linear Equations, Quadrilaterals & Mensuration',
        description: 'Surface areas, volumes of 3D solids, factorisation, and Cartesian graph plotting.',
      },
      {
        id: 'sec-g8-cs',
        title: 'Introduction to Computer Programming & Algorithms',
        description: 'Variables, loops, conditionals, flowcharts, and introductory Python/Web coding.',
      },
    ],
    'Grade 9': [
      {
        id: 'sec-g9-phy',
        title: 'Physics: Laws of Motion, Force & Gravitation',
        description: 'Newtonian dynamics, inertia, momentum conservation, universal gravitation, and work & energy.',
        sampleDocument: {
          id: 'doc-sec-g9-phy',
          title: 'Physics: Laws of Motion & Gravitation',
          branchId: 'secondary-school',
          year: 'Grade 9',
          rawText: secondaryPhysicsText,
          sentences: createSentencesFromText(secondaryPhysicsText, 'Newtonian Mechanics & Gravitation'),
          chapters: [{ title: 'Newtonian Mechanics & Gravitation', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'sec-g9-chem',
        title: 'Chemistry: Atoms, Molecules & Chemical Reactions',
        description: 'Atomic structure, Dalton atomic theory, mole concept, and valency.',
      },
      {
        id: 'sec-g9-bio',
        title: 'Biology: The Fundamental Unit of Life & Tissues',
        description: 'Plant and animal tissues, cellular organelles, plasma membrane, and biodiversity.',
        sampleDocument: {
          id: 'doc-sec-g9-bio',
          title: 'Biology: The Fundamental Unit of Life & Respiration',
          branchId: 'secondary-school',
          year: 'Grade 9',
          rawText: secondaryBiologyText,
          sentences: createSentencesFromText(secondaryBiologyText, 'Cell Structure & Respiration'),
          chapters: [{ title: 'Cell Structure & Respiration', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'sec-g9-math',
        title: 'Mathematics: Coordinate Geometry & Polynomials',
        description: 'Polynomial factorisation, Euclidean geometry, linear equations in two variables, and probability.',
      },
    ],
    'Grade 10': [
      {
        id: 'sec-g10-phy',
        title: 'Physics: Light Optics, Electricity & Magnetism',
        description: 'Reflection, refraction, Ohm law, magnetic effects of electric current, and electric motors.',
      },
      {
        id: 'sec-g10-chem',
        title: 'Chemistry: Chemical Reactions, Metals & Carbon Compounds',
        description: 'Redox reactions, metallurgy, periodic classification, and covalent hydrocarbons.',
        sampleDocument: {
          id: 'doc-sec-g10-chem',
          title: 'Chemistry: Chemical Bonding & Periodic Trends',
          branchId: 'secondary-school',
          year: 'Grade 10',
          rawText: secondaryChemistryText,
          sentences: createSentencesFromText(secondaryChemistryText, 'Chemical Bonding & Stoichiometry'),
          chapters: [{ title: 'Chemical Bonding & Stoichiometry', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'sec-g10-bio',
        title: 'Biology: Life Processes, Heredity & Evolution',
        description: 'Human digestive, circulatory, and nervous systems, Mendelian genetics, and ecosystem cycles.',
      },
      {
        id: 'sec-g10-math',
        title: 'Mathematics: Quadratic Equations, Trigonometry & Statistics',
        description: 'Trigonometric identities, arithmetic progressions, circle theorems, and statistical distributions.',
        sampleDocument: {
          id: 'doc-sec-g10-math',
          title: 'Mathematics: Quadratic Equations & Trigonometry',
          branchId: 'secondary-school',
          year: 'Grade 10',
          rawText: secondaryMathText,
          sentences: createSentencesFromText(secondaryMathText, 'Quadratic Equations & Functions'),
          chapters: [{ title: 'Quadratic Equations & Functions', startSentenceIndex: 0 }],
        },
      },
    ],
    'Grade 11': [
      {
        id: 'sec-g11-phy',
        title: 'Physics: Kinematics, Thermodynamics & Oscillations',
        description: 'Rotational motion, gravitation, fluid dynamics, heat engines, simple harmonic motion, and waves.',
      },
      {
        id: 'sec-g11-chem',
        title: 'Chemistry: Atomic Orbital Theory, Thermodynamics & Equilibrium',
        description: 'Quantum numbers, hybridisation, chemical kinetics, Le Chatelier principle, and basic organic reactions.',
      },
      {
        id: 'sec-g11-math',
        title: 'Mathematics: Sets, Functions, Trigonometry & Calculus Intro',
        description: 'Permutations, combinations, binomial theorem, limits, and derivative foundations.',
      },
      {
        id: 'sec-g11-bio',
        title: 'Biology: Plant Physiology & Human Organ Physiology',
        description: 'Photosynthesis, neural control, endocrine regulation, excretion, and cell division.',
      },
      {
        id: 'sec-g11-cs',
        title: 'Computer Science: Python Data Structures & Algorithmic Logic',
        description: 'Lists, dictionaries, file I/O, recursion, sorting algorithms, and computational thinking.',
      },
    ],
    'Grade 12': [
      {
        id: 'sec-g12-phy',
        title: 'Senior Physics: Electromagnetism, Optics & Modern Physics',
        description: 'Gauss law, Maxwell equations, electromagnetic induction, wave optics, semiconductors, and nuclear physics.',
        sampleDocument: {
          id: 'doc-sec-g12-phy',
          title: 'Senior Physics: Electromagnetism, Optics & Modern Physics',
          branchId: 'secondary-school',
          year: 'Grade 12',
          rawText: secondaryPhysicsText,
          sentences: createSentencesFromText(secondaryPhysicsText, 'Electromagnetism & Wave Optics'),
          chapters: [{ title: 'Electromagnetism & Wave Optics', startSentenceIndex: 0 }],
        },
      },
      {
        id: 'sec-g12-chem',
        title: 'Senior Chemistry: Electrochemistry, Kinetics & Organic Synthesis',
        description: 'Nernst equation, rate laws, transition elements, reaction mechanisms of aldehydes, ketones, and polymers.',
      },
      {
        id: 'sec-g12-math',
        title: 'Senior Mathematics: Differential & Integral Calculus',
        description: 'Definite integrals, differential equations, vectors, 3D coordinate geometry, and probability distributions.',
      },
      {
        id: 'sec-g12-bio',
        title: 'Senior Biology: Molecular Genetics & Biotechnology',
        description: 'DNA replication, transcription, translation, recombinant DNA technology, and ecology.',
      },
      {
        id: 'sec-g12-cs',
        title: 'Senior Computer Science: SQL Databases, Networks & OOP',
        description: 'Relational database management, relational algebra, networking protocols, and object-oriented architectures.',
      },
    ],
  },
};

const mastersResearchText = `Chapter 1: Graduate Research Methodologies and Critical Literature Review
Graduate level research requires a systematic progression from understanding existing academic paradigms to generating novel intellectual contributions.
A thorough literature review does not merely summarize previous investigations; rather, it synthesizes empirical findings, identifies methodologic gaps, and contextualizes current research questions.
Experimental design requires rigorous control of confounding variables, statistical power analysis, and reproducible data validation pipelines.
Whether employing Bayesian statistical inference, qualitative grounded theory, or deep neural representations, graduate scholars must articulate methodological assumptions clearly and defend their analytical conclusions against critical peer scrutiny.`;

const phdDissertationText = `Chapter 1: Theoretical Formulations, Novelty Proofs, and Doctoral Synthesis
Doctoral dissertation research demands original scholarship that advances the theoretical and empirical frontiers of human knowledge.
At the doctoral level, investigation transcends applied engineering into fundamental mathematical abstractions, ontological frameworks, and rigorous formal proofs.
Scholars must establish theoretical novelty through comparative analysis against state-of-the-art baselines, rigorous algorithmic convergence bounds, and extensive empirical validation.
Dissemination of doctoral research through peer-reviewed academic journals and defense before an expert faculty committee represents the highest standard of academic excellence.`;

// ----------------------------------------------------
// Universal Directory & Helpers (Zero Subject Codes)
// ----------------------------------------------------

export const ALL_COLLEGE_BRANCHES = COLLEGE_BRANCHES.map(b => ({
  ...b,
  tier: 'college' as EducationTier,
  years: {
    ...b.years,
    "Master's Degree": [
      {
        id: `${b.id}-ms-1`,
        title: 'Graduate Research Methodologies & Critical Synthesis',
        description: 'Empirical research paradigms, peer-reviewed literature synthesis, and thesis formulation.',
        sampleDocument: {
          id: `doc-${b.id}-ms-1`,
          title: 'Graduate Research Methodologies & Critical Synthesis',
          branchId: b.id,
          year: "Master's Degree",
          rawText: mastersResearchText,
          sentences: createSentencesFromText(mastersResearchText, 'Graduate Research Methodologies'),
          chapters: [{ title: 'Graduate Research Methodologies', startSentenceIndex: 0 }],
        },
      },
      {
        id: `${b.id}-ms-2`,
        title: `Advanced ${b.name} Seminars & Thesis Proposal`,
        description: 'Advanced specialized topics, graduate colloquia, and dissertation proposal defense.',
      },
      {
        id: `${b.id}-ms-3`,
        title: `Quantitative Analysis & Empirical Methods in ${b.shortName}`,
        description: 'Advanced statistical inference, computational modeling, and empirical experimental verification.',
      },
    ],
    'PhD / Doctoral': [
      {
        id: `${b.id}-phd-1`,
        title: 'Doctoral Dissertation Research & Theoretical Novelty',
        description: 'Original academic investigations, rigorous mathematical proofs, and conference publications.',
        sampleDocument: {
          id: `doc-${b.id}-phd-1`,
          title: 'Doctoral Dissertation Research & Theoretical Novelty',
          branchId: b.id,
          year: 'PhD / Doctoral',
          rawText: phdDissertationText,
          sentences: createSentencesFromText(phdDissertationText, 'Theoretical Formulations & Novelty Proofs'),
          chapters: [{ title: 'Theoretical Formulations & Novelty Proofs', startSentenceIndex: 0 }],
        },
      },
      {
        id: `${b.id}-phd-2`,
        title: `Doctoral Colloquium & Research Frontiers in ${b.shortName}`,
        description: 'Interdisciplinary research defense, peer review, and grant proposal preparation.',
      },
      {
        id: `${b.id}-phd-3`,
        title: `Doctoral Publication Seminar & Scholarly Peer Review`,
        description: 'Drafting high-impact journal manuscripts, addressing referee critiques, and academic presentation.',
      },
    ],
  },
}));

export const ALL_UNIVERSAL_BRANCHES: CourseBranch[] = [
  PRIMARY_SCHOOL_BRANCH,
  SECONDARY_SCHOOL_BRANCH,
  ...ALL_COLLEGE_BRANCHES,
];

export function getBranchesForTier(tier: EducationTier): CourseBranch[] {
  if (tier === 'primary') return [PRIMARY_SCHOOL_BRANCH];
  if (tier === 'secondary') return [SECONDARY_SCHOOL_BRANCH];
  return ALL_COLLEGE_BRANCHES;
}

export function getGradeOrYearOptionsForTier(tier: EducationTier): string[] {
  if (tier === 'primary') {
    return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
  }
  if (tier === 'secondary') {
    return ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  }
  return ['1st Year', '2nd Year', '3rd Year', '4th Year', "Master's Degree", 'PhD / Doctoral'];
}

export function getCoursesForBranchAndLevel(branchId: string, level: string): CourseItem[] {
  const branch = ALL_UNIVERSAL_BRANCHES.find(b => b.id === branchId);
  if (!branch) return [];
  return branch.years[level] || [];
}

export function getPresetsForUniversalBranch(branchId: string, level: string): CourseItem[] {
  const courses = getCoursesForBranchAndLevel(branchId, level);
  return courses.filter(c => !!c.sampleDocument);
}
