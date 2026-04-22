import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

type PatchBody = {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  imageUrl?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body: PatchBody = await req.json();

    const {
      name,
      slug,
      description,
      price,
      stockQuantity,
      isActive,
      imageUrl,
    } = body;

    if (!name || !slug || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Name, slug, and price are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        slug: normalizeSlug(slug),
        description: description || null,
        image_url: imageUrl || null,
        price,
        stock_quantity: stockQuantity ?? 0,
        is_active: isActive ?? true,
      })
      .eq("id", productId)
      .select()
      .single();

    if (error || !updatedProduct) {
      return NextResponse.json(
        { error: "Failed to update product.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete product.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}