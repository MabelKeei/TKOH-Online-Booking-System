export function isAdminRole(
  auth: { role?: string; system?: string } | null | undefined,
): boolean {
  if (!auth) return false;
  if (auth.system === 'admin') return true;
  return String(auth.role || '').toLowerCase().includes('admin');
}
