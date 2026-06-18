export const SystemSettingKey = {
  userInactiveAfterMonths: 'user_inactive_after_months',
  hkPublicHolidaysUrl: 'hk_public_holidays_url',
} as const;

export type SystemSettingKeyName =
  (typeof SystemSettingKey)[keyof typeof SystemSettingKey];

export const SYSTEM_SETTING_DEFAULTS: Record<SystemSettingKeyName, string> = {
  [SystemSettingKey.userInactiveAfterMonths]: '6',
  [SystemSettingKey.hkPublicHolidaysUrl]:
    'https://www.1823.gov.hk/common/ical/en.json',
};

export const SYSTEM_SETTING_DESCRIPTIONS: Record<SystemSettingKeyName, string> =
  {
    [SystemSettingKey.userInactiveAfterMonths]:
      'Months without login before user status becomes Inactive',
    [SystemSettingKey.hkPublicHolidaysUrl]:
      'Hong Kong public holidays reference URL',
  };
