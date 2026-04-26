import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../../lib/supabase/admin";

type Body = {
  role?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body: Body = await req.json();

    if (!body.role || !["super_admin", "store_owner"].includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role value." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id, role, store_id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileError) {
      return NextResponse.json(
        {
          error: "Failed to load user profile before update.",
          details: existingProfileError,
        },
        { status: 500 }
      );
    }

    if (!existingProfile) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    if (body.role === "store_owner" && !existingProfile.store_id) {
      return NextResponse.json(
        {
          error: "Cannot assign role store_owner to a user without an assigned store. Assign a store first.",
        },
        { status: 400 }
      );
    }

    const updatePayload =
      body.role === "super_admin"
        ? {
            role: body.role,
            store_id: null,
          }
        : {
            role: body.role,
          };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      return NextResponse.json(
        {
          error: "Failed to update user role.",
          details: updateError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
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