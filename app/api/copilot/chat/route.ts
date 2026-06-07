import { NextRequest, NextResponse } from "next/server";
import { CopilotService } from "../../../../services/copilot.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'message' field in request body." },
        { status: 400 }
      );
    }

    const result = await CopilotService.chat({ message: message.trim() });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/copilot/chat failed:", error);
    return NextResponse.json(
      {
        error: "Copilot chat processing failed.",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
