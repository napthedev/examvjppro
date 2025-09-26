#!/usr/bin/env node

// Test script to demonstrate YAML to JSON conversion
import {
  demonstrateConversion,
  yamlToJson,
  jsonToYaml,
  exampleQuestionsYaml,
} from "../lib/yaml-converter.js";

console.log("🔄 YAML to JSON Conversion Demo\n");
console.log("=".repeat(50));

try {
  // Run the demonstration
  demonstrateConversion();

  console.log("\n" + "=".repeat(50));
  console.log("✅ Conversion completed successfully!");

  // Additional examples
  console.log("\n📋 Testing individual functions:");

  const jsonData = yamlToJson(exampleQuestionsYaml);
  console.log(`📊 Parsed ${jsonData.length} questions from YAML`);

  const yamlData = jsonToYaml(jsonData);
  console.log(
    `📝 Converted back to YAML (${yamlData.split("\n").length} lines)`
  );
} catch (error) {
  console.error("❌ Error during conversion:", error.message);
  process.exit(1);
}
