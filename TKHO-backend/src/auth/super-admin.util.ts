export function isSuperAdminRole(role: string | null | undefined): boolean {
  return String(role || '').trim().toLowerCase() === 'superadmin';
}

export function isSuperAdminAuth(auth: { isSuperAdmin?: boolean; role?: string } | null | undefined): boolean {
  if (auth?.isSuperAdmin === true) return true;
  return isSuperAdminRole(auth?.role);
}

