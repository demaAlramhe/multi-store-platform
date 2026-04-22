import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const { storeSlug } = await params;
    const supabase = createAdminClient();

    const { data: store, error } = await supabase
      .from("stores")
      .select("name, logo_url, primary_color, secondary_color")
      .eq("slug", storeSlug)
      .single();

    if (error || !store) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}
