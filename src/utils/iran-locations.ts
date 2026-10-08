import provinces from '@/data/iran-locations/provinces.json';
import cities from '@/data/iran-locations/cities.json';

export type LocationKind = 'city' | 'province';
export const OTHER_LOCATION = '__other_location__';

export const normalizeLocationName = (value: string) =>
  value.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\s\u200c]+/g, ' ').trim();

export function locationSelections(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const seen = new Set<string>();
  return values.filter((item): item is string => {
    if (typeof item !== 'string' || !item.trim() || isLocationPlaceholder(item)) return false;
    const normalized = normalizeLocationName(item);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  }).map((item) => item.trim());
}

// Match schema property tokens, not words such as capacity or city IDs.
export function getLocationKind(name: string, label = ''): LocationKind | undefined {
  const leaf = name.split('.').pop() || name;
  const tokens = leaf.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z]+/);
  if (tokens.some((token) => ['id', 'code', 'count'].includes(token))) return;
  if (tokens.some((token) => ['province', 'provience', 'provinces', 'proviences'].includes(token)) || /(^|\s)استان($|\s)/.test(label)) return 'province';
  if (tokens.some((token) => ['city', 'cities'].includes(token)) || /(^|\s)شهر($|\s)/.test(label)) return 'city';
}

export function getLocationFieldConfig(field: {
  name: string; label?: string; type: string;
  optionsSource?: string; multiple?: boolean; dependsOn?: string;
}) {
  const kind = field.optionsSource === 'cities' ? 'city' :
    field.optionsSource === 'provinces' ? 'province' : getLocationKind(field.name, field.label);
  return {
    kind,
    multiple: field.type === 'array' && (field.multiple ?? true),
    // A matching field name alone does not establish a province/city relation.
    provinceFieldName: kind === 'city' ? field.dependsOn : undefined,
  };
}

export const provinceOptions = provinces
  .map(({ name }) => ({ label: name, value: name }))
  .sort((a, b) => a.label.localeCompare(b.label, 'fa'));

export function getCityOptions(province?: string | string[]) {
  const names = (Array.isArray(province) ? province : [province || '']).map(normalizeLocationName);
  const selectedProvinces = provinces.filter(({ name }) => names.includes(normalizeLocationName(name)));
  return Array.from(new Set(cities
    .filter((city) => !selectedProvinces.length || selectedProvinces.some((province) => city.province_id === province.id))
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
    getLocationKind(field.name, field.label) === 'province' &&
    field.name.slice(0, field.name.lastIndexOf('.') + 1) === parent
  );
  const counterpart = name.replace(/city|cities/ig, 'province').toLowerCase();
  return candidates.find((field) => field.name.replace(/provience/ig, 'province').toLowerCase() === counterpart)?.name
    ?? (candidates.length === 1 ? candidates[0].name : undefined);
}
