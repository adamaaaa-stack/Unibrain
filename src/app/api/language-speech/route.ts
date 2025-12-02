import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { userSpeech, targetPhrase, language, languageCode } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are an expert ${language} language teacher evaluating a student's pronunciation.

TARGET PHRASE (what they should say): "${targetPhrase}"
LANGUAGE: ${language} (${languageCode})
WHAT THE STUDENT SAID (speech-to-text result): "${userSpeech}"

Evaluate their pronunciation and accuracy:

1. **Pronunciation Score (0-100)**: How well did they pronounce the words? Consider:
   - Correct sounds and phonemes
   - Accent and intonation
   - Stress on correct syllables

2. **Accuracy Score (0-100)**: How close was their speech to the target phrase?
   - Did they say the right words?
   - Were words in the correct order?

3. **Overall Score (0-100)**: Combined evaluation

4. **Feedback**: Encouraging feedback about their attempt (1-2 sentences in English)

5. **Pronunciation Tips**: Specific tips for pronouncing difficult sounds in ${language}

6. **Common Mistakes**: Common mistakes English speakers make with these ${language} sounds

Be encouraging! Learning a language is hard. If they got close, acknowledge their effort.

Respond in this exact JSON format only:
{
  "pronunciationScore": <number 0-100>,
  "accuracyScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "whatYouSaid": "${userSpeech}",
  "correctPronunciation": "${targetPhrase}",
  "feedback": "Your encouraging feedback here",
  "pronunciationTips": ["tip 1", "tip 2"],
  "commonMistakes": ["mistake to avoid 1", "mistake to avoid 2"]
}

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
      return NextResponse.json({
        pronunciationScore: 50,
        accuracyScore: 50,
        overallScore: 50,
        whatYouSaid: userSpeech,
        correctPronunciation: targetPhrase,
        feedback: "I had trouble evaluating your pronunciation. Please try speaking more clearly.",
        pronunciationTips: ["Speak slowly and clearly", "Try to match the native pronunciation"],
        commonMistakes: [],
      });
    }
  } catch (error) {
    console.error("Language speech evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

