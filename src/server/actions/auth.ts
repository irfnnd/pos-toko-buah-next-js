"use server";

import { comparePassword, createSession, deleteSession, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function loginAction(_prevState: unknown, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ username, password });
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Input tidak valid",
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!user || user.status !== "ACTIVE") {
      return { error: "Username atau password salah" };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { error: "Username atau password salah" };
    }

    await createSession({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan server saat login" };
  }

  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return await getSession();
}

