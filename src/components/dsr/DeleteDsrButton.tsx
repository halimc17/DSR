'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteDsr } from '@/app/actions/dsr';

interface DeleteDsrButtonProps {
  id: string;
  reportTitle?: string;
  variant?: 'icon' | 'button';
  redirectTo?: string;
  className?: string;
}

export function DeleteDsrButton({
  id,
  reportTitle = 'laporan DSR ini',
  variant = 'button',
  redirectTo,
  className = '',
}: DeleteDsrButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus ${reportTitle}?\n\nSemua data progres fisik, tenaga kerja, alat, material, dan foto terkait laporan ini akan dihapus secara permanen.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteDsr(id);
      if (res.success) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      console.error('Failed to delete DSR:', err);
      alert('Gagal menghapus laporan DSR. Silakan coba lagi.');
      setIsDeleting(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Hapus Laporan DSR"
        className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 ${className}`}
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-colors disabled:opacity-50 ${className}`}
    >
      {isDeleting ? (
        <>
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-rose-600" />
          Menghapus...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-1.5" />
          Hapus DSR
        </>
      )}
    </button>
  );
}
