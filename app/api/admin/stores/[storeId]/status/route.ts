import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../../lib/supabase/admin";

type Body = {
  status?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body: Body = await req.json();

    if (!body.status || !["active", "inactive", "archived"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existingStore, error: existingStoreError } = await supabase
      .from("stores")
      .select("id, name, status")
      .eq("id", storeId)
      .maybeSingle();

    if (existingStoreError) {
      return NextResponse.json(
        {
          error: "Failed to load store before update.",
          details: existingStoreError,
        },
        { status: 500 }
      );
    }

    if (!existingStore) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 }
      );
    }

    const { data: updatedStore, error: updateError } = await supabase
      .from("stores")
      .update({
        status: body.status,
      })
      .eq("id", storeId)
      .select()
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        {
          error: "Failed to update store status.",
          details: updateError,
        },
        { status: 500 }
      );
    }

    if (!updatedStore) {
      return NextResponse.json(
        {
          error: "Store status update returned no row.",
          storeId,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected server error.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}