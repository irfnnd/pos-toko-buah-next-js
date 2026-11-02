"use server";

import { hashPassword, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createUserSchema, updateUserSchema } from "@/lib/validations/users";
import { revalidatePath } from "next/cache";

export async function getUsersAction(params?: {
  search?: string;
  role?: "ADMIN" | "KASIR";
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
  all?: boolean;
}) {
  await requireAdmin();

  const search = params?.search?.trim();
  const role = params?.role;
  const status = params?.status;
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 10);
  const fetchAll = params?.all ?? false;

  const whereClause = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { username: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };

  try {
    const [totalCount, users] = await Promise.all([
      db.user.count({ where: whereClause }),
      db.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        ...(fetchAll ? {} : { skip: (page - 1) * limit, take: limit }),
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      error: undefined as string | undefined,
    };
  } catch (error) {
    console.error("Get users error:", error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit,
        totalCount: 0,
        totalPages: 1,
      },
      error: "Gagal mengambil data pengguna",
    };
  }
}

export async function createUserAction(formData: unknown) {
  await requireAdmin();

  const parseResult = createUserSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Input pengguna tidak valid",
    };
  }

  const { name, username, password, role, status } = parseResult.data;
  const normalizedUsername = username.toLowerCase().trim();

  try {
    const existing = await db.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existing) {
      return { success: false, error: "Username sudah digunakan" };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        username: normalizedUsername,
        password: hashedPassword,
        role,
        status,
      },
    });

    revalidatePath("/users");
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Gagal membuat pengguna baru" };
  }
}

export async function updateUserAction(formData: unknown) {
  await requireAdmin();

  const parseResult = updateUserSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Input pengguna tidak valid",
    };
  }

  const { id, name, username, password, role, status } = parseResult.data;
  const normalizedUsername = username.toLowerCase().trim();

  try {
    const existing = await db.user.findFirst({
      where: {
        username: normalizedUsername,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: "Username sudah digunakan oleh user lain" };
    }

    const updateData: {
      name: string;
      username: string;
      role: "ADMIN" | "KASIR";
      status: "ACTIVE" | "INACTIVE";
      password?: string;
    } = {
      name: name.trim(),
      username: normalizedUsername,
      role,
      status,
    };

    if (password && password.trim().length > 0) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/users");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Gagal memperbarui data pengguna" };
  }
}

export async function toggleUserStatusAction(userId: string) {
  await requireAdmin();

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });

    revalidatePath("/users");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { success: false, error: "Gagal mengubah status pengguna" };
  }
}

export async function deleteUserAction(userId: string) {
  const currentAdmin = await requireAdmin();

  if (currentAdmin.id === userId) {
    return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri" };
  }

  try {
    await db.user.delete({
      where: { id: userId },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Gagal menghapus pengguna" };
  }
}
