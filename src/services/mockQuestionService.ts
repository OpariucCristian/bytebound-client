// Mock question service
export type Category = 'data-structures' | 'typescript' | 'csharp';
export type Difficulty = 'short' | 'medium' | 'long';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  category: Category;
  question: string;
  answers: Answer[];
  explanation: string;
}

const QUESTIONS: Record<Category, Question[]> = {
  'data-structures': [
    {
      id: 'ds1',
      category: 'data-structures',
      question: 'What is the time complexity of accessing an element in an array by index?',
      answers: [
        { id: 'a1', text: 'O(1)', isCorrect: true },
        { id: 'a2', text: 'O(n)', isCorrect: false },
        { id: 'a3', text: 'O(log n)', isCorrect: false },
        { id: 'a4', text: 'O(n^2)', isCorrect: false },
      ],
      explanation: 'Array access by index is O(1) because arrays store elements in contiguous memory locations.',
    },
    {
      id: 'ds2',
      category: 'data-structures',
      question: 'Which data structure uses LIFO (Last In First Out) principle?',
      answers: [
        { id: 'a1', text: 'Queue', isCorrect: false },
        { id: 'a2', text: 'Stack', isCorrect: true },
        { id: 'a3', text: 'Linked List', isCorrect: false },
        { id: 'a4', text: 'Hash Table', isCorrect: false },
      ],
      explanation: 'A Stack follows LIFO - the last element added is the first one to be removed.',
    },
    {
      id: 'ds3',
      category: 'data-structures',
      question: 'What is the average time complexity for search in a balanced BST?',
      answers: [
        { id: 'a1', text: 'O(1)', isCorrect: false },
        { id: 'a2', text: 'O(log n)', isCorrect: true },
        { id: 'a3', text: 'O(n)', isCorrect: false },
        { id: 'a4', text: 'O(n log n)', isCorrect: false },
      ],
      explanation: 'In a balanced Binary Search Tree, search takes O(log n) as we eliminate half the tree at each step.',
    },
    {
      id: 'ds4',
      category: 'data-structures',
      question: 'Which data structure is best for implementing a LRU cache?',
      answers: [
        { id: 'a1', text: 'Array', isCorrect: false },
        { id: 'a2', text: 'Hash Map + Doubly Linked List', isCorrect: true },
        { id: 'a3', text: 'Binary Tree', isCorrect: false },
        { id: 'a4', text: 'Stack', isCorrect: false },
      ],
      explanation: 'LRU cache uses a combination of Hash Map (for O(1) lookup) and Doubly Linked List (for O(1) insertion/deletion).',
    },
    {
      id: 'ds5',
      category: 'data-structures',
      question: 'What is a heap primarily used for?',
      answers: [
        { id: 'a1', text: 'Sorting', isCorrect: false },
        { id: 'a2', text: 'Priority Queue', isCorrect: true },
        { id: 'a3', text: 'Graph Traversal', isCorrect: false },
        { id: 'a4', text: 'String Matching', isCorrect: false },
      ],
      explanation: 'Heaps are primarily used to implement Priority Queues, allowing efficient access to min/max elements.',
    },
  ],
  'typescript': [
    {
      id: 'ts1',
      category: 'typescript',
      question: 'What does the "never" type represent in TypeScript?',
      answers: [
        { id: 'a1', text: 'A value that can be anything', isCorrect: false },
        { id: 'a2', text: 'A value that never occurs', isCorrect: true },
        { id: 'a3', text: 'An undefined value', isCorrect: false },
        { id: 'a4', text: 'A null value', isCorrect: false },
      ],
      explanation: 'The "never" type represents values that never occur, like functions that always throw or never return.',
    },
    {
      id: 'ts2',
      category: 'typescript',
      question: 'What is the purpose of the "readonly" keyword?',
      answers: [
        { id: 'a1', text: 'Makes variables constant', isCorrect: false },
        { id: 'a2', text: 'Prevents property modification after initialization', isCorrect: true },
        { id: 'a3', text: 'Creates private properties', isCorrect: false },
        { id: 'a4', text: 'Optimizes performance', isCorrect: false },
      ],
      explanation: 'The "readonly" modifier prevents properties from being changed after they are initialized.',
    },
    {
      id: 'ts3',
      category: 'typescript',
      question: 'What does the "keyof" operator do?',
      answers: [
        { id: 'a1', text: 'Creates a new object', isCorrect: false },
        { id: 'a2', text: 'Returns a union of object keys', isCorrect: true },
        { id: 'a3', text: 'Checks if a key exists', isCorrect: false },
        { id: 'a4', text: 'Deletes a key', isCorrect: false },
      ],
      explanation: 'The "keyof" operator produces a union type of all property keys of a given type.',
    },
    {
      id: 'ts4',
      category: 'typescript',
      question: 'What is a discriminated union?',
      answers: [
        { id: 'a1', text: 'A union with a common property', isCorrect: true },
        { id: 'a2', text: 'A type that discriminates against values', isCorrect: false },
        { id: 'a3', text: 'An intersection of types', isCorrect: false },
        { id: 'a4', text: 'A conditional type', isCorrect: false },
      ],
      explanation: 'A discriminated union has a common property (discriminant) that TypeScript uses to narrow types.',
    },
    {
      id: 'ts5',
      category: 'typescript',
      question: 'What does the "as const" assertion do?',
      answers: [
        { id: 'a1', text: 'Casts to a constant', isCorrect: false },
        { id: 'a2', text: 'Creates a readonly literal type', isCorrect: true },
        { id: 'a3', text: 'Declares a constant', isCorrect: false },
        { id: 'a4', text: 'Freezes an object', isCorrect: false },
      ],
      explanation: '"as const" creates a readonly literal type, narrowing types to their literal values.',
    },
  ],
  'csharp': [
    {
      id: 'cs1',
      category: 'csharp',
      question: 'What is the difference between "abstract" and "virtual" methods?',
      answers: [
        { id: 'a1', text: 'No difference', isCorrect: false },
        { id: 'a2', text: 'Abstract has no implementation, virtual has default', isCorrect: true },
        { id: 'a3', text: 'Virtual is faster', isCorrect: false },
        { id: 'a4', text: 'Abstract is sealed', isCorrect: false },
      ],
      explanation: 'Abstract methods have no implementation and must be overridden. Virtual methods have a default implementation that can be overridden.',
    },
    {
      id: 'cs2',
      category: 'csharp',
      question: 'What does the "async" keyword do?',
      answers: [
        { id: 'a1', text: 'Makes code run in parallel', isCorrect: false },
        { id: 'a2', text: 'Enables await and async operations', isCorrect: true },
        { id: 'a3', text: 'Creates a new thread', isCorrect: false },
        { id: 'a4', text: 'Blocks execution', isCorrect: false },
      ],
      explanation: 'The "async" keyword enables the use of "await" and marks a method as asynchronous.',
    },
    {
      id: 'cs3',
      category: 'csharp',
      question: 'What is the purpose of "yield return"?',
      answers: [
        { id: 'a1', text: 'Returns multiple values at once', isCorrect: false },
        { id: 'a2', text: 'Creates an iterator', isCorrect: true },
        { id: 'a3', text: 'Yields execution to another thread', isCorrect: false },
        { id: 'a4', text: 'Returns and exits method', isCorrect: false },
      ],
      explanation: '"yield return" creates an iterator that returns values one at a time, enabling lazy evaluation.',
    },
    {
      id: 'cs4',
      category: 'csharp',
      question: 'What is a record type in C#?',
      answers: [
        { id: 'a1', text: 'A type for database records', isCorrect: false },
        { id: 'a2', text: 'An immutable reference type', isCorrect: true },
        { id: 'a3', text: 'A logging utility', isCorrect: false },
        { id: 'a4', text: 'A media file type', isCorrect: false },
      ],
      explanation: 'Records are immutable reference types with value-based equality semantics.',
    },
    {
      id: 'cs5',
      category: 'csharp',
      question: 'What does the "??" operator do?',
      answers: [
        { id: 'a1', text: 'Null coalescing - returns first non-null value', isCorrect: true },
        { id: 'a2', text: 'Null check', isCorrect: false },
        { id: 'a3', text: 'Conditional operator', isCorrect: false },
        { id: 'a4', text: 'String concatenation', isCorrect: false },
      ],
      explanation: 'The null-coalescing operator (??) returns the left operand if it\'s not null, otherwise returns the right operand.',
    },
  ],
};

export const mockQuestionService = {
  getQuestions: async (category: Category, difficulty: Difficulty): Promise<Question[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const count = difficulty === 'short' ? 5 : difficulty === 'medium' ? 10 : 15;
    const categoryQuestions = QUESTIONS[category];
    
    // Repeat questions if needed to reach the count
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(categoryQuestions[i % categoryQuestions.length]);
    }
    
    return questions;
  },

  getCategoryName: (category: Category): string => {
    const names: Record<Category, string> = {
      'data-structures': 'Data Structures',
      'typescript': 'TypeScript',
      'csharp': 'C#',
    };
    return names[category];
  },

  getDifficultyQuestionCount: (difficulty: Difficulty): number => {
    return difficulty === 'short' ? 5 : difficulty === 'medium' ? 10 : 15;
  },
};
