"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    role: (formData.get("role") as string) || "CUSTOMER",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "بيانات غير صالحة",
    };
  }

  const { name, email, phone, password, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return { success: false, error: "البريد الإلكتروني مستخدم بالفعل" };
    }

    if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      });
      if (phoneExists) {
        return { success: false, error: "رقم الهاتف مستخدم بالفعل" };
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        role: role as Role,
      },
    });

    // If vendor, create vendor profile
    if (role === "VENDOR") {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: name,
          status: "PENDING",
        },
      });
    }

    return { success: true, userId: user.id };
  } catch (err) {
    console.error("Register error:", err);
    return { success: false, error: "حدث خطأ أثناء إنشاء الحساب" };
  }
}
