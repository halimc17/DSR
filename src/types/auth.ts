export interface SessionUser {
  id: string;
  nama: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'FIELD' | string;
}
