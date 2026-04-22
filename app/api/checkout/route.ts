import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      storeSlug,
      customerName,
      customerPhone,
      customerEmail,
      items,
    }: {
      storeSlug: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      items: CheckoutItem[];
    } = body;

    if (!storeSlug || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required checkout data." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, slug")
      .eq("slug", storeSlug)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 }
      );
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: store.id,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order.", details: orderError },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json(
        { error: "Order created but failed to save items.", details: itemsError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}