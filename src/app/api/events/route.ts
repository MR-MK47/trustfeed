import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    // Allows CORS for cross-directory injection testing
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    };

    const colRef = collection(db, "published_events");
    const q = query(colRef, orderBy("timestamp", "desc"), limit(20));
    const snapshot = await getDocs(q);

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure firebase timestamps are converted to serializable formats
      timestamp: doc.data().timestamp?.toDate()?.toISOString() || null
    }));

    return NextResponse.json({ events }, { status: 200, headers });
  } catch (error: any) {
    console.error("Error fetching published events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
