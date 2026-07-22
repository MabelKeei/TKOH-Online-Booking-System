export type VenueTeaServiceOption = 'none' | '1' | '2' | '3' | '4';

export type VenueTeaServicePayload = {
  option: VenueTeaServiceOption;
  attendees: number;
  ratioFrom?: number;
  ratioTo?: number;
  teaPots?: number;
  waterPots?: number;
  specialRequest?: string;
  /** @deprecated legacy */
  beverages?: string;
  /** @deprecated legacy */
  serveAs?: string;
  /** @deprecated legacy */
  quantity?: number;
  /** @deprecated legacy */
  notes?: string;
};

export function normalizeVenueTeaService(raw: unknown): VenueTeaServicePayload | null {
  if (!raw) return null;
  let obj: Record<string, unknown> | null = null;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    obj = raw as Record<string, unknown>;
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        obj = parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  if (!obj) return null;
  return obj as VenueTeaServicePayload;
}

export function buildVenueTeaServiceJson(input: {
  teaServiceRequired: boolean;
  attendees: number;
  option?: string;
  ratioFrom?: number;
  ratioTo?: number;
  teaPots?: number;
  waterPots?: number;
  specialRequest?: string;
  /** legacy */
  teaOrWater?: string;
  serviceType?: string;
  teaServiceSpecialRequest?: string;
}): VenueTeaServicePayload {
  const attendees = Number.isFinite(input.attendees) && input.attendees >= 1 ? input.attendees : 1;
  if (!input.teaServiceRequired) {
    return { option: 'none', attendees };
  }

  const option = String(input.option || '').trim() as VenueTeaServiceOption;
  if (option === '2') {
    return {
      option: '2',
      attendees,
      ratioFrom: Number(input.ratioFrom),
      ratioTo: Number(input.ratioTo),
    };
  }
  if (option === '3') {
    return {
      option: '3',
      attendees,
      teaPots: Number(input.teaPots),
      waterPots: Number(input.waterPots),
    };
  }
  if (option === '4') {
    const specialRequest = String(input.specialRequest ?? input.teaServiceSpecialRequest ?? '').trim();
    return { option: '4', attendees, specialRequest };
  }
  if (option === '1') {
    return { option: '1', attendees };
  }

  // Legacy fallback when option is missing
  return {
    option: '1',
    attendees,
    beverages: input.teaOrWater ?? 'tea',
    serveAs: input.serviceType ?? 'pot',
    quantity: attendees,
    notes: input.teaServiceSpecialRequest ?? '',
  };
}

export function formatVenueTeaServiceDisplay(
  teaService: VenueTeaServicePayload | null | undefined,
  fallbackAttendees?: number | null,
): string {
  if (!teaService) return '-';

  const attendees = teaService.attendees ?? fallbackAttendees ?? '';
  let option = String(teaService.option || '').trim();

  if (!option) {
    const beverages = String(teaService.beverages || '').trim();
    const notes = String(teaService.specialRequest || teaService.notes || '').trim();
    if (beverages.includes('不用茶')) option = 'none';
    else if (notes && !beverages) option = '4';
    else if (beverages.includes('壺茶') || beverages.includes('壺水')) option = '3';
    else if (beverages.includes('對')) option = '2';
    else if (beverages.includes('每位茶')) option = '1';
    else option = '1';
  }

  if (option === 'none') {
    return `不用茶 / ${attendees}`;
  }
  if (option === '1') {
    return `每位茶 / ${attendees}`;
  }
  if (option === '2') {
    const from = teaService.ratioFrom ?? '?';
    const to = teaService.ratioTo ?? '?';
    return `每位茶 / ${from} 對 ${to}`;
  }
  if (option === '3') {
    const teaPots = teaService.teaPots ?? '?';
    const waterPots = teaService.waterPots ?? '?';
    return `${teaPots} 壺茶 / ${waterPots} 壺水 + 杯`;
  }
  if (option === '4') {
    const text = String(teaService.specialRequest || teaService.notes || '').trim();
    return text || '-';
  }

  return '-';
}
