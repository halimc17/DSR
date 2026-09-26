'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  createSession,
  getSessionUser,
  destroySession,
  SessionUser,
} from '@/lib/auth';

export async function loginUser(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  user?: SessionUser;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return { success: false, error: 'Email atau kata sandi tidak sesuai.' };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator proyek.',
      };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Email atau kata sandi tidak sesuai.' };
    }

    // Automatically upgrade legacy plain text hash to secure scrypt hash if needed
    if (!user.passwordHash.includes(':')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password) },
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    await createSession(sessionUser);

    revalidatePath('/');
    revalidatePath('/dsr');
    revalidatePath('/users');

    return { success: true, user: sessionUser };
  } catch (err: any) {
    console.error('Login error:', err);
    return { success: false, error: 'Terjadi kesalahan sistem saat proses login.' };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  await destroySession();
  revalidatePath('/');
  revalidatePath('/dsr');
  revalidatePath('/users');
  return { success: true };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return await getSessionUser();
}
