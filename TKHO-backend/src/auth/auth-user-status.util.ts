import { ForbiddenException } from '@nestjs/common';

export function normalizeAuthUserStatus(
  status: string | null | undefined,
): string {
  return String(status ?? '')
    .trim()
    .toLowerCase();
}

export function isActiveAuthUserStatus(status: string | null | undefined): boolean {
  return normalizeAuthUserStatus(status) === 'active';
}

export function assertUserCanAuthenticate(status: string | null | undefined): void {
  const normalized = normalizeAuthUserStatus(status);
  if (normalized === 'active') return;

  if (normalized === 'inactive') {
    throw new ForbiddenException(
      'Your account is inactive. Please contact the administrator.',
    );
  }

  if (normalized === 'expired') {
    throw new ForbiddenException(
      'Your account has expired. Please contact the administrator.',
    );
  }

  throw new ForbiddenException('Account is not active. Please contact the administrator.');
}
