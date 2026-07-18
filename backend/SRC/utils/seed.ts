import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./auth";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword("Aryora@Admin123");
  await prisma.user.upsert({
    where: { email: "admin@aryora.com" },
    update: {},
    create: {
      fullName: "Aryora Admin",
      email: "admin@aryora.com",
      phone: "9999999999",
      passwordHash: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const categories = [
    { name: "Rings", slug: "rings" },
    { name: "Earrings", slug: "earrings" },
    { name: "Necklaces", slug: "necklaces" },
    { name: "Pendants", slug: "pendants" },
    { name: "Bridal", slug: "bridal" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });

  await prisma.product.upsert({
    where: { slug: "the-emerald-cut-solitaire" },
    update: {},
    create: {
      name: "The Emerald Cut Solitaire",
      slug: "the-emerald-cut-solitaire",
      productCode: "ARY-RG-0001",
      sku: "SKU-RG-0001",
      description:
        "A masterpiece of clarity and structure, handcrafted in our signature 18K champagne gold with a lab-grown emerald-cut centre stone.",
      shortDescription: "18K champagne gold, lab-grown emerald-cut diamond.",
      price: 1245000,
      metalType: "CHAMPAGNE_GOLD",
      categoryId: rings.id,
      stockQuantity: 6,
      isFeatured: true,
      gramWeight: 4.2,
      diamondCarat: 2.0,
      certification: "IGI Certified",
      images: {
        create: [{ url: "/images/products/emerald-solitaire-1.jpg", position: 0, altText: "Emerald cut solitaire ring" }],
      },
    },
  });

  console.log("Seed complete. Admin login: admin@aryora.com / Aryora@Admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
