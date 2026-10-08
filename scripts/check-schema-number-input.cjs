const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)((name) => {
    const target = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
    if (target.endsWith('.json')) return require(target);
    return load(`${target}.ts`);
  }, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const { convertSchemaToFields, formatFormDataForApi } = load(path.join(root, 'src/utils/schema-converter.ts'));
const { editNumericDigits, validateNumericText, hasNumericLengthConstraint } = load(path.join(root, 'src/utils/schema-number-input.ts'));
const schema = { type: 'object', properties: { manufactureYear: {
  title: 'سال ساخت', type: 'number', minLength: 4, maxLength: 4, pattern: '^[0-9]{4}$',
} } };
const [year] = convertSchemaToFields(schema);
assert.equal(year.minLength, 4);
assert.equal(year.maxLength, 4);
assert.equal(year.pattern, '^[0-9]{4}$');
assert.equal(hasNumericLengthConstraint(year), true);
assert.equal(editNumericDigits('13599', '1359', year.maxLength), '1359');
assert.equal(editNumericDigits('123456789', '', year.maxLength), '1234');
assert.equal(editNumericDigits('۱۳۵۹', '', 4), '1359');
assert.equal(editNumericDigits('١٣٥٩', '', 4), '1359');
for (const invalid of ['1e3', '-123', '1.25', 'abcd']) {
  assert.equal(editNumericDigits(invalid, '1359', 4), '1359');
  assert.notEqual(validateNumericText(invalid, year), true);
}
assert.equal(editNumericDigits('', '1359', 4), '');
assert.equal(editNumericDigits('135', '1359', 4), '135');
for (const invalid of ['135', 135, '13599', 13599]) assert.notEqual(validateNumericText(invalid, year), true);
for (const valid of ['1359', 1359, '']) assert.equal(validateNumericText(valid, year), true);
assert.equal(formatFormDataForApi({ manufactureYear: '1359' }, schema).manufactureYear, 1359);
const [ordinary] = convertSchemaToFields({ properties: { weight: { type: 'number', minimum: -10, maximum: 100 } } });
assert.equal(hasNumericLengthConstraint(ordinary), false);
assert.equal(validateNumericText(-1.5, ordinary), true);
assert.equal(ordinary.min, -10);
assert.equal(ordinary.max, 100);
console.log('Numeric schema checks passed: length, typing/paste normalization, invalid syntax, existing values, numeric API payload, ordinary decimals.');
