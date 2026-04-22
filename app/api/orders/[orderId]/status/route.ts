import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";

const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;
type OrderStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { status }: { status?: string } = body;

    if (!status || !allowedStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error || !updatedOrder) {
      return NextResponse.json(
        { error: "Failed to update order status.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}
