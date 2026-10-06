import provinces from '@/data/iran-locations/provinces.json';
import cities from '@/data/iran-locations/cities.json';

export type LocationKind = 'city' | 'province';
export const OTHER_LOCATION = '__other_location__';

export const normalizeLocationName = (value: string) =>
  value.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\s\u200c]+/g, ' ').trim();

// Match schema property tokens, not words such as capacity or city IDs.
export function getLocationKind(name: string, label = ''): LocationKind | undefined {
  const leaf = name.split('.').pop() || name;
  const tokens = leaf.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z]+/);
  if (tokens.some((token) => ['id', 'code', 'count'].includes(token))) return;
  if (tokens.some((token) => ['province', 'provience', 'provinces', 'proviences'].includes(token)) || /(^|\s)استان($|\s)/.test(label)) return 'province';
  if (tokens.some((token) => ['city', 'cities'].includes(token)) || /(^|\s)شهر($|\s)/.test(label)) return 'city';
}

export const provinceOptions = provinces
  .map(({ name }) => ({ label: name, value: name }))
  .sort((a, b) => a.label.localeCompare(b.label, 'fa'));

export function getCityOptions(province?: string) {
  const selectedProvince = provinces.find(({ name }) =>
    normalizeLocationName(name) === normalizeLocationName(province || '')
  );
  return Array.from(new Set(cities
    .filter((city) => !selectedProvince || city.province_id === selectedProvince.id)
    .map(({ name }) => name)))
    .sort((a, b) => a.localeCompare(b, 'fa'))
    .map((name) => ({ label: name, value: name }));
}

export function isLocationPlaceholder(value: unknown) {
  return typeof value === 'string' &&
    [OTHER_LOCATION, 'سایر'].includes(normalizeLocationName(value));
}

export function cleanLocationValue(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && !isLocationPlaceholder(trimmed) ? trimmed : undefined;
}

export function validateLocationValue(value: unknown, custom = false): true | string {
  if (isLocationPlaceholder(value)) return 'نام شهر یا استان را وارد کنید';
  if (custom && (typeof value !== 'string' || !value.trim())) return 'نام شهر یا استان را وارد کنید';
  return true;
}

export function findProvinceField(name: string, fields: { name: string; label?: string; type: string }[]) {
  const parent = name.slice(0, name.lastIndexOf('.') + 1);
  const candidates = fields.filter((field) =>
    field.type !== 'array' &&
    getLocationKind(field.name, field.label) === 'province' &&
    field.name.slice(0, field.name.lastIndexOf('.') + 1) === parent
  );
  const counterpart = name.replace(/city|cities/ig, 'province').toLowerCase();
  return candidates.find((field) => field.name.replace(/provience/ig, 'province').toLowerCase() === counterpart)?.name
    ?? (candidates.length === 1 ? candidates[0].name : undefined);
}
