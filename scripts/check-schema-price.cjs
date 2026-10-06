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
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)(
    (name) => {
      if (!name.startsWith('@/') && !name.startsWith('.'))
        return localRequire(name);
      const target = name.startsWith('@/')
        ? path.join(root, 'src', name.slice(2))
        : path.resolve(path.dirname(file), name);
      if (target.endsWith('.json')) return localRequire(target);
      return load(`${target}.ts`);
    },
    module,
    module.exports
  );
  return module.exports;
}
const price = load(path.join(root, 'src/utils/schema-price.ts'));
const { convertSchemaToFields, formatFormDataForApi } = load(
  path.join(root, 'src/utils/schema-converter.ts')
);
assert.equal(price.normalizePriceInput('۱٬۰۰۰٬۰۰۰'), '1000000');
assert.equal(price.normalizePriceInput('١،٠٠٠،٠٠٠'), '1000000');
assert.equal(price.normalizePriceInput('001000'), '1000');
for (const invalid of ['-100', '12foo', '1e6', '12.5'])
  assert.equal(price.normalizePriceInput(invalid), null);
assert.equal(price.formatPriceInput(1000000), '1,000,000');
assert.equal(price.formatPriceInput(0), '0');
assert.equal(price.formatPriceInput(null), '');
assert.equal(price.priceInWords(1000000, 'IRR'), 'یک میلیون ریال');
assert.equal(price.priceInWords(0, 'IRR'), 'صفر ریال');
assert.equal(price.priceInWords('', 'IRR'), '');
assert.equal(price.priceInWords(Number.MAX_SAFE_INTEGER + 1, 'IRR'), '');
assert.equal(
  price.priceDisplayEquivalent(1000000, 'IRR', 'تومان'),
  'معادل ۱۰۰٬۰۰۰ تومان'
);
assert.equal(price.priceDisplayEquivalent(15, 'IRR', 'IRT'), 'معادل ۱٫۵ تومان');
assert.equal(price.priceDisplayEquivalent(1000000, 'USD', 'EUR'), '');
const schema = {
  properties: {
    price: {
      type: 'integer',
      currency: 'IRR',
      displayCurrency: 'تومان',
      minimum: 0,
      maximum: 2000000,
    },
    nested: {
      type: 'object',
      properties: {
        fee: {
          type: 'number',
          uniforms: { currency: 'IRR', displayCurrency: 'تومان' },
        },
      },
    },
  },
};
const fields = convertSchemaToFields(schema);
assert.equal(fields[0].currency, 'IRR');
assert.equal(fields[0].displayCurrency, 'تومان');
assert.equal(fields[0].min, 0);
assert.equal(fields[0].max, 2000000);
assert.equal(fields[1].fields[0].currency, 'IRR');
assert.equal(fields[1].fields[0].name, 'nested.fee');
assert.deepEqual(
  formatFormDataForApi({ price: '1000000', nested: { fee: '1000' } }, schema),
  { price: 1000000, nested: { fee: 1000 } }
);
assert.deepEqual(
  formatFormDataForApi({ price: '', nested: { fee: '' } }, schema),
  {}
);
assert.deepEqual(formatFormDataForApi({ price: 0 }, schema), { price: 0 });
console.log(
  'Price checks passed: currencies, words, localized digits, empty/zero, nested fields and API amounts.'
);
