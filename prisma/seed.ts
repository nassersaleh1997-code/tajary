import { PrismaClient, Role, StoreStatus, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing (for dev)
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.subOrder.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeCategory.deleteMany();
  await prisma.store.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@tajary.com",
      name: "مدير المنصة",
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Customer
  const customer = await prisma.user.create({
    data: {
      email: "customer@tajary.com",
      name: "أحمد محمد",
      phone: "01012345678",
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  // Vendor 1
  const vendorUser1 = await prisma.user.create({
    data: {
      email: "vendor1@tajary.com",
      name: "متجر الإلكترونيات",
      phone: "01098765432",
      passwordHash,
      role: Role.VENDOR,
    },
  });

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      businessName: "تك ستور",
      description: "أفضل متجر إلكترونيات في المنصة",
      status: StoreStatus.ACTIVE,
      isVerified: true,
      commissionRate: 10,
      rating: 4.7,
      reviewCount: 128,
    },
  });

  const store1 = await prisma.store.create({
    data: {
      vendorId: vendor1.id,
      slug: "tech-store",
      name: "تك ستور",
      description: "متجر متخصص في الإلكترونيات والأجهزة الذكية",
      status: StoreStatus.ACTIVE,
      isOpen: true,
      city: "القاهرة",
      phone: "01098765432",
      rating: 4.7,
      reviewCount: 128,
      minOrderAmount: 0,
    },
  });

  // Vendor 2
  const vendorUser2 = await prisma.user.create({
    data: {
      email: "vendor2@tajary.com",
      name: "أزياء النخبة",
      passwordHash,
      role: Role.VENDOR,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      businessName: "أزياء النخبة",
      status: StoreStatus.ACTIVE,
      isVerified: true,
      commissionRate: 12,
      rating: 4.5,
      reviewCount: 89,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      vendorId: vendor2.id,
      slug: "elite-fashion",
      name: "أزياء النخبة",
      description: "أحدث صيحات الموضة",
      status: StoreStatus.ACTIVE,
      isOpen: true,
      city: "الإسكندرية",
      rating: 4.5,
      reviewCount: 89,
    },
  });

  // Categories
  const catElectronics = await prisma.category.create({
    data: {
      nameAr: "إلكترونيات",
      nameEn: "Electronics",
      slug: "electronics",
      sortOrder: 1,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      nameAr: "أزياء",
      nameEn: "Fashion",
      slug: "fashion",
      sortOrder: 2,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      nameAr: "منزل ومطبخ",
      nameEn: "Home",
      slug: "home",
      sortOrder: 3,
    },
  });

  // Attributes
  const attrColor = await prisma.attribute.create({
    data: {
      nameAr: "اللون",
      nameEn: "Color",
      type: "color",
      isVariant: true,
      options: JSON.stringify(["أسود", "أبيض", "أزرق", "أحمر", "رمادي"]),
    },
  });

  const attrSize = await prisma.attribute.create({
    data: {
      nameAr: "المقاس",
      nameEn: "Size",
      type: "select",
      isVariant: true,
      options: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    },
  });

  const attrStorage = await prisma.attribute.create({
    data: {
      nameAr: "السعة",
      nameEn: "Storage",
      type: "select",
      isVariant: true,
      options: JSON.stringify(["64GB", "128GB", "256GB", "512GB"]),
    },
  });

  await prisma.categoryAttribute.createMany({
    data: [
      { categoryId: catElectronics.id, attributeId: attrColor.id },
      { categoryId: catElectronics.id, attributeId: attrStorage.id },
      { categoryId: catFashion.id, attributeId: attrColor.id },
      { categoryId: catFashion.id, attributeId: attrSize.id },
    ],
  });

  // Products
  const products = [
    {
      storeId: store1.id,
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      nameAr: "سماعات لاسلكية برو",
      slug: "wireless-headphones-pro",
      shortDescAr: "سماعات بلوتوث عالية الجودة مع عزل ضوضاء",
      basePrice: 899,
      compareAtPrice: 1299,
      stockQuantity: 50,
      status: ProductStatus.ACTIVE,
      rating: 4.6,
      reviewCount: 42,
      soldCount: 156,
      brand: "SoundMax",
      sku: "SM-WH-001",
    },
    {
      storeId: store1.id,
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      nameAr: "ساعة ذكية رياضية",
      slug: "smart-watch-sport",
      shortDescAr: "ساعة ذكية مع تتبع اللياقة ومقاومة للماء",
      basePrice: 1499,
      compareAtPrice: 1999,
      stockQuantity: 30,
      status: ProductStatus.ACTIVE,
      rating: 4.8,
      reviewCount: 67,
      soldCount: 203,
      brand: "FitTech",
      sku: "FT-SW-002",
    },
    {
      storeId: store1.id,
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      nameAr: "شاحن لاسلكي سريع",
      slug: "wireless-charger-fast",
      basePrice: 249,
      compareAtPrice: 349,
      stockQuantity: 100,
      status: ProductStatus.ACTIVE,
      rating: 4.3,
      reviewCount: 28,
      soldCount: 89,
      brand: "PowerUp",
      sku: "PU-WC-003",
    },
    {
      storeId: store2.id,
      vendorId: vendor2.id,
      categoryId: catFashion.id,
      nameAr: "تيشيرت قطن فاخر",
      slug: "premium-cotton-tshirt",
      shortDescAr: "تيشيرت قطن 100% مريح وأنيق",
      basePrice: 199,
      compareAtPrice: 299,
      stockQuantity: 200,
      status: ProductStatus.ACTIVE,
      rating: 4.5,
      reviewCount: 55,
      soldCount: 312,
      brand: "EliteWear",
      sku: "EW-TS-001",
    },
    {
      storeId: store2.id,
      vendorId: vendor2.id,
      categoryId: catFashion.id,
      nameAr: "جينز كلاسيك",
      slug: "classic-jeans",
      shortDescAr: "بنطلون جينز بقصة عصرية",
      basePrice: 449,
      compareAtPrice: 599,
      stockQuantity: 80,
      status: ProductStatus.ACTIVE,
      rating: 4.4,
      reviewCount: 33,
      soldCount: 145,
      brand: "EliteWear",
      sku: "EW-JN-002",
    },
    {
      storeId: store2.id,
      vendorId: vendor2.id,
      categoryId: catFashion.id,
      nameAr: "حذاء رياضي خفيف",
      slug: "light-sport-shoes",
      basePrice: 699,
      compareAtPrice: 899,
      stockQuantity: 45,
      status: ProductStatus.ACTIVE,
      rating: 4.7,
      reviewCount: 91,
      soldCount: 278,
      brand: "RunFast",
      sku: "RF-SH-003",
    },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        ...p,
        images: {
          create: [
            {
              url: `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(p.nameAr.slice(0, 10))}`,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Product: ${product.nameAr}`);
  }

  // Coupon
  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 200,
      maxDiscount: 100,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  // Settings
  await prisma.setting.createMany({
    data: [
      { key: "platform_name", value: "تجاري", group: "general" },
      { key: "default_commission", value: "10", group: "finance" },
      { key: "currency", value: "EGP", group: "general" },
      { key: "default_shipping_fee", value: "30", group: "shipping" },
    ],
  });

  // Banner
  await prisma.banner.create({
    data: {
      title: "عروض الصيف",
      image: "https://placehold.co/1200x400/3b82f6/ffffff?text=Summer+Sale",
      link: "/ar/offers",
      position: "home",
      isActive: true,
    },
  });

  console.log("✅ Seed completed!");
  console.log("\n📧 Test accounts:");
  console.log("  Admin:    admin@tajary.com / password123");
  console.log("  Customer: customer@tajary.com / password123");
  console.log("  Vendor1:  vendor1@tajary.com / password123");
  console.log("  Vendor2:  vendor2@tajary.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
