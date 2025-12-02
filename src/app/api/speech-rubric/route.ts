import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { spokenText, rubricData, courseTitle, summary, useCustomRubric } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const rubricInstructions = useCustomRubric
      ? `Use this custom rubric provided by the teacher:\n${rubricData}`
      : `Use this standard rubric (JSON format):\n${rubricData}`;

    const prompt = `You are an expert speech coach and grader. A student delivered a speech on the topic "${courseTitle}".

TOPIC SUMMARY:
${summary}

GRADING RUBRIC:
${rubricInstructions}

STUDENT'S SPEECH:
"${spokenText}"

Evaluate the speech against each rubric criterion. For each criterion, provide:
- A score (out of the maximum points for that criterion)
- Brief feedback on that specific criterion

Also provide:
- Overall percentage score (0-100)
- 2-3 specific strengths
- 2-3 areas for improvement
- Overall constructive feedback (2-3 sentences)

Be encouraging but honest. Grade fairly based on what they said.

Respond in this exact JSON format only:
{
  "scores": [
    {
      "criterion": "Criterion Name",
      "score": <number>,
      "maxScore": <max points for this criterion>,
      "feedback": "Brief feedback for this criterion"
    }
  ],
  "overallScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1", "area to improve 2"],
  "overallFeedback": "Overall encouraging feedback with specific suggestions"
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
        scores: [],
        overallScore: 50,
        strengths: ["You attempted the speech"],
        improvements: ["Try to cover more key points", "Speak more clearly"],
        overallFeedback: "I had trouble evaluating your speech. Please try speaking more clearly and covering the main points of the topic.",
      });
    }
  } catch (error) {
    console.error("Speech rubric evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

