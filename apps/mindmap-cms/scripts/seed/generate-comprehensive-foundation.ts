/**
 * Generate Comprehensive Foundation Mindmap
 * 
 * Creates a complete fullstack learning foundation with 32 nodes:
 * - L1 (10 nodes): Core fundamentals
 * - L2 (12 nodes): Web development essentials
 * - L3 (10 nodes): Professional skills
 */

interface NodeData {
  id: string
  title: string
  level: string
  parentId: string | null
  prerequisites: string[]
  estimatedHours: number
  difficultyScore: number
  tags: string[]
  reviewTTL: number
  content: {
    definition: string
    commonMistakes?: string[]
    pitfalls?: string[]
    bestPractices?: string[]
    realWorldUseCases?: string[]
    practiceTasks?: string[]
    assessment?: string
    signalsOfMastery?: string[]
    codeExamples?: Array<{
      language: string
      title: string
      code: string
    }>
  }
  flashcards: Array<{
    type: string
    question: string
    answer: string
  }>
}

// L1 Nodes: Core Fundamentals (10 nodes)
const l1Nodes: NodeData[] = [
  {
    id: 'foundation-root',
    title: 'Foundation',
    level: 'L1',
    parentId: null,
    prerequisites: [],
    estimatedHours: 300,
    difficultyScore: 2,
    tags: ['foundation', 'core', 'mandatory'],
    reviewTTL: 30,
    content: {
      definition: 'Core programming fundamentals required for all fullstack development. Master these before diving into frameworks.',
      commonMistakes: [
        'Skipping fundamentals to jump into frameworks',
        'Not practicing debugging systematically'
      ],
      pitfalls: [
        'Weak foundation leads to cargo-cult programming',
        'Without Git basics, collaboration becomes chaotic'
      ],
      bestPractices: [
        'Master one language deeply before learning frameworks',
        'Practice debugging daily with breakpoints',
        'Commit code frequently with meaningful messages'
      ],
      realWorldUseCases: [
        'Debug production issue by reading stack traces → reduced MTTR from 2 hours to 15 minutes'
      ],
      practiceTasks: [
        'Build a CLI tool with proper error handling and logging'
      ],
      assessment: 'Build a complete CLI application with error handling, unit tests (>80% coverage), Git workflow, and documentation.',
      signalsOfMastery: [
        'Can debug unfamiliar code within 30 minutes',
        'Writes functions with proper error handling by default'
      ]
    },
    flashcards: []
  },
  {
    id: 'programming-fundamentals',
    title: 'Programming Fundamentals',
    level: 'L1',
    parentId: 'foundation-root',
    prerequisites: [],
    estimatedHours: 40,
    difficultyScore: 1,
    tags: ['programming', 'basics'],
    reviewTTL: 14,
    content: {
      definition: 'Core programming concepts: variables, data types, operators, control flow, functions, and scope.',
      commonMistakes: [
        'Confusing pass-by-value vs pass-by-reference',
        'Not understanding variable scope'
      ],
      pitfalls: [
        'Skipping edge case handling (null, undefined, empty arrays)',
        'Not understanding type coercion'
      ],
      bestPractices: [
        'Use const by default, let when reassignment needed',
        'Always initialize variables with meaningful names',
        'Handle edge cases explicitly'
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Pass-by-value vs Pass-by-reference',
          code: `// Primitives: pass-by-value
let x = 5;
function changeValue(num) {
  num = 10; // Doesn't affect x
}
changeValue(x);
console.log(x); // Still 5

// Objects: pass-by-reference
const obj = { count: 5 };
function changeObject(o) {
  o.count = 10; // Mutates original!
}
changeObject(obj);
console.log(obj.count); // Now 10

// ✅ Better: Don't mutate
function updateObject(o) {
  return { ...o, count: 10 };
}`
        }
      ]
    },
    flashcards: []
  }
]

// Export the complete dataset
export function generateComprehensiveFoundation(): NodeData[] {
  return [
    ...l1Nodes,
    // L2 and L3 nodes will be added here
  ]
}

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const nodes = generateComprehensiveFoundation()
  console.log(JSON.stringify(nodes, null, 2))
}

