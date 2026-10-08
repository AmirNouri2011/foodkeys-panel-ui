// Run with: node scripts/check-iran-locations.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
// Node does not load CSS modules; rendering checks only need their class names.
require.extensions['.css'] = (module) => { module.exports = {}; };
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
const { formatFormDataForApi, convertSchemaToFields, resolveFieldRequirements, objectArrayDefaults } = load(path.join(root, 'src/utils/schema-converter.ts'));
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
assert(locations.getCityOptions(['تهران', 'فارس']).some((city) => city.value === 'شیراز'));
assert(locations.getCityOptions(['تهران', 'فارس']).some((city) => city.value === 'تهران'));
assert(!locations.getCityOptions(['تهران', 'فارس']).some((city) => city.value === 'اصفهان'));
assert.equal(locations.findProvinceField('cities', [{ name: 'proviences', type: 'array' }]), 'proviences');
assert.deepEqual(locations.locationSelections(['تهران', ' تهران ', 'سایر', '', 'شيراز', 'شیراز']), ['تهران', 'شيراز']);
// Minimal synthetic input to test the converter, independent of service schemas.
const locationTestSchema = { properties: {
  proviences: { type: 'array', items: { type: 'string' }, multiple: true, optionsSource: 'provinces' },
  cities: { type: 'array', items: { type: 'string' }, multiple: true, optionsSource: 'cities', dependsOn: null },
} };
const cityField = convertSchemaToFields(locationTestSchema).find((field) => field.name === 'cities');
assert.equal(cityField.optionsSource, 'cities');
assert.equal(cityField.multiple, true);
assert.equal(cityField.dependsOn, undefined);
const independentConfig = locations.getLocationFieldConfig(cityField);
assert.equal(independentConfig.kind, 'city');
assert.equal(independentConfig.multiple, true);
assert.equal(independentConfig.provinceFieldName, undefined);
// Selecting a province must not narrow an independent city's suggestions.
const selectedFormValues = { proviences: ['تهران'] };
const independentCities = locations.getCityOptions(selectedFormValues[independentConfig.provinceFieldName]);
assert(independentCities.some((city) => city.value === 'شیراز'));
assert(independentCities.some((city) => city.value === 'اصفهان'));
const dependentField = convertSchemaToFields({ properties: {
  cityIds: { type: 'array', items: { type: 'string' }, multiple: true, optionsSource: 'cities', dependsOn: 'proviences' },
} })[0];
const dependentConfig = locations.getLocationFieldConfig(dependentField);
assert.equal(dependentConfig.kind, 'city');
assert.equal(dependentConfig.provinceFieldName, 'proviences');
assert(!locations.getCityOptions(selectedFormValues[dependentConfig.provinceFieldName]).some((city) => city.value === 'شیراز'));
assert.equal(locations.getLocationFieldConfig({ name: 'cities', type: 'array', multiple: false }).multiple, false);
const nestedFields = convertSchemaToFields({ properties: { office: { type: 'object', properties: {
  city: { type: 'string', optionsSource: 'cities', dependsOn: 'province' },
  province: { type: 'string', optionsSource: 'provinces' },
} } } });
assert.equal(nestedFields[0].fields[0].dependsOn, 'office.province');
assert.equal(locations.getLocationFieldConfig({ name: 'city', type: 'text' }).provinceFieldName, undefined);
assert.deepEqual(formatFormDataForApi({ proviences: ['تهران', 'تهران'], cities: 'شیراز' }, locationTestSchema), { proviences: ['تهران'], cities: ['شیراز'] });
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
const MultiField = load(path.join(root, 'src/components/ui/schema-location-multi-field.tsx')).default;
function MultiForm({ value }) {
  const { control } = useForm({ defaultValues: { cities: value } });
  return React.createElement(MultiField, { name: 'cities', kind: 'city', control, label: 'شهرها' });
}
const multiHtml = renderToString(React.createElement(MultiForm, { value: ['شیراز', 'تهران'] }));
assert(multiHtml.includes('حذف شیراز'));
assert(multiHtml.includes('حذف تهران'));
assert(multiHtml.includes('جست‌وجو و انتخاب چند شهر'));
assert(renderToString(React.createElement(MultiForm, { value: 'شیراز' })).includes('حذف شیراز'));
// Synthetic backend schema: repeated contacts must keep independent nested values.
const contactSchema = { properties: { contact: { type: 'array', minItems: 1, maxItems: 3, items: {
  type: 'object', required: ['name', 'number'], properties: {
    name: { type: 'string', title: 'نام پاسخگو' },
    number: { type: 'string', title: 'شماره تماس' },
    office: { type: 'object', properties: { city: { type: 'string' }, count: { type: 'number' } } },
    socials: { type: 'array', items: { type: 'string' } },
  },
} } } };
const contactField = convertSchemaToFields(contactSchema)[0];
assert.equal(contactField.itemType, 'object');
assert.equal(contactField.itemFields.length, 4);
const contactData = { contact: [
  { name: 'اول', number: '09123456789', office: { city: ' شیراز ', count: '2' } },
  { name: 'دوم', number: '09123456788', office: { city: 'تهران', count: '3' } },
] };
const contactResolved = resolveFieldRequirements([contactField], contactData)[0];
assert.equal(contactResolved.fields[0].name, 'contact.0.name');
assert.equal(contactResolved.fields[0].required, true);
assert.equal(contactResolved.fields[4].name, 'contact.1.name');
assert.equal(contactResolved.fields[2].fields[0].name, 'contact.0.office.city');
const emptyContact = objectArrayDefaults(contactField.itemFields);
assert.deepEqual(emptyContact, { name: '', number: '', office: { city: '', count: '' }, socials: [] });
assert.deepEqual(formatFormDataForApi(contactData, contactSchema).contact[0].office, { city: 'شیراز', count: 2 });
assert.equal(formatFormDataForApi(contactData, contactSchema).contact[1].name, 'دوم');
const { FormProvider, useController } = require('react-hook-form');
const ObjectArrayField = load(path.join(root, 'src/components/ui/schema-object-array-field.tsx')).default;
function ContactInput({ schemaField }) {
  const { field } = useController({ name: schemaField.name });
  return React.createElement('input', { name: field.name, defaultValue: typeof field.value === 'string' ? field.value : '' });
}
function ContactForm() {
  const methods = useForm({ defaultValues: contactData });
  return React.createElement(FormProvider, methods,
    React.createElement(ObjectArrayField, { field: contactField, control: methods.control,
      renderField: (schemaField) => React.createElement(ContactInput, { schemaField }) }));
}
const contactsHtml = renderToString(React.createElement(ContactForm));
assert(contactsHtml.includes('name="contact.0.name"'));
assert(contactsHtml.includes('name="contact.1.number"'));
assert(contactsHtml.includes('value="اول"'));
assert(contactsHtml.includes('value="دوم"'));
assert(!contactsHtml.includes('[object Object]'));
console.log('Object array checks passed: nested contacts, defaults, required children, API payload, and editable repeated fields.');
console.log('Iran location checks passed: dataset, field detection, filtering, custom validation, payload, and form rendering.');
