// Run with: node scripts/check-iran-locations.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const localRequire = Module.createRequire(file);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)((name) => {
    if (!name.startsWith('@/') && !name.startsWith('.')) return localRequire(name);
    const target = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
    if (target.endsWith('.json')) return localRequire(target);
    if (!fs.existsSync(`${target}.ts`) && !fs.existsSync(`${target}.tsx`)) return localRequire(name);
    return load(fs.existsSync(`${target}.ts`) ? `${target}.ts` : `${target}.tsx`);
  }, module, module.exports);
  return module.exports;
}
const locations = load(path.join(root, 'src/utils/iran-locations.ts'));
const { formatFormDataForApi } = load(path.join(root, 'src/utils/schema-converter.ts'));
const provinces = require('../src/data/iran-locations/provinces.json');
const cities = require('../src/data/iran-locations/cities.json');
assert.equal(provinces.length, 31);
assert.equal(cities.length, 1481);
assert(cities.every((city) => provinces.some((province) => province.id === city.province_id)));
for (const name of ['province', 'provience', 'officeProvince', 'factory_provience']) {
  assert.equal(locations.getLocationKind(name), 'province');
}
for (const name of ['city', 'officeCity', 'office.city', 'cities']) {
  assert.equal(locations.getLocationKind(name), 'city');
}
for (const name of ['capacity', 'cityId', 'provinceCode', 'electricity']) {
  assert.equal(locations.getLocationKind(name), undefined);
}
assert.equal(locations.getLocationKind('addressTown', 'شهر'), 'city');
assert.equal(locations.validateLocationValue('سایر'), 'نام شهر یا استان را وارد کنید');
assert.equal(locations.validateLocationValue(locations.OTHER_LOCATION), 'نام شهر یا استان را وارد کنید');
assert.equal(locations.validateLocationValue('  ', true), 'نام شهر یا استان را وارد کنید');
assert.equal(locations.validateLocationValue('شهر جدید', true), true);
assert.equal(locations.cleanLocationValue('  شهر جدید  '), 'شهر جدید');
assert.equal(locations.cleanLocationValue('سایر'), undefined);
assert.equal(locations.cleanLocationValue(locations.OTHER_LOCATION), undefined);
assert.equal(locations.cleanLocationValue('  '), undefined);
const { companyFormSchema } = load(path.join(root, 'src/app/shared/info/food-industry/company/create/form-utils.ts'));
const companyFields = companyFormSchema.innerType().shape;
for (const name of ['factoryCity', 'factoryState', 'officeCity', 'officeState']) {
  assert.equal(companyFields[name].safeParse('سایر').success, false);
  assert.equal(companyFields[name].safeParse(locations.OTHER_LOCATION).success, false);
  assert.equal(companyFields[name].parse('  نام دلخواه  '), 'نام دلخواه');
}
assert.equal(companyFields.factoryCity.safeParse('').success, false);
assert.equal(companyFields.officeCity.safeParse(undefined).success, true);
assert(locations.getCityOptions('تهران').some((city) => city.value === 'تهران'));
assert(!locations.getCityOptions('تهران').some((city) => city.value === 'شیراز'));
assert.equal(locations.getCityOptions('استان جدید').length, locations.getCityOptions().length);
assert.equal(locations.findProvinceField('office.city', [
  { name: 'office.provience', type: 'text' }, { name: 'factory.province', type: 'text' },
]), 'office.provience');
const schema = { properties: {
  city: { type: 'string' }, provience: { type: 'string' },
  office: { type: 'object', properties: { city: { type: 'string' }, province: { type: 'string' } } },
  cities: { type: 'array', items: { type: 'string' } },
  capacity: { type: 'string' },
} };
assert.deepEqual(formatFormDataForApi({
  city: '  شهر جدید  ', provience: 'سایر', office: { city: locations.OTHER_LOCATION, province: 'تهران' },
  cities: ['شیراز', 'سایر', locations.OTHER_LOCATION, '', ' شهر جدید '], capacity: 'سایر',
}, schema), { city: 'شهر جدید', office: { province: 'تهران' }, cities: ['شیراز', 'شهر جدید'], capacity: 'سایر' });
// Render real RHF + Headless UI fields to check edit and empty form states.
const React = require('react');
const { renderToString } = require('react-dom/server');
const { useForm } = require('react-hook-form');
const Field = load(path.join(root, 'src/components/ui/schema-location-field.tsx')).default;
function Form({ value }) {
  const { control } = useForm({ defaultValues: { city: value } });
  return React.createElement(Field, { name: 'city', kind: 'city', control, label: 'شهر' });
}
assert(renderToString(React.createElement(Form, { value: 'شهر تازه' })).includes('شهر تازه'));
assert(renderToString(React.createElement(Form, { value: 'شهر تازه' })).includes('نام را وارد کنید'));
assert(!renderToString(React.createElement(Form, { value: 'تهران' })).includes('نام را وارد کنید'));
assert(!renderToString(React.createElement(Form, { value: '' })).includes('نام را وارد کنید'));
console.log('Iran location checks passed: dataset, field detection, filtering, custom validation, payload, and form rendering.');
