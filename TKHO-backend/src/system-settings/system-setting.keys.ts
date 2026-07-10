export const SystemSettingKey = {
  userInactiveAfterMonths: 'user_inactive_after_months',
  hkPublicHolidaysUrl: 'hk_public_holidays_url',
  evDateUpdateTime: 'EV_date_update_time',
  evWeeklyBookingLimit: 'EV_weekly_booking_limit',
} as const;

export type SystemSettingKeyName =
  (typeof SystemSettingKey)[keyof typeof SystemSettingKey];

export const SYSTEM_SETTING_DEFAULTS: Record<SystemSettingKeyName, string> = {
  [SystemSettingKey.userInactiveAfterMonths]: '6',
  [SystemSettingKey.hkPublicHolidaysUrl]:
    'https://www.1823.gov.hk/common/ical/en.json',
  [SystemSettingKey.evDateUpdateTime]: '13:00',
  [SystemSettingKey.evWeeklyBookingLimit]: '1',
};

export const SYSTEM_SETTING_DESCRIPTIONS: Record<SystemSettingKeyName, string> =
  {
    [SystemSettingKey.userInactiveAfterMonths]:
      'Months without login before user status becomes Inactive',
    [SystemSettingKey.hkPublicHolidaysUrl]:
      'Hong Kong public holidays reference URL',
    [SystemSettingKey.evDateUpdateTime]:
      'Daily time (HH:mm, Hong Kong) when EV booking calendar rolls forward to release the next day quota',
    [SystemSettingKey.evWeeklyBookingLimit]:
      'Maximum active EV bookings per user per week (Monday to Sunday) for non-admin users',
  };
