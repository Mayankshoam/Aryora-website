import { Router } from "express";
import { prisma } from "../prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user!.userId } });
  res.json({ success: true, addresses });
});

router.post("/", async (req, res) => {
  const address = await prisma.address.create({ data: { ...req.body, userId: req.user!.userId } });
  res.status(201).json({ success: true, address });
});

router.put("/:id", async (req, res) => {
  await prisma.address.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: req.body,
  });
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user!.userId } });
  res.json({ success: true });
});

export default router;
