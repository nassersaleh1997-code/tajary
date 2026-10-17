import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string().optional(),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  nameAr: z.string().min(2, "اسم المنتج مطلوب"),
  nameEn: z.string().optional(),
  shortDescAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  basePrice: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  compareAtPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  categoryId: z.string().optional().nullable(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
  lowStockThreshold: z.number().int().min(0).default(5),
  allowBackorder: z.boolean().default(false),
  weight: z.number().optional().nullable(),
});

export const addressSchema = z.object({
  label: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  district: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const storeSchema = z.object({
  name: z.string().min(2, "اسم المتجر مطلوب"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  minOrderAmount: z.number().min(0).default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type StoreInput = z.infer<typeof storeSchema>;
