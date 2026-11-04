import { NextResponse } from "next/server";
import { verifyAdminToken, extractAdminToken } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  getServerCustomerById,
  updateServerCustomer,
} from "@/lib/serverCustomerStore";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);
    const customerId = params.id;

    // Rate limit
    const rateCheck = checkRateLimit(`admin-cust-update:${ip}`, {
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many update requests. Please wait." },
        { status: 429 }
      );
    }

    // Role check
    const token = extractAdminToken(req);
    const auth = verifyAdminToken(token);
    if (!auth.authorized || !auth.admin) {
      return NextResponse.json(
        { error: auth.error || "Admin authorization required." },
        { status: 403 }
      );
    }

    const currentCustomer = getServerCustomerById(customerId);
    if (!currentCustomer) {
      return NextResponse.json(
        { error: `Customer with ID ${customerId} not found.` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, email, address, city, state, pincode } = body;

    // CRITICAL ENFORCEMENT: ADMIN CANNOT EDIT A LOCKED CUSTOMER NAME
    if (
      currentCustomer.nameLocked &&
      name &&
      name.trim().toUpperCase() !== currentCustomer.name.trim().toUpperCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Admin cannot edit a locked customer official legal name. Official PAN name is permanent and immutable.",
        },
        { status: 400 }
      );
    }

    const updated = updateServerCustomer(
      customerId,
      {
        email: email !== undefined ? email : currentCustomer.email,
        address: address !== undefined ? address : currentCustomer.address,
        city: city !== undefined ? city : currentCustomer.city,
        state: state !== undefined ? state : currentCustomer.state,
        pincode: pincode !== undefined ? pincode : currentCustomer.pincode,
        // Only update name if not locked
        name: currentCustomer.nameLocked ? currentCustomer.name : (name || currentCustomer.name),
      },
      auth.admin.username
    );

    return NextResponse.json({
      success: true,
      customer: updated,
      message: "Customer profile updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update customer." },
      { status: 500 }
    );
  }
}
