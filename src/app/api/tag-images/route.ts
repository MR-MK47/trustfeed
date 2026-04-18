import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the flash model as requested in the architecture stack
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Fetch the image to send to Gemini
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) {
      return NextResponse.json({ error: "Failed to fetch image from URL." }, { status: 400 });
    }
    const arrayBuffer = await imageResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const prompt = `Based on the provided image, return a JSON array of 3 to 5 descriptive tags (e.g. ["education", "children", "outdoors"]). 
    Return ONLY a valid JSON array, without markdown formatting or any other text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    // Parse the output to ensure we retrieve only the JSON array
    const match = responseText.match(/\[[\s\S]*\]/);
    let tags: string[] = [];
    if (match) {
      tags = JSON.parse(match[0]);
    } else {
      tags = JSON.parse(responseText);
    }

    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image tagging." }, { status: 500 });
  }
}
