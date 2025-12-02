import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { spokenText, courseTitle, summary, termsContext, flashcardsContext } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are an AI study tutor evaluating a student's spoken explanation of a topic.

TOPIC: "${courseTitle}"

COURSE SUMMARY:
${summary}

KEY TERMS TO KNOW:
${termsContext || "No specific terms provided"}

FLASHCARD CONTENT:
${flashcardsContext || "No flashcards provided"}

STUDENT'S SPOKEN EXPLANATION:
"${spokenText}"

Evaluate the student's explanation comprehensively:

1. **Score (0-100)**: How well did they cover the topic? Consider:
   - Accuracy of information
   - Completeness of key concepts
   - Use of correct terminology
   - Logical flow and structure

2. **Key Points Covered**: List the important concepts they mentioned correctly

3. **Key Points Missed**: List important concepts from the material they didn't mention

4. **Feedback**: Give encouraging, constructive feedback (2-3 sentences)

5. **Fluency Tips**: Any grammar or speaking clarity suggestions

6. **Suggested Improvements**: What should they study more?

Respond in this exact JSON format only:
{
  "score": <number 0-100>,
  "keyPointsCovered": ["point 1", "point 2"],
  "keyPointsMissed": ["missed point 1", "missed point 2"],
  "feedback": "Your encouraging feedback here",
  "fluencyTips": ["tip 1", "tip 2"],
  "suggestedImprovements": ["improvement 1", "improvement 2"]
}

Be encouraging but honest. If they covered the topic well, give a high score.
If they said very little, reflect that in a lower score but encourage them to try again.
Return ONLY valid JSON, no markdown.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json({ error: "AI evaluation failed" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse the JSON response
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
      const result = JSON.parse(jsonString);
      return NextResponse.json(result);
    } catch {
      // If JSON parsing fails, return a default response
      return NextResponse.json({
        score: 50,
        keyPointsCovered: [],
        keyPointsMissed: ["Unable to parse response"],
        feedback: "I had trouble evaluating your response. Please try speaking more clearly and covering the main points of the topic.",
        fluencyTips: ["Speak slowly and clearly", "Organize your thoughts before speaking"],
        suggestedImprovements: ["Review the course material and try again"],
      });
    }
  } catch (error) {
    console.error("Topic speech evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

