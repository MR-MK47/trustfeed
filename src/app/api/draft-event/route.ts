import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { posts } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "Missing or invalid posts array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Aggregate tags and descriptions to feed Gemini
    const aggregatedTags = posts.flatMap((p: any) => p.aiTags || []).join(", ");
    const aggregatedDescriptions = posts.map((p: any) => p.description || "").join("\n");

    const prompt = `You are a professional PR writer for an NGO. You have been given the following media metadata from recent field volunteer uploads.
    
Tags identified in the images: ${aggregatedTags}
Volunteer descriptions: ${aggregatedDescriptions}

Your task evaluates this content and crafts a highly engaging summary for the NGO's public website gallery.
Requirements:
1. Provide a title consisting of EXACTLY 5 words.
2. Provide a description consisting of EXACTLY 2 sentences summarizing the impact.
3. Return the payload EXACTLY as a raw JSON object string with the keys "title" and "description". Do not include markdown blocks or any other wrapping text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON block in case Gemini wraps it
    const match = responseText.match(/\{[\s\S]*\}/);
    let payload;

    if (match) {
      payload = JSON.parse(match[0]);
    } else {
      payload = JSON.parse(responseText);
    }

    return NextResponse.json({
      title: payload.title || "Impact Event Created in Field",
      description: payload.description || "Volunteers have uploaded a new collection of media assets from recent operations. Stay tuned for deeper stories from the field."
    });

  } catch (error: any) {
    console.error("Gemini API Error in draft-event:", error);
    return NextResponse.json({ error: error.message || "Failed to process magic publish." }, { status: 500 });
  }
}
