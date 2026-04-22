import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

type Body = {
  storeName?: string;
  storeSlug?: string;
  ownerEmail?: string;
  ownerPassword?: string;
  ownerFullName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    const {
      storeName,
      storeSlug,
      ownerEmail,
      ownerPassword,
      ownerFullName,
      phone,
      email,
      address,
    } = body;

    if (
      !storeName?.trim() ||
      !storeSlug?.trim() ||
      !ownerEmail?.trim() ||
      !ownerPassword?.trim() ||
      !ownerFullName?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const normalizedSlug = normalizeSlug(storeSlug);

    const { data: existingStore } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (existingStore) {
      return NextResponse.json(
        { error: "A store with this slug already exists." },
        { status: 400 }
      );
    }

    const { data: createdUser, error: userError } =
      await supabase.auth.admin.createUser({
        email: ownerEmail.trim(),
        password: ownerPassword,
        email_confirm: true,
      });

    if (userError || !createdUser.user) {
      return NextResponse.json(
        { error: "Failed to create owner user.", details: userError },
        { status: 500 }
      );
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({
        name: storeName.trim(),
        slug: normalizedSlug,
        phone: phone || null,
        email: email || null,
        address: address || null,
        status: "active",
        primary_color: "#111827",
        secondary_color: "#f59e0b",
      })
      .select()
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Failed to create store.", details: storeError },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: createdUser.user.id,
        full_name: ownerFullName.trim(),
        role: "store_owner",
        store_id: store.id,
      });

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to create profile.", details: profileError },
        { status: 500 }
      );
    }

    const { error: categoryError } = await supabase
      .from("categories")
      .insert({
        store_id: store.id,
        name: "General",
        slug: "general",
      });

    if (categoryError) {
      return NextResponse.json(
        { error: "Failed to create default category.", details: categoryError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store,
      ownerUserId: createdUser.user.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}