import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../../lib/supabase/admin";

type Body = {
  status?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body: Body = await req.json();

    if (
      !body.status ||
      !["pending", "confirmed", "completed", "cancelled"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid order status value." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (existingOrderError) {
      return NextResponse.json(
        {
          error: "Failed to load order before update.",
          details: existingOrderError,
        },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: body.status,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json(
        {
          error: "Failed to update order status.",
          details: updateError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
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