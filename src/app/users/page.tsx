import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { getUsers } from '@/app/actions/user';
import { UserManagementClient } from '@/components/users/UserManagementClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Pengguna — Daily Site Report',
  description: 'Kelola pengguna dan hak akses personil proyek RS Umum Pertamina Prabumulih',
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  // If not logged in, redirect to login
  if (!currentUser) {
    redirect('/login?redirect=/users');
  }

  // Only ADMIN and PM are allowed to view users
  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PM') {
    redirect('/');
  }

  const { users = [] } = await getUsers();

  return <UserManagementClient users={users as any} currentUser={currentUser} />;
}
