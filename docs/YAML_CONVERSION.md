# YAML to JSON Conversion

This project includes functionality to convert YAML responses to JSON objects, specifically for handling AI-generated question sets.

## Installation

The required dependencies are already installed:

```bash
pnpm add js-yaml
pnpm add -D @types/js-yaml
```

## Usage

### Basic Conversion

```typescript
import { yamlToJson, jsonToYaml } from '@/lib/yaml-converter';

// Convert YAML string to JSON object
const yamlString = `
- id: 1
  question: "What is 2+2?"
  options:
    A: "3"
    B: "4"
    C: "5"
    D: "6"
  correctAnswer: "B"
  explanation: "Basic arithmetic: 2+2=4"
`;

const jsonData = yamlToJson(yamlString);
console.log(jsonData);
// Output: [{ id: 1, question: "What is 2+2?", ... }]

// Convert JSON back to YAML
const backToYaml = jsonToYaml(jsonData);
console.log(backToYaml);
```

### API Route Usage

The `/api/generate-questions` route now supports YAML responses from AI and converts them to JSON:

1. **AI generates YAML response** based on PDF content
2. **YAML is parsed** using `js-yaml` library
3. **Data is validated** and normalized to ensure consistency
4. **JSON response** is returned to the client

### Utility Functions

#### `yamlToJson(yamlString: string): any`
Converts a YAML string to a JavaScript object/JSON.

#### `jsonToYaml(jsonObject: any, options?: yaml.DumpOptions): string`
Converts a JavaScript object to a YAML string.

#### `isValidYaml(yamlString: string): boolean`
Validates if a string is valid YAML format.

#### `isValidJson(jsonObject: any): boolean`
Validates if an object can be converted to YAML.

#### `convertQuestionsYamlToJson(yamlString: string): Question[]`
Specialized function for converting question YAML to typed JSON.

### Error Handling

The conversion includes comprehensive error handling:

- **YAML parsing errors** are caught and logged
- **Fallback to JSON parsing** if YAML fails
- **Validation errors** for malformed question data
- **Type safety** with TypeScript interfaces

### Testing

Run the test script to see the conversion in action:

```bash
node scripts/test-yaml-conversion.js
```

### Question Schema

The expected YAML structure for questions:

```yaml
- id: 1
  question: "Question text with LaTeX support: $E = mc^2$"
  options:
    A: "Option A text"
    B: "Option B text"
    C: "Option C text"
    D: "Option D text"
  correctAnswer: "A"
  explanation: "Explanation text"
```

### Benefits of YAML

1. **More readable** than JSON for AI generation
2. **Supports multi-line strings** naturally
3. **Less prone to escaping issues** 
4. **Easier for AI models** to generate consistently
5. **Better error messages** when parsing fails

### LaTeX Support

Both YAML and JSON formats support LaTeX mathematical notation:
- Inline math: `$E = mc^2$`
- Display math: `$$\frac{1}{2}mv^2$$`

The conversion preserves LaTeX formatting throughout the process.