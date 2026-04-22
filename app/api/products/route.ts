import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      slug,
      description,
      price,
      stockQuantity,
      isActive,
      imageUrl,
    }: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      stockQuantity?: number;
      isActive?: boolean;
      imageUrl?: string;
    } = body;

    if (!name || !slug || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Name, slug, and price are required." },
        { status: 400 }
      );
    }

    const userSupabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await userSupabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.store_id) {
      return NextResponse.json(
        { error: "No store is linked to this account." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("store_id", profile.store_id)
      .eq("slug", "general")
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Default category not found." },
        { status: 404 }
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        store_id: profile.store_id,
        category_id: category.id,
        name: name.trim(),
        slug: normalizeSlug(slug),
        description: description || null,
        image_url: imageUrl || null,
        price,
        stock_quantity: stockQuantity ?? 0,
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Failed to create product.", details: productError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}