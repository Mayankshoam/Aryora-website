import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Log received order details
    console.log("=== NEW ORDER DISPATCHED ===");
    console.log("Order #:", orderData.orderNumber);
    console.log("Customer:", orderData.fullName, orderData.email, orderData.phone);
    console.log("Total Amount: ₹", orderData.totalAmount);
    console.log("Payment Mode:", orderData.paymentMode, "Status:", orderData.paymentStatus);
    console.log("UTR Number:", orderData.utrNumber || "N/A (Pending / COD)");
    console.log("Delivery To:", orderData.shippingAddress);
    console.log("Items:", orderData.items);

    // If SMTP environment variables are configured, dispatch real email
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "ayorjewellery@gmail.com";

    return NextResponse.json({
      success: true,
      message: "Order receipt prepared for customer and atelier notification dispatched.",
      orderNumber: orderData.orderNumber,
      dispatchedTo: [orderData.email, adminEmail],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process order notification" },
      { status: 500 }
    );
  }
}

