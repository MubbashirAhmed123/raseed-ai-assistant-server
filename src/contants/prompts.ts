// src/constants/prompts.ts

export const RECEIPT_CATEGORIZATION_PROMPT = (rawText: string) => `You are an expert product categorizer. Your task is to accurately assign a category to each product based on its name and then group the products by their assigned categories.

Here is the extracted receipt data to analyze and categorize:

\`\`\`
${JSON.stringify(rawText, null, 2)}
\`\`\`

Please analyze this receipt text, identify the products and their prices, then categorize them into appropriate groups (such as Food & Beverages, Personal Care, Household Items, Electronics, Clothing, etc.). Return the result in a structured JSON format showing:
1. Each category with its products
2. Product names and prices where identifiable
3. Total number of items per category

Return the response in this JSON structure:
\`\`\`json
{
  "categories": {
    "Food & Beverages": [
      {"item": "product name", "price": 0.00, "quantity": 1}
    ],
    "Personal Care": [...],
    "Household Items": [...]
  },
  "summary": {
    "total_categories": 0,
    "total_items": 0
  }
}
\`\`\`

IMPORTANT: Return ONLY the JSON structure above. No additional text or explanations.`;

// Alternative: Template with placeholder approach
export const CATEGORIZATION_TEMPLATE = `You are an expert product categorizer. Your task is to accurately assign a category to each product based on its name and then group the products by their assigned categories.

Here is the extracted receipt data to analyze and categorize:

\`\`\`
{RECEIPT_DATA}
\`\`\`

Please analyze this receipt text, identify the products and their prices, then categorize them into appropriate groups (such as Food & Beverages, Personal Care, Household Items, Electronics, Clothing, etc.). Return the result in a structured JSON format showing:
1. Each category with its products
2. Product names and prices where identifiable
3. Total number of items per category

Return the response in this JSON structure:
\`\`\`json
{
  "categories": {
    "Food & Beverages": [
      {"item": "product name", "price": 0.00, "quantity": 1}
    ],
    "Personal Care": [...],
    "Household Items": [...]
  },
  "summary": {
    "total_categories": 0,
    "total_items": 0
  }
}
\`\`\`

IMPORTANT: Return ONLY the JSON structure above. No additional text or explanations.`;

// Function to build prompt with template
export const buildCategorizationPrompt = (rawText: string): string => {
  return CATEGORIZATION_TEMPLATE.replace('{RECEIPT_DATA}', rawText);
};
