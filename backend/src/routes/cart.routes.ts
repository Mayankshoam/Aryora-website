import { Router } from "express";
import { prisma } from "../prisma/client";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { captureLead } from "../services/leadService";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: { include: { images: true } } },
  });
  res.json({ success: true, items });
});

router.post("/", async (req, res) => {
  const { productId, quantity = 1, metalType, ringSize } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw new AppError("Product not available.", 404);

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId_metalType_ringSize: {
        userId: req.user!.userId,
        productId,
        metalType: metalType ?? null,
        ringSize: ringSize ?? null,
      },
    },
    update: { quantity: { increment: quantity } },
    create: { userId: req.user!.userId, productId, quantity, metalType, ringSize },
  });

  // Step 6: capture a CART lead so merchandising/marketing can follow up on abandoned carts.
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  await captureLead({
    userId: user?.id,
    fullName: user?.fullName,
    mobileNumber: user?.phone ?? undefined,
    emailId: user?.email,
    productName: product.name,
    productCode: product.productCode,
    quantity: item.quantity,
    cartValue: Number(product.price) * item.quantity,
    leadSource: "CART",
  });

  res.status(201).json({ success: true, item });
});

router.patch("/:id", async (req, res) => {
  const { quantity } = req.body;
  const item = await prisma.cartItem.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { quantity },
  });
  if (item.count === 0) throw new AppError("Cart item not found.", 404);
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { id: req.params.id, userId: req.user!.userId } });
  res.json({ success: true });
});

export default router;
