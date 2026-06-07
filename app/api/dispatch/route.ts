import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { incidentId, resourceId } = await req.json();

    if (!incidentId || !resourceId) {
      return NextResponse.json(
        { error: "Missing parameters: incidentId, resourceId" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 1. Assign resource to incident and set status to dispatched
    const { error: incError } = await supabase
      .from("incidents")
      .update({
        assigned_resource: resourceId,
        status: "dispatched"
      })
      .eq("id", incidentId);

    if (incError) {
      return NextResponse.json({ error: incError.message }, { status: 500 });
    }

    // 2. Set resource status to busy and availability to false
    const { error: resError } = await supabase
      .from("resources")
      .update({
        status: "busy",
        availability: false
      })
      .eq("id", resourceId);

    if (resError) {
      return NextResponse.json({ error: resError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Resource ${resourceId} dispatched to incident ${incidentId}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
