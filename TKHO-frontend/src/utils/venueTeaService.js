/**
 * @param {Record<string, unknown> | null | undefined} teaService
 * @param {number | null | undefined} [fallbackAttendees]
 */
export function formatTeaServiceDisplay (teaService, fallbackAttendees) {
  if (!teaService) return '-'

  const attendees = teaService.attendees ?? fallbackAttendees ?? ''
  let option = String(teaService.option || '').trim()

  if (!option) {
    const beverages = String(teaService.beverages || '').trim()
    const notes = String(teaService.specialRequest || teaService.notes || '').trim()
    if (beverages.includes('不用茶')) option = 'none'
    else if (notes && !beverages) option = '4'
    else if (beverages.includes('壺茶') || beverages.includes('壺水')) option = '3'
    else if (beverages.includes('對')) option = '2'
    else if (beverages.includes('每位茶')) option = '1'
    else option = '1'
  }

  if (option === 'none') return `不用茶 / ${attendees}`
  if (option === '1') return `每位茶 / ${attendees}`
  if (option === '2') {
    const from = teaService.ratioFrom ?? '?'
    const to = teaService.ratioTo ?? '?'
    return `每位茶 / ${from} 對 ${to}`
  }
  if (option === '3') {
    const teaPots = teaService.teaPots ?? '?'
    const waterPots = teaService.waterPots ?? '?'
    return `${teaPots} 壺茶 / ${waterPots} 壺水 + 杯`
  }
  if (option === '4') {
    const text = String(teaService.specialRequest || teaService.notes || '').trim()
    return text || '-'
  }

  return '-'
}

/**
 * @param {Record<string, unknown>} form
 */
export function buildTeaServiceApiPayload (form) {
  const attendees = Number(form.attendeeCount ?? form.teaServiceParticipants)
  const safeAttendees = Number.isFinite(attendees) && attendees >= 1 ? attendees : 1
  const teaServiceRequired = Boolean(form.teaServiceRequired)

  if (!teaServiceRequired) {
    return {
      teaServiceRequired: false,
      attendeeCount: safeAttendees
    }
  }

  const option = String(form.teaServiceOption || '1')
  const payload = {
    teaServiceRequired: true,
    teaServiceOption: option,
    attendeeCount: safeAttendees
  }

  if (option === '2') {
    payload.teaServiceRatioFrom = Number(form.teaServiceRatioFrom)
    payload.teaServiceRatioTo = Number(form.teaServiceRatioTo)
  } else if (option === '3') {
    payload.teaServiceTeaPots = Number(form.teaServiceTeaPots)
    payload.teaServiceWaterPots = Number(form.teaServiceWaterPots)
  } else if (option === '4') {
    payload.teaServiceSpecialRequest = String(form.teaServiceSpecialRequest || '').trim()
  }

  return payload
}

/**
 * @param {Record<string, unknown>} form
 */
export function validateTeaServiceForm (form) {
  if (!form.teaServiceRequired) return { ok: true }

  const option = String(form.teaServiceOption || '').trim()
  if (!option) {
    return { ok: false, message: 'Please select a tea service option' }
  }

  if (option === '2') {
    const from = Number(form.teaServiceRatioFrom)
    const to = Number(form.teaServiceRatioTo)
    if (!Number.isFinite(from) || from < 1 || !Number.isFinite(to) || to < 1) {
      return { ok: false, message: 'Please enter valid values for Option 2 (X 對 X)' }
    }
  }

  if (option === '3') {
    const teaPots = Number(form.teaServiceTeaPots)
    const waterPots = Number(form.teaServiceWaterPots)
    if (!Number.isFinite(teaPots) || teaPots < 0 || !Number.isFinite(waterPots) || waterPots < 0) {
      return { ok: false, message: 'Please enter valid pot counts for Option 3' }
    }
    if (teaPots === 0 && waterPots === 0) {
      return { ok: false, message: 'Please enter at least one pot count for Option 3' }
    }
  }

  if (option === '4') {
    const text = String(form.teaServiceSpecialRequest || '').trim()
    if (!text) {
      return { ok: false, message: 'Please enter special requests in Chinese for Option 4' }
    }
  }

  return { ok: true }
}

/**
 * @param {Record<string, unknown> | null | undefined} teaService
 */
export function parseTeaServiceToForm (teaService) {
  if (!teaService) {
    return {
      teaServiceOption: '1',
      teaServiceRatioFrom: null,
      teaServiceRatioTo: null,
      teaServiceTeaPots: null,
      teaServiceWaterPots: null,
      teaServiceSpecialRequest: ''
    }
  }

  let option = String(teaService.option || '').trim()
  if (!option) {
    const beverages = String(teaService.beverages || '').trim()
    const notes = String(teaService.specialRequest || teaService.notes || '').trim()
    if (beverages.includes('不用茶')) option = 'none'
    else if (notes && !beverages) option = '4'
    else if (beverages.includes('壺茶') || beverages.includes('壺水')) option = '3'
    else if (beverages.includes('對')) option = '2'
    else option = '1'
  }

  return {
    teaServiceOption: option === 'none' ? '1' : option,
    teaServiceRatioFrom: teaService.ratioFrom ?? null,
    teaServiceRatioTo: teaService.ratioTo ?? null,
    teaServiceTeaPots: teaService.teaPots ?? null,
    teaServiceWaterPots: teaService.waterPots ?? null,
    teaServiceSpecialRequest: String(teaService.specialRequest || teaService.notes || '').trim()
  }
}

/**
 * @param {Record<string, unknown> | null | undefined} venue
 */
export function venueOffersTeaService (venue) {
  if (venue == null) return true
  return venue.teaServiceAvailable !== false
}
