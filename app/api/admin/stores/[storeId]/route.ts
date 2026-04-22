import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";

type PatchBody = {
  name?: string;
  slug?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body: PatchBody = await req.json();

    const {
      name,
      slug,
      logoUrl,
      bannerUrl,
      primaryColor,
      secondaryColor,
      phone,
      email,
      address,
      status,
    } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: "Store name and slug are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: updatedStore, error } = await supabase
      .from("stores")
      .update({
        name: name.trim(),
        slug: normalizeSlug(slug),
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        primary_color: primaryColor || "#111827",
        secondary_color: secondaryColor || "#f59e0b",
        phone: phone || null,
        email: email || null,
        address: address || null,
        status: status || "active",
      })
      .eq("id", storeId)
      .select()
      .single();

    if (error || !updatedStore) {
      return NextResponse.json(
        { error: "Failed to update store.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}