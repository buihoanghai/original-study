/**
 * Unit tests for convertToOutline function
 * Tests the conversion of node content to outline format
 */

// Mock data matching the actual database structure
const mockNodeWithSections = {
  text: 'Variables & Types',
  sections: [
    {
      id: 'definition',
      type: 'text',
      name: 'Definition',
      icon: '📖',
      color: 'blue',
      order: 1,
      defaultExpanded: true,
      content: {
        type: 'text',
        text: 'Variables are named containers that store data values. Types define what kind of data can be stored and what operations can be performed on that data.\n\nUnderstanding variables and types is fundamental to programming because they determine how data is stored in memory, how it can be manipulated, and how errors are caught.',
      },
    },
    {
      id: 'core-concepts',
      type: 'list',
      name: 'Core Concepts',
      icon: '🎯',
      color: 'green',
      order: 2,
      content: {
        type: 'list',
        listStyle: 'bullet',
        items: [
          'Primitive types: number, string, boolean, null, undefined, symbol, bigint',
          'Reference types: objects, arrays, functions',
          'Type coercion: implicit vs explicit conversion',
          'Variable declaration: var, let, const',
          'Scope: global, function, block',
          'Hoisting: variable and function declarations',
          'Mutability: mutable vs immutable data',
        ],
      },
    },
    {
      id: 'code-examples',
      type: 'code',
      name: 'Code Examples',
      icon: '💻',
      color: 'purple',
      order: 3,
      content: {
        type: 'code',
        examples: [
          {
            language: 'javascript',
            title: 'Variable Declaration & Types',
            code: "// Primitive types\nconst name = 'Alice'        // string\nconst age = 30              // number\nconst isActive = true       // boolean\nconst nothing = null        // null\nlet undefined_var           // undefined\n\n// Reference types\nconst person = { name: 'Bob', age: 25 }  // object\nconst numbers = [1, 2, 3, 4, 5]          // array\nconst greet = () => 'Hello'              // function\n\n// Type checking\nconsole.log(typeof name)      // 'string'\nconsole.log(typeof person)    // 'object'\nconsole.log(Array.isArray(numbers))  // true",
          },
          {
            language: 'javascript',
            title: 'const vs let vs var',
            code: "// const - cannot be reassigned\nconst PI = 3.14159\n// PI = 3.14  // ❌ Error: Assignment to constant variable\n\n// let - block-scoped, can be reassigned\nlet count = 0\ncount = 1  // ✅ OK\n\nif (true) {\n  let blockScoped = 'only here'\n}\n// console.log(blockScoped)  // ❌ Error: not defined\n\n// var - function-scoped, hoisted (avoid!)\nvar oldStyle = 'legacy'\nif (true) {\n  var leaks = 'escapes block'\n}\nconsole.log(leaks)  // ✅ 'escapes block' (unexpected!)",
          },
        ],
      },
    },
    {
      id: 'pitfalls',
      type: 'list',
      name: 'Common Pitfalls',
      icon: '⚠️',
      color: 'red',
      order: 4,
      content: {
        type: 'list',
        listStyle: 'bullet',
        items: [
          'Using var instead of let/const (hoisting issues, function scope leaks)',
          'Mutating const objects/arrays (const prevents reassignment, not mutation)',
          'Type coercion bugs (== vs ===, truthy/falsy confusion)',
          'Reference vs value comparison (comparing objects with ==)',
          'Undefined vs null confusion (both mean \'no value\' but used differently)',
          'Not handling NaN (NaN !== NaN, use Number.isNaN())',
          'Global variable pollution (declaring without let/const/var)',
        ],
      },
    },
  ],
}

// Copy the convertToOutline function here for testing
function convertToOutline(content: any) {
  const items: any[] = []

  // NEW SCHEMA: Handle sections array (preferred)
  if (content.sections && content.sections.length > 0) {
    console.log('Converting sections:', content.sections.length, 'sections found')
    content.sections.forEach((section: any, index: number) => {
      console.log(`Section ${index}:`, section.name, 'type:', section.content?.type)
      const sectionItem: any = {
        level: 1,
        title: section.name || 'Untitled Section',
      }

      // Handle different section content types
      if (section.content) {
        if (section.content.type === 'text') {
          sectionItem.content = section.content.text
        } else if (section.content.type === 'list') {
          sectionItem.list = section.content.items || []
          sectionItem.listStyle = section.content.listStyle || 'bullet'
        } else if (section.content.type === 'code') {
          // Handle both single code and examples array
          if (section.content.examples && section.content.examples.length > 0) {
            sectionItem.codeExamples = section.content.examples
          } else if (section.content.code) {
            sectionItem.codeExamples = [
              {
                language: section.content.language || 'javascript',
                code: section.content.code,
                title: section.content.title,
              },
            ]
          }
        }
      }

      items.push(sectionItem)
    })
    console.log('Converted items:', items.length)
    return items
  }

  // LEGACY SCHEMA: Fallback to old structure
  if (content.definition) {
    items.push({
      level: 1,
      title: 'Definition',
      content: content.definition,
    })
  }

  return items
}

// Run the test
console.log('='.repeat(80))
console.log('TESTING convertToOutline with mock data')
console.log('='.repeat(80))

const result = convertToOutline(mockNodeWithSections)

console.log('\n📊 RESULTS:')
console.log('Total items converted:', result.length)
console.log('\n')

result.forEach((item, index) => {
  console.log(`Item ${index + 1}:`)
  console.log('  Title:', item.title)
  console.log('  Level:', item.level)
  console.log('  Has content:', !!item.content)
  console.log('  Has list:', !!item.list)
  console.log('  Has codeExamples:', !!item.codeExamples)
  if (item.codeExamples) {
    console.log('  Number of code examples:', item.codeExamples.length)
  }
  console.log('')
})

console.log('='.repeat(80))

