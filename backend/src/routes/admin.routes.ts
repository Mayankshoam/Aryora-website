import { Router } from "express";
import { prisma } from "../prisma/client";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth, requireAdmin);

// ---- Products ----
router.get("/products", async (req, res) => {
  const items = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, items });
});

router.post("/products", async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json({ success: true, product });
});

router.put("/products/:id", async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, product });
});

router.delete("/products/:id", async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: "Product deactivated." });
});

router.post("/products/:id/images", async (req, res) => {
  const { url, altText, position = 0 } = req.body;
  const image = await prisma.productImage.create({
    data: { productId: req.params.id, url, altText, position },
  });
  res.status(201).json({ success: true, image });
});

// ---- Inventory ----
router.patch("/products/:id/stock", async (req, res) => {
  const { stockQuantity } = req.body;
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { stockQuantity },
  });
  res.json({ success: true, product });
});

// ---- Orders ----
router.get("/orders", async (req, res) => {
  const { status } = req.query;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: { items: true, user: { select: { fullName: true, email: true, phone: true } }, address: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, orders });
});

router.patch("/orders/:id/status", async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, trackingNumber },
  });
  res.json({ success: true, order });
});

// ---- Customers ----
router.get("/customers", async (req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true, fullName: true, email: true, phone: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, customers });
});

// ---- Coupons ----
router.get("/coupons", async (req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, coupons });
});

router.post("/coupons", async (req, res) => {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json({ success: true, coupon });
});

router.delete("/coupons/:id", async (req, res) => {
  await prisma.coupon.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});

// ---- Reviews moderation ----
router.get("/reviews", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: { product: { select: { name: true } }, user: { select: { fullName: true } } },
  });
  res.json({ success: true, reviews });
});

router.patch("/reviews/:id/approve", async (req, res) => {
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { isApproved: true } });
  res.json({ success: true, review });
});

// ---- Analytics / sales reports ----
router.get("/analytics/summary", async (req, res) => {
  const [totalOrders, totalRevenue, totalCustomers, lowStock] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { stockQuantity: { lt: 5 }, isActive: true } }),
  ]);

  const topProducts = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  res.json({
    success: true,
    totalOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    totalCustomers,
    lowStockCount: lowStock,
    topProducts,
  });
});

// ---- Leads (Step 6/7 sync visibility) ----
router.get("/leads", async (req, res) => {
  const { status } = req.query;
  const leads = await prisma.lead.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  res.json({ success: true, leads });
});

export default router;
