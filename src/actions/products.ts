"use server";

import { getCurrentUser, isVendor } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function getVendorOrThrow() {
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) {
    throw new Error("غير مصرح");
  }
  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
    include: { store: true },
  });
  if (!vendor || !vendor.store) {
    throw new Error("لم يتم العثور على المتجر");
  }
  return { user, vendor, store: vendor.store };
}

export async function createProduct(formData: FormData) {
  try {
    const { vendor, store } = await getVendorOrThrow();

    const raw = {
      nameAr: formData.get("nameAr") as string,
      nameEn: (formData.get("nameEn") as string) || undefined,
      shortDescAr: (formData.get("shortDescAr") as string) || undefined,
      descriptionAr: (formData.get("descriptionAr") as string) || undefined,
      basePrice: Number(formData.get("basePrice")),
      compareAtPrice: formData.get("compareAtPrice")
        ? Number(formData.get("compareAtPrice"))
        : null,
      stockQuantity: Number(formData.get("stockQuantity") || 0),
      categoryId: (formData.get("categoryId") as string) || null,
      brand: (formData.get("brand") as string) || undefined,
      sku: (formData.get("sku") as string) || undefined,
      barcode: (formData.get("barcode") as string) || undefined,
      status: (formData.get("status") as string) || "DRAFT",
      lowStockThreshold: Number(formData.get("lowStockThreshold") || 5),
      allowBackorder: formData.get("allowBackorder") === "on",
      weight: formData.get("weight") ? Number(formData.get("weight")) : null,
      imageUrl: (formData.get("imageUrl") as string) || undefined,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "بيانات غير صالحة",
      };
    }

    const data = parsed.data;
    let slug = slugify(data.nameAr);

    // Ensure unique slug within store
    const existing = await prisma.product.findFirst({
      where: { storeId: store.id, slug },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        vendorId: vendor.id,
        categoryId: data.categoryId || null,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        slug,
        shortDescAr: data.shortDescAr,
        descriptionAr: data.descriptionAr,
        brand: data.brand,
        sku: data.sku,
        barcode: data.barcode,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        allowBackorder: data.allowBackorder,
        weight: data.weight,
        status: data.status as any,
        images: raw.imageUrl
          ? {
              create: {
                url: raw.imageUrl,
                isPrimary: true,
                sortOrder: 0,
              },
            }
          : undefined,
      },
    });

    // Inventory log for initial stock
    if (data.stockQuantity > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          quantity: data.stockQuantity,
          type: "restock",
          reason: "إضافة منتج جديد",
          userId: vendor.userId,
        },
      });
    }

    revalidatePath("/ar/vendor/products");
    revalidatePath("/ar/vendor");
    revalidatePath(`/ar/store/${store.slug}`);
    revalidatePath("/ar/search");

    return { success: true, productId: product.id, slug: product.slug };
  } catch (err: any) {
    console.error("Create product error:", err);
    return { success: false, error: err.message || "حدث خطأ أثناء إضافة المنتج" };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const { vendor, store } = await getVendorOrThrow();

    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId: vendor.id },
    });
    if (!product) {
      return { success: false, error: "المنتج غير موجود" };
    }

    const raw = {
      nameAr: formData.get("nameAr") as string,
      nameEn: (formData.get("nameEn") as string) || undefined,
      shortDescAr: (formData.get("shortDescAr") as string) || undefined,
      descriptionAr: (formData.get("descriptionAr") as string) || undefined,
      basePrice: Number(formData.get("basePrice")),
      compareAtPrice: formData.get("compareAtPrice")
        ? Number(formData.get("compareAtPrice"))
        : null,
      stockQuantity: Number(formData.get("stockQuantity") || 0),
      categoryId: (formData.get("categoryId") as string) || null,
      brand: (formData.get("brand") as string) || undefined,
      sku: (formData.get("sku") as string) || undefined,
      barcode: (formData.get("barcode") as string) || undefined,
      status: (formData.get("status") as string) || "DRAFT",
      lowStockThreshold: Number(formData.get("lowStockThreshold") || 5),
      allowBackorder: formData.get("allowBackorder") === "on",
      weight: formData.get("weight") ? Number(formData.get("weight")) : null,
      imageUrl: (formData.get("imageUrl") as string) || undefined,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "بيانات غير صالحة",
      };
    }

    const data = parsed.data;
    const oldStock = product.stockQuantity;

    await prisma.product.update({
      where: { id: productId },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        shortDescAr: data.shortDescAr,
        descriptionAr: data.descriptionAr,
        brand: data.brand,
        sku: data.sku,
        barcode: data.barcode,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        allowBackorder: data.allowBackorder,
        weight: data.weight,
        status: data.status as any,
        categoryId: data.categoryId || null,
      },
    });

    // Update primary image if provided
    if (raw.imageUrl) {
      const primary = await prisma.productImage.findFirst({
        where: { productId, isPrimary: true },
      });
      if (primary) {
        await prisma.productImage.update({
          where: { id: primary.id },
          data: { url: raw.imageUrl },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId,
            url: raw.imageUrl,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      }
    }

    // Inventory log if stock changed
    const stockDiff = data.stockQuantity - oldStock;
    if (stockDiff !== 0) {
      await prisma.inventoryLog.create({
        data: {
          productId,
          quantity: stockDiff,
          type: stockDiff > 0 ? "restock" : "adjustment",
          reason: "تعديل المخزون من لوحة التاجر",
          userId: vendor.userId,
        },
      });
    }

    revalidatePath("/ar/vendor/products");
    revalidatePath("/ar/vendor");
    revalidatePath(`/ar/product/${product.slug}`);
    revalidatePath(`/ar/store/${store.slug}`);
    revalidatePath("/ar/search");

    return { success: true };
  } catch (err: any) {
    console.error("Update product error:", err);
    return { success: false, error: err.message || "حدث خطأ أثناء التعديل" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { vendor, store } = await getVendorOrThrow();

    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId: vendor.id },
    });
    if (!product) {
      return { success: false, error: "المنتج غير موجود" };
    }

    // Soft delete by archiving
    await prisma.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/ar/vendor/products");
    revalidatePath("/ar/vendor");
    revalidatePath(`/ar/store/${store.slug}`);
    revalidatePath("/ar/search");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ" };
  }
}
