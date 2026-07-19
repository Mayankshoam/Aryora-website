import { Router } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/products?category=rings&metal=CHAMPAGNE_GOLD&minPrice=&maxPrice=&search=&sort=price_asc&page=1
router.get("/", async (req, res) => {
  const { category, metal, minPrice, maxPrice, search, sort, page = "1", limit = "12" } = req.query;

  const where: any = { isActive: true };
  if (category) where.category = { slug: category };
  if (metal) where.metalType = metal;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } },
      { productCode: { contains: String(search), mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const take = Math.min(Number(limit), 48);
  const skip = (Number(page) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } }, category: true },
      orderBy,
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, items, total, page: Number(page), pageSize: take });
});

router.get("/featured", async (req, res) => {
  const items = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { images: true },
    take: 8,
  });
  res.json({ success: true, items });
});

router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      reviews: { where: { isApproved: true }, include: { user: { select: { fullName: true } } } },
    },
  });
  if (!product) throw new AppError("Product not found.", 404);

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: { images: true },
    take: 4,
  });

  res.json({ success: true, product, related });
});

router.post("/:slug/reviews", requireAuth, async (req, res) => {
  const { rating, title, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) throw new AppError("Rating must be between 1 and 5.", 422);

  const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
  if (!product) throw new AppError("Product not found.", 404);

  const review = await prisma.review.create({
    data: { productId: product.id, userId: req.user!.userId, rating, title, comment },
  });

  res.status(201).json({ success: true, review, message: "Thanks — your review will appear once approved." });
});

export default router;
