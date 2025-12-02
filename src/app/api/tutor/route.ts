import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, courseTitle, courseSummary, flashcards, keyTerms, history } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Build context from course materials
    const flashcardContext = flashcards
      ?.slice(0, 10)
      .map((f: { q: string; a: string }) => `Q: ${f.q}\nA: ${f.a}`)
      .join("\n\n");

    const termsContext = keyTerms
      ?.slice(0, 10)
      .map((t: { term: string; definition: string }) => `${t.term}: ${t.definition}`)
      .join("\n");

    // Build conversation history
    const conversationHistory = history
      ?.map((m: Message) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `You are a friendly and helpful AI tutor helping a student learn about "${courseTitle}".

COURSE SUMMARY:
${courseSummary}

KEY TERMS:
${termsContext || "No key terms provided"}

SAMPLE FLASHCARDS:
${flashcardContext || "No flashcards provided"}

CONVERSATION SO FAR:
${conversationHistory || "No previous conversation"}

INSTRUCTIONS:
- Be encouraging, patient, and supportive
- Explain concepts clearly using simple language
- Use examples when helpful
- If asked to quiz, create questions based on the course material
- If the student is confused, try explaining in a different way
- Keep responses concise but helpful (2-4 paragraphs max)
- Use emoji occasionally to be friendly 😊
- If asked about something unrelated to the course, gently redirect to the topic

Student's question: ${message}

Respond as the tutor:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const tutorResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!tutorResponse) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ response: tutorResponse });
  } catch (error) {
    console.error("Tutor API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

