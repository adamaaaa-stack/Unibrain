import { GeneratedCourse } from "./types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface FileInput {
  name: string;
  type: string;
  base64: string;
}

export async function generateCourseContent(
  title: string,
  text: string,
  files: FileInput[] = []
): Promise<GeneratedCourse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `You are an AI course generator and study coach. Your task is to analyze the provided content (text and/or images/documents) and create a comprehensive learning package.

Course Title: ${title}

${text ? `Text Content:\n${text}` : ""}

${files.length > 0 ? `\nAdditional files have been attached for analysis. Please examine all images and documents carefully.` : ""}

Based on ALL the provided content, create a complete study package with:

1. **Summary** (2-3 paragraphs) - Clear overview of key concepts
2. **Study Guide** (3-5 sections) - Structured breakdown with key points for each section
3. **Key Terms** (5-10 terms) - Important vocabulary with definitions
4. **Flashcards** (8-12 cards) - Question and answer pairs for memorization
5. **Quiz** (5-7 questions) - Multiple choice with 4 options each
6. **Practice Questions** (3-5 questions) - Open-ended questions for deeper thinking
7. **Study Tips** (4-6 tips) - Specific advice for mastering this material

Output your response as valid JSON only, with this exact structure:
{
  "summary": "Your comprehensive summary here...",
  "study_guide": [
    {
      "title": "Section Title",
      "content": "Detailed explanation of this section...",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "key_terms": [
    {"term": "Term name", "definition": "Clear definition"}
  ],
  "flashcards": [
    {"q": "Question text?", "a": "Answer text"}
  ],
  "quiz": [
    {"q": "Quiz question?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "The correct option text"}
  ],
  "practice_questions": [
    {"question": "Open-ended question?", "hint": "Optional hint", "sampleAnswer": "A good example answer"}
  ],
  "study_tips": [
    "Specific study tip 1",
    "Specific study tip 2"
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

  // Build the parts array for Gemini
  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
    { text: prompt }
  ];

  // Add files as inline data
  for (const file of files) {
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      parts.push({
        inline_data: {
          mime_type: file.type,
          data: file.base64,
        },
      });
    }
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  
  // Extract the text content from Gemini's response
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error("No content received from Gemini API");
  }

  // Parse the JSON from the response
  // Clean up potential markdown code blocks
  let jsonString = content.trim();
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.slice(7);
  }
  if (jsonString.startsWith("```")) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith("```")) {
    jsonString = jsonString.slice(0, -3);
  }
  jsonString = jsonString.trim();

  try {
    const parsed = JSON.parse(jsonString) as GeneratedCourse;
    return parsed;
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
