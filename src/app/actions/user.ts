'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { hashPassword, getSessionUser } from '@/lib/auth';

export interface UserFormData {
  nama: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'PM' | 'FIELD';
  telepon?: string;
  isActive?: boolean;
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { nama: 'asc' }],
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
        telepon: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            laporanDibuat: true,
            laporanDisetujui: true,
          },
        },
      },
    });
    return { success: true, users };
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return { success: false, error: 'Gagal mengambil data pengguna.' };
  }
}

export async function createUser(data: UserFormData) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang dapat menambah pengguna baru.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: false, error: `Email ${cleanEmail} sudah terdaftar.` };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Kata sandi minimal 6 karakter.' };
    }

    const newUser = await prisma.user.create({
      data: {
        nama: data.nama.trim(),
        email: cleanEmail,
        passwordHash: hashPassword(data.password),
        role: data.role,
        telepon: data.telepon?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    revalidatePath('/users');
    return { success: true, user: newUser };
  } catch (err: any) {
    console.error('Error creating user:', err);
    return { success: false, error: 'Terjadi kesalahan saat menambahkan pengguna.' };
  }
}

export async function updateUser(id: string, data: Omit<UserFormData, 'password'>) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang dapat mengubah data pengguna.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        id: { not: id },
      },
    });

    if (existing) {
      return { success: false, error: `Email ${cleanEmail} sudah digunakan oleh pengguna lain.` };
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        nama: data.nama.trim(),
        email: cleanEmail,
        role: data.role,
        telepon: data.telepon?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    revalidatePath('/users');
    return { success: true, user: updated };
  } catch (err: any) {
    console.error('Error updating user:', err);
    return { success: false, error: 'Gagal memperbarui data pengguna.' };
  }
}

export async function resetUserPassword(id: string, newPassword: string) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang dapat me-reset kata sandi.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
    }

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashPassword(newPassword),
      },
    });

    revalidatePath('/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return { success: false, error: 'Gagal me-reset kata sandi.' };
  }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang dapat mengubah status akun.' };
    }

    if (currentUser.id === id && !isActive) {
      return { success: false, error: 'Anda tidak dapat menonaktifkan akun sendiri.' };
    }

    await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath('/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error toggling status:', err);
    return { success: false, error: 'Gagal mengubah status pengguna.' };
  }
}

export async function deleteUser(id: string) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang dapat menghapus pengguna.' };
    }

    if (currentUser.id === id) {
      return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            laporanDibuat: true,
            laporanDisetujui: true,
          },
        },
      },
    });

    if (!targetUser) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    const reportCount = targetUser._count.laporanDibuat + targetUser._count.laporanDisetujui;
    if (reportCount > 0) {
      return {
        success: false,
        error: `Pengguna tidak dapat dihapus karena tercatat dalam ${reportCount} riwayat laporan DSR. Sebagai gantinya, silakan nonaktifkan akun ini.`,
      };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return { success: false, error: 'Gagal menghapus pengguna.' };
  }
}
