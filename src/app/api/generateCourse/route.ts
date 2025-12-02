import { NextRequest, NextResponse } from "next/server";
import { generateCourseContent } from "@/lib/gemini";

interface FileInput {
  name: string;
  type: string;
  base64: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, text, files } = body as {
      title: string;
      text: string;
      files?: FileInput[];
    };

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const hasText = text && text.length >= 10;
    const hasFiles = files && files.length > 0;

    if (!hasText && !hasFiles) {
      return NextResponse.json(
        { error: "Either text (min 10 characters) or files are required" },
        { status: 400 }
      );
    }

    const course = await generateCourseContent(title, text || "", files || []);

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error generating course:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate course" },
      { status: 500 }
    );
  }
}
