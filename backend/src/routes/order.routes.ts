import { Router } from "express";
import { prisma } from "../prisma/client";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { generateOrderNumber } from "../utils/auth";
import { captureLead } from "../services/leadService";
import { sendOrderConfirmationEmail } from "../services/emailService";

const router = Router();
router.use(requireAuth);

// Step: checkout started (lead capture before payment, so we still have a
// record even if the customer abandons at the payment step).
router.post("/checkout-start", async (req, res) => {
  const { addressId, couponCode } = req.body;
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: true },
  });
  if (cartItems.length === 0) throw new AppError("Your bag is empty.", 400);

  const subtotal = cartItems.reduce((sum: number, i: any) => sum + Number(i.product.price) * i.quantity, 0);
  let discount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date())) {
      throw new AppError("This coupon is invalid or has expired.", 400);
    }
    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      throw new AppError(`Minimum order value for this coupon is ₹${coupon.minOrderValue}.`, 400);
    }
    discount = coupon.discountPercent
      ? (subtotal * coupon.discountPercent) / 100
      : Number(coupon.discountFlat ?? 0);
  }

  const shippingFee = subtotal > 5000 ? 0 : 199;
  const total = subtotal - discount + shippingFee;

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  const address = addressId ? await prisma.address.findUnique({ where: { id: addressId } }) : null;

  await captureLead({
    userId: user?.id,
    fullName: user?.fullName,
    mobileNumber: user?.phone ?? undefined,
    emailId: user?.email,
    cartValue: total,
    address: address ? `${address.line1} ${address.line2 ?? ""}`.trim() : undefined,
    city: address?.city,
    state: address?.state,
    pinCode: address?.pinCode,
    leadSource: "CHECKOUT",
  });

  res.json({ success: true, subtotal, discount, shippingFee, total, couponId: coupon?.id ?? null });
});

router.post("/", async (req, res) => {
  const { addressId, couponId, paymentMethod, paymentRef, customerNotes } = req.body;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: true },
  });
  if (cartItems.length === 0) throw new AppError("Your bag is empty.", 400);

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== req.user!.userId) throw new AppError("Invalid delivery address.", 400);

  const subtotal = cartItems.reduce((sum: number, i: any) => sum + Number(i.product.price) * i.quantity, 0);
  let discount = 0;
  let coupon = null;
  if (couponId) {
    coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (coupon) {
      discount = coupon.discountPercent
        ? (subtotal * coupon.discountPercent) / 100
        : Number(coupon.discountFlat ?? 0);
    }
  }
  const shippingFee = subtotal > 5000 ? 0 : 199;
  const total = subtotal - discount + shippingFee;

  const order = await prisma.$transaction(async (tx: any) => {
    // Stock check + decrement — keeps inventory management (Step 4) accurate.
    for (const item of cartItems) {
      if (item.product.stockQuantity < item.quantity) {
        throw new AppError(`${item.product.name} is out of stock.`, 409);
      }
    }
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user!.userId,
        addressId,
        subtotal,
        discount,
        shippingFee,
        total,
        couponId: coupon?.id,
        paymentMethod,
        paymentRef,
        paymentStatus: paymentRef ? "PAID" : "PENDING",
        status: "CONFIRMED",
        customerNotes,
        items: {
          create: cartItems.map((i: any) => ({
            productId: i.productId,
            productName: i.product.name,
            productCode: i.product.productCode,
            quantity: i.quantity,
            unitPrice: i.product.price,
            metalType: i.metalType,
            ringSize: i.ringSize,
          })),
        },
      },
      include: { items: true },
    });

    if (coupon) {
      await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }
    await tx.cartItem.deleteMany({ where: { userId: req.user!.userId } });

    return newOrder;
  });

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  await sendOrderConfirmationEmail(user!.email, order.orderNumber, `₹${total.toLocaleString("en-IN")}`);

  await captureLead({
    userId: user?.id,
    fullName: user?.fullName,
    mobileNumber: user?.phone ?? undefined,
    emailId: user?.email,
    productName: order.items.map((i: any) => i.productName).join(", "),
    productCode: order.items.map((i: any) => i.productCode).join(", "),
    quantity: order.items.reduce((s: number, i: any) => s + i.quantity, 0),
    cartValue: total,
    orderId: order.orderNumber,
    address: `${address.line1} ${address.line2 ?? ""}`.trim(),
    city: address.city,
    state: address.state,
    pinCode: address.pinCode,
    leadSource: "ORDER",
  });

  res.status(201).json({ success: true, order });
});

router.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: true, address: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, orders });
});

router.get("/:orderNumber", async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { orderNumber: req.params.orderNumber, userId: req.user!.userId },
    include: { items: true, address: true },
  });
  if (!order) throw new AppError("Order not found.", 404);
  res.json({ success: true, order });
});

export default router;
