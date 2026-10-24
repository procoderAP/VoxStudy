import { CourseBranch, CourseDocument, AcademicYear, CourseItem } from '../types';

// Helper function to segment raw text into sentence items with block types and unbroken speech flow
export function createSentencesFromText(
  text: string,
  chapterTitle: string = 'General'
): { id: string; text: string; startWordIndex: number; endWordIndex: number; chapterTitle?: string; blockType?: 'heading-1' | 'heading-2' | 'paragraph' | 'list-item' | 'table-row'; pageNumber?: number }[] {
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const structuredBlocks: { text: string; blockType: 'heading-1' | 'heading-2' | 'paragraph' | 'list-item' | 'table-row' }[] = [];
  let paragraphBuffer = '';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    let blockType: 'heading-1' | 'heading-2' | 'paragraph' | 'list-item' | 'table-row' = 'paragraph';

    if (/^(Module|Chapter|Unit|Part)\s+\d+/i.test(line)) {
      blockType = 'heading-1';
    } else if (/^(\d+[\.\)]|[\u2022\u25E6\u2023\u2219\*\-]\s|Examples?:|\([a-z0-9]\))/i.test(line)) {
      blockType = 'list-item';
    } else if (line.length < 65 && !line.endsWith('.')) {
      blockType = 'heading-2';
    }

    if (blockType !== 'paragraph') {
      if (paragraphBuffer.trim()) {
        structuredBlocks.push({ text: paragraphBuffer.trim(), blockType: 'paragraph' });
        paragraphBuffer = '';
      }
      structuredBlocks.push({ text: line, blockType });
    } else {
      if (!paragraphBuffer) {
        paragraphBuffer = line;
      } else {
        if (paragraphBuffer.endsWith('-') && !paragraphBuffer.endsWith(' -') && /[a-zA-Z]-$/.test(paragraphBuffer)) {
          paragraphBuffer = paragraphBuffer.slice(0, -1) + line;
        } else {
          paragraphBuffer += ' ' + line;
        }
      }
    }
  }

  if (paragraphBuffer.trim()) {
    structuredBlocks.push({ text: paragraphBuffer.trim(), blockType: 'paragraph' });
  }

  const result: any[] = [];
  let currentWordCount = 0;

  for (let bIdx = 0; bIdx < structuredBlocks.length; bIdx++) {
    const { text: blockText, blockType } = structuredBlocks[bIdx];

    if (blockType !== 'paragraph') {
      const wordCount = blockText.split(/\s+/).length;
      result.push({
        id: `sent-b${bIdx}-${Math.random().toString(36).slice(2, 7)}`,
        text: blockText,
        startWordIndex: currentWordCount,
        endWordIndex: currentWordCount + wordCount,
        chapterTitle,
        blockType,
        pageNumber: 1,
      });
      currentWordCount += wordCount;
    } else {
      // Split paragraph strictly into complete grammatical sentences
      const protectedText = blockText
        .replace(/\b(e\.g\.|i\.e\.|vs\.|al\.|etc\.|Fig\.|Eq\.|Ref\.|Dr\.|Prof\.|w\.r\.t\.|Vol\.|No\.)/gi, (match) => match.replace(/\./g, '__DOT__'))
        .replace(/(\d+)\.(\d+)/g, '$1__DOT__$2');

      const parts = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);
      const sentences: string[] = [];
      let currentBuffer = '';

      for (const part of parts) {
        const restored = part.replace(/__DOT__/g, '.').trim();
        if (!restored) continue;
        if (currentBuffer) {
          if (/[,\-;:]$/.test(currentBuffer) || !/[.!?]$/.test(currentBuffer)) {
            currentBuffer += ' ' + restored;
          } else {
            sentences.push(currentBuffer);
            currentBuffer = restored;
          }
        } else {
          currentBuffer = restored;
        }
      }
      if (currentBuffer) {
        sentences.push(currentBuffer);
      }

      for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
        const sText = sentences[sIdx];
        const wordCount = sText.split(/\s+/).length;
        result.push({
          id: `sent-b${bIdx}-s${sIdx}-${Math.random().toString(36).slice(2, 7)}`,
          text: sText,
          startWordIndex: currentWordCount,
          endWordIndex: currentWordCount + wordCount,
          chapterTitle,
          blockType: 'paragraph',
          pageNumber: 1,
        });
        currentWordCount += wordCount;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------
// HIGH-YIELD FOUNDATIONAL LECTURE TEXTS ACROSS DISCIPLINES
// ---------------------------------------------------------

// Computer Science
const csProgrammingText = `Structured computer programming builds directly on deterministic algorithmic execution and precise hardware memory modeling. When allocating data in memory, a pointer variable stores the direct physical memory address of another target variable. Pointer arithmetic advances addresses in increments determined strictly by the underlying primitive data type size in bytes. Dynamic memory allocation grants applications runtime heap flexibility through standard library routines. When analyzing algorithmic efficiency, asymptotic Big-O notation characterizes time and spatial complexity as input size N scales toward infinity. Binary search achieves logarithmic time complexity by repeatedly bisecting a sorted search interval, whereas an unoptimized linear scan demands linear operations. For sorting algorithms, divide-and-conquer strategies like QuickSort and MergeSort deliver average time complexities of N log N, drastically outperforming quadratic bubble and insertion routines in high-throughput data processing.`;
const csProgrammingSentences = createSentencesFromText(csProgrammingText, 'Chapter 1: Memory Modeling & Algorithmic Complexity');

const csDataStructuresText = `Data structures form the architectural foundation of scalable software systems and algorithmic optimization. Balanced search trees, such as Red-Black Trees and AVL trees, maintain logarithmic height during insertion and deletion through localized tree rotations. This guarantees worst-case logarithmic lookup times, resolving the severe performance degradation seen in unbalanced binary search trees. For graph representations, adjacency lists provide optimal memory efficiency for sparse networks compared to quadratic adjacency matrices. Dijkstra's shortest-path algorithm resolves single-source shortest paths on weighted graphs with non-negative edge weights using a min-priority heap in E plus V log V time. When subproblems overlap, dynamic programming avoids wasteful exponential recursion through memoization and bottom-up tabulation.`;
const csDataStructuresSentences = createSentencesFromText(csDataStructuresText, 'Chapter 1: Balanced Trees & Dynamic Programming');

// Business & Management
const businessManagementText = `Modern management theory balances strategic organizational design with human-centric leadership principles. Effective enterprise leadership requires establishing a cohesive corporate vision while setting clear, measurable operational objectives. Henri Fayol's foundational administrative principles—encompassing planning, organizing, commanding, coordinating, and controlling—have evolved into modern agile frameworks that embrace rapid market iteration and decentralized decision-making. Peter Drucker famously emphasized that culture eats strategy for breakfast, underscoring that without an aligned and motivated workforce, even the most rigorous corporate strategies will fail. Today's organizations deploy cross-functional teams to eliminate bureaucratic silos, accelerate product delivery cycles, and foster an environment of continuous experimentation and psychological safety.`;
const businessManagementSentences = createSentencesFromText(businessManagementText, 'Chapter 1: Principles of Enterprise Leadership');

// Finance & Economics
const microeconomicsText = `Microeconomics examines how individual economic agents—households, consumers, and firms—allocate scarce resources through price signals in competitive markets. The fundamental law of demand dictates an inverse relationship between price and quantity demanded, driven by substitution and income effects. Conversely, the law of supply states that higher market prices incentivize producers to supply greater quantities to maximize profitability. Market equilibrium occurs at the exact price point where quantity demanded equals quantity supplied, clearing the market without shortages or surplus inventories. Price elasticity of demand quantifies consumer price sensitivity, measured as the percentage change in quantity demanded divided by the percentage change in price. When goods possess few close substitutes, demand tends to be inelastic, granting suppliers greater pricing leverage.`;
const microeconomicsSentences = createSentencesFromText(microeconomicsText, 'Chapter 1: Supply, Demand & Market Equilibrium');

// Psychology
const cognitivePsychologyText = `Cognitive psychology investigates the mental mechanisms underlying human attention, sensory perception, memory encoding, language comprehension, and problem solving. The multi-store model of memory conceptualizes information flow through three distinct stages: sensory memory, short-term working memory, and long-term memory. Sensory memory captures fleeting impressions of visual and auditory stimuli for fractions of a second before selective attention filters relevant data into working memory. George Miller's pioneering research identified the typical working memory capacity as roughly seven plus or minus two chunks of information. To transfer knowledge into permanent long-term storage, the brain utilizes elaborative rehearsal, linking novel concepts with pre-existing neural schemas. Neurobiologically, long-term potentiation in the hippocampus strengthens synaptic connections, physically consolidating new insights into lasting autobiographical and semantic memory networks.`;
const cognitivePsychologySentences = createSentencesFromText(cognitivePsychologyText, 'Chapter 1: Cognitive Memory Architecture');

// Law & Legal Studies
const constitutionalLawText = `Constitutional law establishes the foundational architecture of the state, defining the boundaries of government authority and protecting fundamental human liberties against unlawful state overreach. The doctrine of separation of powers allocates governance among three distinct branches: the legislature to enact laws, the executive to administer and enforce statutes, and the judiciary to interpret and safeguard the constitution. Judicial review empowers independent courts to examine legislative acts and executive actions, invalidating measures that contradict supreme constitutional mandates. Equal protection and due process clauses guarantee that every citizen is afforded procedural fairness, unbiased adjudication, and protection against arbitrary discrimination under the rule of law.`;
const constitutionalLawSentences = createSentencesFromText(constitutionalLawText, 'Chapter 1: Separation of Powers & Judicial Review');

// Medicine & Health Sciences
const humanAnatomyText = `Human gross anatomy and organ system physiology illustrate the remarkable homeostatic coordination required to sustain biological life. The cardiovascular system functions as a continuous closed-loop transport network powered by the muscular four-chambered heart. Deoxygenated blood returns from peripheral tissues through the superior and inferior vena cava into the right atrium, passes through the tricuspid valve into the right ventricle, and is pumped via pulmonary arteries to the alveolar capillary beds for gas exchange. Oxygenated blood returns through pulmonary veins to the left atrium, proceeds across the mitral valve into the thick left ventricle, and is propelled under arterial pressure through the systemic aorta. Homeostatic arterial blood pressure is continuously regulated by baroreceptors located in the carotid sinuses and aortic arch, ensuring perfusion across vital cerebral, renal, and coronary capillary beds.`;
const humanAnatomySentences = createSentencesFromText(humanAnatomyText, 'Chapter 1: Cardiovascular Hemodynamics & Homeostasis');

// Biological Sciences
const molecularGeneticsText = `Molecular genetics explores the chemical structure, replication, and transcription of hereditary information encoded within cellular deoxyribonucleic acid. The double-helical architecture of DNA, elucidated by James Watson, Francis Crick, and Rosalind Franklin, consists of two antiparallel polynucleotide strands held together by complementary hydrogen bonds between purines and pyrimidines. Adenine pairs selectively with thymine via two hydrogen bonds, while cytosine bonds with guanine through three hydrogen bonds. The central dogma of molecular biology describes the directional flow of genetic information: DNA is replicated with high fidelity by DNA polymerase enzymes, transcribed into messenger RNA by RNA polymerase, and subsequently translated on cytoplasmic ribosomes into polypeptide chains that fold into functional three-dimensional enzymatic proteins.`;
const molecularGeneticsSentences = createSentencesFromText(molecularGeneticsText, 'Chapter 1: DNA Structure & The Central Dogma');

// Physics & Mathematics
const multivariableCalculusText = `Multivariable calculus and linear algebra provide the universal mathematical language governing continuous physical systems and scientific computation. In spatial vector fields, the gradient operator points in the direction of greatest instantaneous rate of increase, with its magnitude representing directional steepness. The divergence operator computes the net outward volumetric flux density emanating from an infinitesimal coordinate volume, serving as the mathematical expression of Gauss's Law in electrostatics. Conversely, the curl operator measures microscopic rotational circulation around an oriented surface element. In linear matrix algebra, an eigenvalue represents a scalar multiplier by which an associated non-zero eigenvector is stretched or compressed during matrix transformation. Orthogonal diagonalization of symmetric matrices underpins principal component analysis, structural vibration frequencies, and quantum state decompositions across the physical sciences.`;
const multivariableCalculusSentences = createSentencesFromText(multivariableCalculusText, 'Chapter 1: Vector Calculus & Eigenvalue Analysis');

// Humanities & Literature
const worldLiteratureText = `Literary analysis examines narrative technique, thematic resonance, character development, and historical context across diverse cultural traditions. Great literature does not merely reflect existing societal values; it interrogates power dynamics, confronts philosophical dilemmas, and expands human empathy through imaginative storytelling. In Joseph Campbell's comparative mythological framework, known as the hero's journey or monomyth, archetypal protagonists depart from the familiar world, endure transformative trials in an unknown realm, and return bearing boons that enlighten their community. Through close textual reading, literary scholars deconstruct recurring metaphors, symbolic motifs, and narrative perspective, uncovering how authors illuminate timeless questions of human mortality, justice, and identity across civilizations.`;
const worldLiteratureSentences = createSentencesFromText(worldLiteratureText, 'Chapter 1: Narrative Archetypes & Textual Analysis');

// Architecture
const architecturalDesignText = `Architectural design synthesizes spatial aesthetics, structural engineering, environmental sustainability, and human habitation into enduring built environments. Vitruvius established the three fundamental tenets of architecture: firmitas (structural durability), utilitas (functional utility), and venustas (aesthetic beauty). Modern architectural practice emphasizes climate-responsive design, minimizing operational carbon footprints through passive solar orientation, natural cross-ventilation, and thermal mass optimization. Spatial hierarchy guides occupants intuitively through physical environments using daylight, ceiling height variations, and material transitions, transforming static structural envelopes into vibrant civic and domestic sanctuaries.`;
const architecturalDesignSentences = createSentencesFromText(architecturalDesignText, 'Chapter 1: Spatial Form & Sustainable Urbanism');

// Engineering & Applied Tech
const electricalEngineeringText = `Electrical circuit analysis relies on fundamental conservation principles governed by Kirchhoff's Current Law and Kirchhoff's Voltage Law. Kirchhoff's Current Law states that the algebraic sum of all electrical currents entering any circuit node must equal zero, enforcing the conservation of electric charge. In parallel, Kirchhoff's Voltage Law dictates that the directed sum of electrical potential differences around any closed circuit loop is identically zero, establishing the conservation of energy. In alternating current regimes, capacitors cause electrical current to lead terminal voltage by ninety electrical degrees, while inductors enforce a ninety-degree voltage lead over current. At the resonant frequency where capacitive and inductive reactances cancel, circuit impedance reaches a minimum, enabling selective radio frequency tuning and high-efficiency wireless power transfer.`;
const electricalEngineeringSentences = createSentencesFromText(electricalEngineeringText, 'Chapter 1: Circuit Conservation Laws & AC Resonance');

// ---------------------------------------------------------
// 11 COMPREHENSIVE COLLEGE BRANCHES (ARTS, SCIENCES, BUSINESS, LAW, MED, ENG)
// ---------------------------------------------------------

export const COLLEGE_BRANCHES: CourseBranch[] = [
  // 1. Computer Science & AI
  {
    id: 'computer-science',
    name: 'Computer Science & Artificial Intelligence',
    shortName: 'Computer Science & AI',
    description: 'Algorithms, data structures, operating systems, machine learning, cloud systems, and cybersecurity.',
    iconName: 'Cpu',
    years: {
      '1st Year': [
        {
          id: 'cs-prog',
          title: 'Computer Programming & Algorithmic Execution',
          description: 'Memory models, pointers, recursion, asymptotic complexity, and algorithmic design.',
          sampleDocument: {
            id: 'doc-cs-prog',
            title: 'Computer Programming & Algorithmic Execution',
            branchId: 'computer-science',
            year: '1st Year',
            rawText: csProgrammingText,
            sentences: csProgrammingSentences,
            chapters: [{ title: 'Chapter 1: Memory Modeling & Algorithmic Complexity', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'cs-discrete-math',
          title: 'Discrete Mathematics & Boolean Logic',
          description: 'Set theory, predicate logic, graph theory, combinatorics, and induction proofs.',
        },
        {
          id: 'cs-sys-arch',
          title: 'Computer Systems Architecture',
          description: 'Digital logic, instruction sets, CPU pipelining, cache memory hierarchies, and bus protocols.',
        },
      ],
      '2nd Year': [
        {
          id: 'cs-dsa',
          title: 'Data Structures & Algorithm Design',
          description: 'Balanced search trees, graph traversals, Dijkstra shortest paths, and dynamic programming.',
          sampleDocument: {
            id: 'doc-cs-dsa',
            title: 'Data Structures & Algorithm Design',
            branchId: 'computer-science',
            year: '2nd Year',
            rawText: csDataStructuresText,
            sentences: csDataStructuresSentences,
            chapters: [{ title: 'Chapter 1: Balanced Trees & Dynamic Programming', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'cs-oop',
          title: 'Object-Oriented Software Engineering',
          description: 'Design patterns, polymorphism, modular architecture, unit testing, and version control.',
        },
        {
          id: 'cs-dbms',
          title: 'Relational Database Management Systems',
          description: 'SQL queries, relational algebra, schema normalization, ACID transactions, and indexing.',
        },
      ],
      '3rd Year': [
        {
          id: 'cs-os',
          title: 'Principles of Operating Systems',
          description: 'Kernel architectures, virtual memory, process scheduling, synchronization, and file systems.',
        },
        {
          id: 'cs-networks',
          title: 'Computer Networking & Internet Protocols',
          description: 'TCP/IP stack, socket programming, routing algorithms, DNS, and network security.',
        },
        {
          id: 'cs-ai-heuristics',
          title: 'Artificial Intelligence & Heuristics',
          description: 'Search algorithms, adversarial games, constraint satisfaction, and knowledge representations.',
        },
      ],
      '4th Year': [
        {
          id: 'cs-ml-neural',
          title: 'Machine Learning & Deep Neural Networks',
          description: 'Backpropagation, convolutional networks, Transformer attention models, and generative AI.',
        },
        {
          id: 'cs-distributed-systems',
          title: 'Distributed Systems & Cloud Computing',
          description: 'Consensus algorithms, Paxos, Raft, microservices, containerization, and horizontal scalability.',
        },
        {
          id: 'cs-cybersecurity',
          title: 'Applied Cryptography & Cybersecurity',
          description: 'Public-key encryption, hash functions, penetration testing, threat modeling, and zero trust.',
        },
      ],
    },
  },

  // 2. Business Administration & Management
  {
    id: 'business-admin',
    name: 'Business Administration & Management',
    shortName: 'Business & Management',
    description: 'Enterprise leadership, organizational behavior, marketing strategy, operations, and entrepreneurship.',
    iconName: 'Building2',
    years: {
      '1st Year': [
        {
          id: 'bus-mgmt-principles',
          title: 'Principles of Management & Enterprise Leadership',
          description: 'Organizational design, managerial decision-making, team dynamics, and agile governance.',
          sampleDocument: {
            id: 'doc-bus-mgmt',
            title: 'Principles of Management & Enterprise Leadership',
            branchId: 'business-admin',
            year: '1st Year',
            rawText: businessManagementText,
            sentences: businessManagementSentences,
            chapters: [{ title: 'Chapter 1: Principles of Enterprise Leadership', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'bus-comm',
          title: 'Business Communication & Critical Thinking',
          description: 'Executive reporting, persuasive negotiation, stakeholder presentations, and corporate ethics.',
        },
        {
          id: 'bus-analytics',
          title: 'Business Statistics & Quantitative Analytics',
          description: 'Probability distributions, hypothesis testing, regression analysis, and spreadsheet modeling.',
        },
      ],
      '2nd Year': [
        {
          id: 'bus-marketing',
          title: 'Marketing Management & Consumer Psychology',
          description: 'Market segmentation, brand equity, digital campaigns, customer journey mapping, and pricing strategy.',
        },
        {
          id: 'bus-org-behavior',
          title: 'Organizational Behavior & Human Dynamics',
          description: 'Workplace motivation, organizational culture, conflict resolution, and change management.',
        },
        {
          id: 'bus-supply-chain',
          title: 'Operations & Supply Chain Strategy',
          description: 'Inventory optimization, lean production, logistics networks, procurement, and quality control.',
        },
      ],
      '3rd Year': [
        {
          id: 'bus-corp-finance',
          title: 'Corporate Finance & Capital Budgeting',
          description: 'Discounted cash flows, cost of capital, capital structure decisions, and valuation methodologies.',
        },
        {
          id: 'bus-strategic-mgmt',
          title: 'Strategic Management & Competitive Analysis',
          description: 'Porter five forces, resource-based view, mergers and acquisitions, and competitive moats.',
        },
        {
          id: 'bus-international',
          title: 'International Business & Global Trade Policy',
          description: 'Multinational operations, foreign direct investment, currency risk, and cross-cultural management.',
        },
      ],
      '4th Year': [
        {
          id: 'bus-entrepreneurship',
          title: 'Entrepreneurship & Venture Capital Funding',
          description: 'Lean startup methodology, business model canvas, venture financing, and pitch decks.',
        },
        {
          id: 'bus-governance',
          title: 'Corporate Governance, Business Law & Ethics',
          description: 'Fiduciary duties, board oversight, regulatory compliance, environmental sustainability (ESG).',
        },
      ],
    },
  },

  // 3. Finance, Accounting & Economics
  {
    id: 'finance-econ',
    name: 'Finance, Accounting & Economics',
    shortName: 'Finance & Economics',
    description: 'Financial markets, asset valuation, econometrics, corporate accounting, and macroeconomic policy.',
    iconName: 'TrendingUp',
    years: {
      '1st Year': [
        {
          id: 'fin-microeconomics',
          title: 'Microeconomic Principles & Market Dynamics',
          description: 'Price theory, elasticity, consumer behavior, perfect competition, and monopoly pricing.',
          sampleDocument: {
            id: 'doc-fin-micro',
            title: 'Microeconomic Principles & Market Dynamics',
            branchId: 'finance-econ',
            year: '1st Year',
            rawText: microeconomicsText,
            sentences: microeconomicsSentences,
            chapters: [{ title: 'Chapter 1: Supply, Demand & Market Equilibrium', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'fin-accounting-intro',
          title: 'Financial Accounting & Reporting Principles',
          description: 'Double-entry bookkeeping, balance sheets, income statements, cash flow statements, and GAAP.',
        },
        {
          id: 'fin-math-econ',
          title: 'Mathematical Methods for Economics & Finance',
          description: 'Optimization with constraints, Lagrange multipliers, differential equations, and linear algebra.',
        },
      ],
      '2nd Year': [
        {
          id: 'fin-macroeconomics',
          title: 'Macroeconomic Theory & National Income',
          description: 'IS-LM framework, monetary and fiscal policy, inflation, unemployment, and economic growth models.',
        },
        {
          id: 'fin-cost-mgmt',
          title: 'Cost & Management Accounting',
          description: 'Activity-based costing, break-even analysis, variance reporting, and budgetary controls.',
        },
        {
          id: 'fin-banking',
          title: 'Money, Banking & Financial Intermediation',
          description: 'Central banking operations, fractional reserve banking, interest rate transmission, and yield curves.',
        },
      ],
      '3rd Year': [
        {
          id: 'fin-econometrics',
          title: 'Econometrics & Empirical Data Analysis',
          description: 'Ordinary least squares, heteroskedasticity, time-series forecasting, and instrumental variables.',
        },
        {
          id: 'fin-investments',
          title: 'Investment Analysis & Modern Portfolio Theory',
          description: 'Capital asset pricing model (CAPM), efficient frontier, factor investing, and behavioral finance.',
        },
        {
          id: 'fin-markets',
          title: 'Financial Markets, Instruments & Institutions',
          description: 'Equity markets, fixed income securities, money markets, bond duration, and market liquidity.',
        },
      ],
      '4th Year': [
        {
          id: 'fin-derivatives',
          title: 'Financial Derivatives & Risk Engineering',
          description: 'Options pricing, Black-Scholes formula, futures hedging, swaps, and credit risk management.',
        },
        {
          id: 'fin-international-finance',
          title: 'International Finance & Foreign Exchange Rates',
          description: 'Purchasing power parity, uncovered interest parity, sovereign debt, and balance of payments.',
        },
      ],
    },
  },

  // 4. Psychology & Behavioral Sciences
  {
    id: 'psychology',
    name: 'Psychology & Behavioral Sciences',
    shortName: 'Psychology',
    description: 'Cognitive processes, neuroscience, developmental psychology, psychopathology, and human counseling.',
    iconName: 'Brain',
    years: {
      '1st Year': [
        {
          id: 'psy-cognitive',
          title: 'Cognitive Psychology: Memory, Thought & Perception',
          description: 'Sensory encoding, working memory, attention mechanisms, mental schemas, and problem solving.',
          sampleDocument: {
            id: 'doc-psy-cog',
            title: 'Cognitive Psychology: Memory, Thought & Perception',
            branchId: 'psychology',
            year: '1st Year',
            rawText: cognitivePsychologyText,
            sentences: cognitivePsychologySentences,
            chapters: [{ title: 'Chapter 1: Cognitive Memory Architecture', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'psy-intro',
          title: 'Introduction to Psychology & Behavioral Paradigms',
          description: 'Historical perspectives, behavioral conditioning, biopsychosocial models, and scientific research methods.',
        },
        {
          id: 'psy-developmental',
          title: 'Developmental Psychology Across the Lifespan',
          description: 'Piaget stages, attachment theory, language acquisition, social development, and aging.',
        },
      ],
      '2nd Year': [
        {
          id: 'psy-biological',
          title: 'Biological Foundations of Behavior & Neuroanatomy',
          description: 'Neuron action potentials, neurotransmitters, brain structures, endocrine systems, and sensory pathways.',
        },
        {
          id: 'psy-social',
          title: 'Social Psychology & Interpersonal Dynamics',
          description: 'Attribution theory, conformity, persuasion, social identity, prejudice, and group decision-making.',
        },
        {
          id: 'psy-personality',
          title: 'Theories of Personality & Psychometrics',
          description: 'Trait models, Big Five dimensions, psychodynamic theories, and standardized psychological assessment.',
        },
      ],
      '3rd Year': [
        {
          id: 'psy-abnormal',
          title: 'Abnormal Psychology & Clinical Psychopathology',
          description: 'DSM-5 diagnostic criteria, anxiety disorders, mood disorders, psychosis, and etiology.',
        },
        {
          id: 'psy-research-methods',
          title: 'Psychological Research Design & Statistical Modeling',
          description: 'Experimental and correlational designs, ANOVA, psychometric reliability, and ethical guidelines.',
        },
      ],
      '4th Year': [
        {
          id: 'psy-clinical-interventions',
          title: 'Clinical Psychology & Evidence-Based Therapies',
          description: 'Cognitive-behavioral therapy, psychodynamic interventions, mindfulness, and therapeutic alliance.',
        },
        {
          id: 'psy-neuropsychology',
          title: 'Clinical Neuropsychology & Brain Rehabilitation',
          description: 'Traumatic brain injury, aphasia, agnosia, executive dysfunction, and neuroplasticity.',
        },
      ],
    },
  },

  // 5. Law & Legal Studies
  {
    id: 'law',
    name: 'Law & Legal Studies',
    shortName: 'Law & Jurisprudence',
    description: 'Constitutional jurisprudence, contracts, torts, criminal law, corporate law, and international treaties.',
    iconName: 'Scale',
    years: {
      '1st Year': [
        {
          id: 'law-constitutional',
          title: 'Constitutional Law & Separation of Powers',
          description: 'Judicial review, legislative authority, executive discretion, and fundamental civil rights.',
          sampleDocument: {
            id: 'doc-law-const',
            title: 'Constitutional Law & Separation of Powers',
            branchId: 'law',
            year: '1st Year',
            rawText: constitutionalLawText,
            sentences: constitutionalLawSentences,
            chapters: [{ title: 'Chapter 1: Separation of Powers & Judicial Review', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'law-jurisprudence',
          title: 'Legal Philosophy & Jurisprudential Thought',
          description: 'Natural law, legal positivism, legal realism, critical legal studies, and theories of justice.',
        },
        {
          id: 'law-contracts',
          title: 'Law of Contracts & Obligations',
          description: 'Offer, acceptance, consideration, breach of contract, remedies, and promissory estoppel.',
        },
      ],
      '2nd Year': [
        {
          id: 'law-torts',
          title: 'Law of Torts & Civil Wrongs',
          description: 'Negligence, duty of care, strict liability, product liability, defamation, and damages.',
        },
        {
          id: 'law-criminal',
          title: 'Criminal Law & Substantive Penal Codes',
          description: 'Actus reus, mens rea, defenses, homicide, property offenses, and criminal responsibility.',
        },
        {
          id: 'law-property',
          title: 'Property Law & Real Estate Transactions',
          description: 'Freehold and leasehold estates, easements, covenants, land registration, and conveyancing.',
        },
      ],
      '3rd Year': [
        {
          id: 'law-corporate',
          title: 'Corporate Law & Commercial Governance',
          description: 'Corporate personality, director duties, shareholder remedies, securities regulation, and insolvency.',
        },
        {
          id: 'law-civil-procedure',
          title: 'Civil Procedure & Trial Practice',
          description: 'Jurisdiction, pleadings, discovery, pre-trial motions, evidence admissibility, and appeals.',
        },
      ],
      '4th Year': [
        {
          id: 'law-ip',
          title: 'Intellectual Property Law & Digital Assets',
          description: 'Patents, copyright, trademarks, trade secrets, fair use, and patent litigation.',
        },
        {
          id: 'law-international',
          title: 'Public International Law & Dispute Resolution',
          description: 'State sovereignty, international treaties, customary international law, arbitration, and human rights.',
        },
      ],
    },
  },

  // 6. Medicine, Nursing & Health Sciences
  {
    id: 'medicine',
    name: 'Medicine, Nursing & Health Sciences',
    shortName: 'Medicine & Health',
    description: 'Human anatomy, systemic physiology, pharmacology, pathology, epidemiology, and patient diagnostics.',
    iconName: 'Activity',
    years: {
      '1st Year': [
        {
          id: 'med-anatomy',
          title: 'Human Gross Anatomy & Systemic Physiology',
          description: 'Cardiovascular hemodynamics, respiratory mechanisms, muscular architecture, and homeostasis.',
          sampleDocument: {
            id: 'doc-med-anat',
            title: 'Human Gross Anatomy & Systemic Physiology',
            branchId: 'medicine',
            year: '1st Year',
            rawText: humanAnatomyText,
            sentences: humanAnatomySentences,
            chapters: [{ title: 'Chapter 1: Cardiovascular Hemodynamics & Homeostasis', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'med-biochem',
          title: 'Medical Biochemistry & Cellular Energetics',
          description: 'Glycolysis, Krebs cycle, oxidative phosphorylation, lipid metabolism, and enzyme kinetics.',
        },
        {
          id: 'med-embryology',
          title: 'Human Embryology & Histology',
          description: 'Gastrulation, organogenesis, tissue histology, epithelial differentiation, and teratology.',
        },
      ],
      '2nd Year': [
        {
          id: 'med-pathology',
          title: 'General Pathology & Disease Mechanisms',
          description: 'Cellular injury, inflammation, wound healing, hemodynamic disorders, neoplasia, and genetic diseases.',
        },
        {
          id: 'med-pharmacology',
          title: 'Medical Pharmacology & Therapeutics',
          description: 'Pharmacokinetics, pharmacodynamics, autonomic drugs, antimicrobial agents, and receptor theory.',
        },
        {
          id: 'med-microbiology',
          title: 'Medical Microbiology & Immunology',
          description: 'Bacteriology, virology, mycology, immune defense mechanisms, vaccines, and hypersensitivity.',
        },
      ],
      '3rd Year': [
        {
          id: 'med-clinical-medicine',
          title: 'Internal Medicine & Physical Diagnostics',
          description: 'History taking, cardiovascular examination, respiratory diagnosis, endocrine disorders, and ECG interpretation.',
        },
        {
          id: 'med-surgery-fundamentals',
          title: 'Principles of Surgery & Perioperative Care',
          description: 'Surgical asepsis, wound healing, trauma evaluation, fluid balance, and emergency resuscitation.',
        },
      ],
      '4th Year': [
        {
          id: 'med-epidemiology',
          title: 'Epidemiology, Biostatistics & Public Health',
          description: 'Study designs, cohort studies, clinical trials, disease surveillance, and global health policy.',
        },
        {
          id: 'med-emergency-care',
          title: 'Emergency Medicine & Critical Care Protocols',
          description: 'Advanced cardiac life support (ACLS), acute trauma management, shock protocols, and toxicology.',
        },
      ],
    },
  },

  // 7. Biological Sciences & Biotechnology
  {
    id: 'biology',
    name: 'Biological Sciences & Biotechnology',
    shortName: 'Biological Sciences',
    description: 'Cell biology, genetics, recombinant DNA, biochemistry, bioprocessing, and evolutionary ecology.',
    iconName: 'Dna',
    years: {
      '1st Year': [
        {
          id: 'bio-genetics',
          title: 'Molecular Genetics & The Central Dogma',
          description: 'DNA replication, transcription, translation, gene expression, and epigenetic modifications.',
          sampleDocument: {
            id: 'doc-bio-genetics',
            title: 'Molecular Genetics & The Central Dogma',
            branchId: 'biology',
            year: '1st Year',
            rawText: molecularGeneticsText,
            sentences: molecularGeneticsSentences,
            chapters: [{ title: 'Chapter 1: DNA Structure & The Central Dogma', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'bio-cell-biology',
          title: 'Cellular Structure & Organelle Dynamics',
          description: 'Membrane transport, protein trafficking, cytoskeleton, mitochondria, and cell division cycles.',
        },
        {
          id: 'bio-chemistry-organic',
          title: 'Organic Chemistry for Life Sciences',
          description: 'Functional groups, stereochemistry, reaction mechanisms, biomolecules, and spectroscopy.',
        },
      ],
      '2nd Year': [
        {
          id: 'bio-biochem',
          title: 'Biochemistry & Enzymatic Catalysis',
          description: 'Enzyme kinetics, Michaelis-Menten equations, metabolic pathways, and allosteric regulation.',
        },
        {
          id: 'bio-microbial',
          title: 'Microbial Physiology & Virology',
          description: 'Bacterial metabolism, viral replication cycles, microbial genetics, and antibiotic resistance.',
        },
      ],
      '3rd Year': [
        {
          id: 'bio-recombinant-dna',
          title: 'Recombinant DNA Technology & Genetic Engineering',
          description: 'Cloning vectors, restriction enzymes, PCR, CRISPR-Cas9 genome editing, and DNA sequencing.',
        },
        {
          id: 'bio-bioinformatics',
          title: 'Bioinformatics & Computational Genomics',
          description: 'Sequence alignment, BLAST algorithms, phylogenetic trees, structural modeling, and gene annotation.',
        },
      ],
      '4th Year': [
        {
          id: 'bio-bioprocess',
          title: 'Industrial Bioprocess & Biomanufacturing',
          description: 'Bioreactor design, mass transfer, fermentation kinetics, downstream purification, and scale-up.',
        },
        {
          id: 'bio-synthetic',
          title: 'Synthetic Biology & Metabolic Engineering',
          description: 'Gene circuits, biological logic gates, pathway optimization, and cellular biofactories.',
        },
      ],
    },
  },

  // 8. Physics & Mathematical Sciences
  {
    id: 'physics-math',
    name: 'Physics & Mathematical Sciences',
    shortName: 'Physics & Mathematics',
    description: 'Calculus, linear algebra, classical mechanics, electrodynamics, quantum physics, and differential equations.',
    iconName: 'Atom',
    years: {
      '1st Year': [
        {
          id: 'phys-multivariable',
          title: 'Multivariable Calculus & Vector Analysis',
          description: 'Gradient, divergence, curl, Stokes theorem, eigenvalues, and coordinate transformations.',
          sampleDocument: {
            id: 'doc-phys-calc',
            title: 'Multivariable Calculus & Vector Analysis',
            branchId: 'physics-math',
            year: '1st Year',
            rawText: multivariableCalculusText,
            sentences: multivariableCalculusSentences,
            chapters: [{ title: 'Chapter 1: Vector Calculus & Eigenvalue Analysis', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'phys-classical-mechanics',
          title: 'Classical Mechanics & Newtonian Dynamics',
          description: 'Conservative forces, angular momentum, harmonic oscillators, and central force motion.',
        },
        {
          id: 'phys-linear-algebra',
          title: 'Linear Algebra & Abstract Vector Spaces',
          description: 'Vector spaces, linear independence, inner product spaces, spectral theorem, and matrix rank.',
        },
      ],
      '2nd Year': [
        {
          id: 'phys-differential-eq',
          title: 'Ordinary & Partial Differential Equations',
          description: 'Separation of variables, Fourier series, Laplace transforms, and boundary value problems.',
        },
        {
          id: 'phys-electrodynamics',
          title: 'Electrodynamics & Maxwell Equations',
          description: 'Gauss law, Ampere law, Faraday induction, displacement currents, and electromagnetic waves.',
        },
        {
          id: 'phys-thermo-stat',
          title: 'Thermodynamics & Statistical Mechanics',
          description: 'Laws of thermodynamics, entropy, partition functions, Boltzmann distribution, and phase transitions.',
        },
      ],
      '3rd Year': [
        {
          id: 'phys-quantum-mechanics',
          title: 'Quantum Mechanics & Wave Equations',
          description: 'Schrödinger wave equation, infinite potential wells, quantum tunneling, and angular momentum operators.',
        },
        {
          id: 'phys-real-analysis',
          title: 'Real Analysis & Rigorous Proofs',
          description: 'Metric spaces, sequences, Cauchy criteria, compact sets, and Riemann integration.',
        },
      ],
      '4th Year': [
        {
          id: 'phys-general-relativity',
          title: 'Relativity, Astrophysics & Cosmology',
          description: 'Special relativity, spacetime tensors, Einstein field equations, gravitational waves, and cosmology.',
        },
        {
          id: 'phys-solid-state',
          title: 'Solid State Physics & Semiconductor Theory',
          description: 'Crystal lattices, Brillouin zones, band theory of solids, and superconductivity.',
        },
      ],
    },
  },

  // 9. Literature, Philosophy & Humanities
  {
    id: 'humanities',
    name: 'Literature, Philosophy & Humanities',
    shortName: 'Humanities & Arts',
    description: 'World literature, moral philosophy, critical cultural theory, historical analysis, and logic.',
    iconName: 'Book',
    years: {
      '1st Year': [
        {
          id: 'hum-world-lit',
          title: 'World Literature & Narrative Archetypes',
          description: 'Comparative mythology, narrative structures, thematic motifs, and textual deconstruction.',
          sampleDocument: {
            id: 'doc-hum-lit',
            title: 'World Literature & Narrative Archetypes',
            branchId: 'humanities',
            year: '1st Year',
            rawText: worldLiteratureText,
            sentences: worldLiteratureSentences,
            chapters: [{ title: 'Chapter 1: Narrative Archetypes & Textual Analysis', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'hum-philosophy-intro',
          title: 'Introduction to Philosophy & Epistemology',
          description: 'Socratic dialogue, theories of knowledge, mind-body dualism, empiricism, and rationalism.',
        },
        {
          id: 'hum-critical-thinking',
          title: 'Critical Thinking, Logic & Rhetoric',
          description: 'Propositional logic, informal fallacies, deductive argumentation, and rhetorical analysis.',
        },
      ],
      '2nd Year': [
        {
          id: 'hum-ethics',
          title: 'Ethics, Morality & Theories of Justice',
          description: 'Utilitarianism, deontology, virtue ethics, bioethics, and contemporary moral dilemmas.',
        },
        {
          id: 'hum-literary-theory',
          title: 'Literary Theory & Critical Interpretation',
          description: 'Structuralism, post-structuralism, psychoanalytic criticism, postcolonialism, and ecocriticism.',
        },
      ],
      '3rd Year': [
        {
          id: 'hum-political-philosophy',
          title: 'Political Philosophy & Social Contract Theory',
          description: 'Hobbes, Locke, Rousseau, Marx, Rawlsian distributive justice, and democratic theory.',
        },
        {
          id: 'hum-existentialism',
          title: 'Existentialism & 20th-Century European Thought',
          description: 'Kierkegaard, Nietzsche, Sartre, Camus, phenomenology, and the search for authentic meaning.',
        },
      ],
      '4th Year': [
        {
          id: 'hum-modern-literature',
          title: 'Modernism & Postmodern Literature',
          description: 'Stream of consciousness, avant-garde poetry, magical realism, and contemporary world fiction.',
        },
        {
          id: 'hum-seminar',
          title: 'Senior Humanities Capstone & Research Seminar',
          description: 'Interdisciplinary research methodologies, archival investigation, and original monograph synthesis.',
        },
      ],
    },
  },

  // 10. Architecture & Environmental Design
  {
    id: 'architecture',
    name: 'Architecture & Environmental Design',
    shortName: 'Architecture',
    description: 'Architectural form, sustainable building design, urban planning, structural physics, and landscape.',
    iconName: 'Compass',
    years: {
      '1st Year': [
        {
          id: 'arch-spatial-design',
          title: 'Architectural Spatial Design & Sustainable Urbanism',
          description: 'Spatial hierarchy, Vitruvian principles, climate-responsive envelopes, and daylighting.',
          sampleDocument: {
            id: 'doc-arch-design',
            title: 'Architectural Spatial Design & Sustainable Urbanism',
            branchId: 'architecture',
            year: '1st Year',
            rawText: architecturalDesignText,
            sentences: architecturalDesignSentences,
            chapters: [{ title: 'Chapter 1: Spatial Form & Sustainable Urbanism', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'arch-history',
          title: 'History of World Architecture & City Morphology',
          description: 'Classical orders, Gothic structural innovation, Renaissance proportion, and Modernist movements.',
        },
        {
          id: 'arch-visual',
          title: 'Architectural Drawing, Perspective & Representation',
          description: 'Orthographic projections, axonometric rendering, section drafting, and physical scale modeling.',
        },
      ],
      '2nd Year': [
        {
          id: 'arch-structures',
          title: 'Structural Systems & Building Mechanics',
          description: 'Trusses, beams, columns, arches, foundations, load paths, and structural equilibrium.',
        },
        {
          id: 'arch-climate',
          title: 'Environmental Systems & Climate-Responsive Architecture',
          description: 'Passive solar design, thermal insulation, natural ventilation, acoustic design, and shading systems.',
        },
      ],
      '3rd Year': [
        {
          id: 'arch-urban-planning',
          title: 'Urban Design & City Planning Theory',
          description: 'Zoning, urban transit networks, public space revitalization, pedestrian mobility, and density.',
        },
        {
          id: 'arch-digital-fabrication',
          title: 'Computational Architecture & Parametric Modeling',
          description: 'Algorithmic form-generation, building information modeling (BIM), and digital fabrication.',
        },
      ],
      '4th Year': [
        {
          id: 'arch-capstone',
          title: 'Comprehensive Architectural Thesis Studio',
          description: 'Master planning, integrated building systems, code compliance, and graduation defense.',
        },
        {
          id: 'arch-professional-practice',
          title: 'Professional Architectural Practice & Construction Law',
          description: 'Contract administration, building codes, client management, project bidding, and professional ethics.',
        },
      ],
    },
  },

  // 11. Engineering & Applied Technology
  {
    id: 'engineering',
    name: 'Engineering & Applied Technology',
    shortName: 'Engineering & Robotics',
    description: 'Circuits, robotics, thermodynamics, control systems, mechanics of materials, and automation.',
    iconName: 'Wrench',
    years: {
      '1st Year': [
        {
          id: 'eng-circuits',
          title: 'Circuit Conservation Laws & AC Resonance',
          description: 'Kirchhoff laws, Thevenin and Norton equivalents, reactive impedance, and AC resonance.',
          sampleDocument: {
            id: 'doc-eng-circuits',
            title: 'Circuit Conservation Laws & AC Resonance',
            branchId: 'engineering',
            year: '1st Year',
            rawText: electricalEngineeringText,
            sentences: electricalEngineeringSentences,
            chapters: [{ title: 'Chapter 1: Circuit Conservation Laws & AC Resonance', startSentenceIndex: 0 }],
          },
        },
        {
          id: 'eng-math-foundations',
          title: 'Engineering Mathematics: Calculus & Linear Systems',
          description: 'Matrix algebra, differential calculus, vector operators, and systems of linear equations.',
        },
        {
          id: 'eng-mechanics',
          title: 'Engineering Mechanics: Statics & Dynamics',
          description: 'Particle equilibrium, rigid body mechanics, friction, moments of inertia, and kinematics.',
        },
      ],
      '2nd Year': [
        {
          id: 'eng-thermodynamics',
          title: 'Engineering Thermodynamics & Energy Conversion',
          description: 'First and second laws, Carnot cycles, Rankine cycles, refrigeration, and entropy analysis.',
        },
        {
          id: 'eng-strength-materials',
          title: 'Mechanics of Deformable Materials',
          description: 'Stress and strain tensors, beam bending, torsion of shafts, Mohr circle, and column buckling.',
        },
        {
          id: 'eng-electronics',
          title: 'Electronic Circuits & Signal Conditioning',
          description: 'Operational amplifiers, diode rectifiers, transistor switching, and active analog filters.',
        },
      ],
      '3rd Year': [
        {
          id: 'eng-control-systems',
          title: 'Feedback Control Systems & State-Space Dynamics',
          description: 'Bode plots, Nyquist stability criterion, root locus analysis, PID tuning, and state feedback.',
        },
        {
          id: 'eng-robotics-actuators',
          title: 'Robotics, Transducers & Actuator Integration',
          description: 'Forward kinematics, optical encoders, stepper motors, hydraulic actuators, and PLC automation.',
        },
      ],
      '4th Year': [
        {
          id: 'eng-autonomous-systems',
          title: 'Autonomous Robotics & Machine Perception',
          description: 'Computer vision, SLAM (simultaneous localization and mapping), path planning, and embedded control.',
        },
        {
          id: 'eng-scada-industrial',
          title: 'Industrial SCADA, Distributed Networks & IoT',
          description: 'Supervisory control, Modbus/OPC protocols, industrial cybersecurity, and real-time telemetry.',
        },
      ],
    },
  },
];

// Compatibility export
export const BITS_DUBAI_BRANCHES = COLLEGE_BRANCHES;

// Helper to retrieve courses that have ready-to-listen presets for any branch and year
export function getPresetsForBranchAndYear(branchId: string, year: AcademicYear): CourseItem[] {
  const branch = COLLEGE_BRANCHES.find(b => b.id === branchId) || COLLEGE_BRANCHES[0];
  const courses = branch.years[year] || [];
  return courses.filter(c => !!c.sampleDocument);
}
