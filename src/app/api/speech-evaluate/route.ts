import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { userText, expectedAnswer, question } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are an AI language and speaking coach. A student was asked to speak an answer aloud, and their speech was converted to text.

Question: "${question}"
Expected Answer: "${expectedAnswer}"
Student's Spoken Answer (transcribed): "${userText}"

Evaluate the student's response and provide feedback. Consider:
1. **Accuracy**: Did they convey the correct meaning? How close is their answer to the expected one?
2. **Pronunciation hints**: Based on common speech-to-text errors, suggest any words they might have mispronounced
3. **Grammar & Clarity**: Is the sentence grammatically correct and clear?

Respond in this exact JSON format only:
{
  "correctedText": "The correct/ideal answer they should have said",
  "accuracy": <number 0-100 representing accuracy percentage>,
  "feedback": "Brief, encouraging feedback about their answer (1-2 sentences)",
  "pronunciationTips": ["Tip 1 about pronunciation", "Tip 2 if needed"]
}

Be encouraging and helpful. If the answer is close but not exact, still give partial credit.
If the meaning is correct even with different wording, give high accuracy.
Return ONLY the JSON, no markdown or explanation.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
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
        correctedText: expectedAnswer,
        accuracy: 50,
        feedback: "I had trouble evaluating your response. Try speaking more clearly.",
        pronunciationTips: ["Speak slowly and clearly", "Make sure you're in a quiet environment"],
      });
    }
  } catch (error) {
    console.error("Speech evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

