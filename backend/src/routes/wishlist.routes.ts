import { Router } from "express";
import { prisma } from "../prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: { include: { images: true } } },
  });
  res.json({ success: true, items });
});

router.post("/:productId", async (req, res) => {
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user!.userId, productId: req.params.productId } },
    update: {},
    create: { userId: req.user!.userId, productId: req.params.productId },
  });
  res.status(201).json({ success: true, item });
});

router.delete("/:productId", async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user!.userId, productId: req.params.productId },
  });
  res.json({ success: true });
});

export default router;
