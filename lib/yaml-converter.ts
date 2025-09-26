import yaml from "js-yaml";

/**
 * Converts YAML string to JSON object
 * @param yamlString - The YAML string to convert
 * @returns Parsed JSON object
 */
export function yamlToJson(yamlString: string): any {
  try {
    // Remove any markdown code block formatting if present
    const cleanedYaml = yamlString
      .replace(/```yaml\n?|\n?```|```\n?|\n?```/g, "")
      .trim();

    // Parse YAML and return as JSON object
    return yaml.load(cleanedYaml);
  } catch (error) {
    throw new Error(
      `Failed to parse YAML: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Converts JSON object to YAML string
 * @param jsonObject - The JSON object to convert
 * @param options - Optional YAML dump options
 * @returns YAML string representation
 */
export function jsonToYaml(
  jsonObject: any,
  options?: yaml.DumpOptions
): string {
  try {
    return yaml.dump(jsonObject, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      ...options,
    });
  } catch (error) {
    throw new Error(
      `Failed to convert to YAML: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Validates if a string is valid YAML
 * @param yamlString - The YAML string to validate
 * @returns true if valid, false otherwise
 */
export function isValidYaml(yamlString: string): boolean {
  try {
    yaml.load(yamlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if an object can be converted to YAML
 * @param jsonObject - The object to validate
 * @returns true if convertible, false otherwise
 */
export function isValidJson(jsonObject: any): boolean {
  try {
    yaml.dump(jsonObject);
    return true;
  } catch {
    return false;
  }
}

// Example usage and types for the questions schema
export interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

/**
 * Example function showing how to convert questions from YAML to JSON
 */
export function convertQuestionsYamlToJson(yamlString: string): Question[] {
  const parsed = yamlToJson(yamlString);

  if (!Array.isArray(parsed)) {
    throw new Error("YAML must contain an array of questions");
  }

  return parsed as Question[];
}

// Example YAML string for testing
export const exampleQuestionsYaml = `
- id: 1
  question: "What is the formula for kinetic energy?"
  options:
    A: "E = mc²"
    B: "KE = ½mv²"
    C: "F = ma"
    D: "P = mgh"
  correctAnswer: "B"
  explanation: "Kinetic energy is defined as KE = ½mv² where m is mass and v is velocity"
- id: 2
  question: "Which of the following represents Newton's second law?"
  options:
    A: "F = ma"
    B: "E = mc²"
    C: "v = u + at"
    D: "P = IV"
  correctAnswer: "A"
  explanation: "Newton's second law states that force equals mass times acceleration (F = ma)"
`;

// Example usage
export function demonstrateConversion() {
  console.log("Original YAML:");
  console.log(exampleQuestionsYaml);

  const jsonQuestions = convertQuestionsYamlToJson(exampleQuestionsYaml);
  console.log("\nConverted to JSON:");
  console.log(JSON.stringify(jsonQuestions, null, 2));

  const backToYaml = jsonToYaml(jsonQuestions);
  console.log("\nConverted back to YAML:");
  console.log(backToYaml);
}
