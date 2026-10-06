const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const localRequire = Module.createRequire(file);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  new Function('require', 'module', 'exports', code)(
    (name) => {
      if (name.endsWith('.css')) return {};
      if (name === 'react-multi-date-picker')
        return {
          __esModule: true,
          default: (props) => props.render('', () => {}),
          DateObject: class {},
        };
      if (!name.startsWith('@/') && !name.startsWith('.'))
        return localRequire(name);
      const target = name.startsWith('@/')
        ? path.join(root, 'src', name.slice(2))
        : path.resolve(path.dirname(file), name);
      if (target.endsWith('.json')) return localRequire(target);
      return load(
        fs.existsSync(`${target}.ts`) ? `${target}.ts` : `${target}.tsx`
      );
    },
    module,
    module.exports
  );
  return module.exports;
}
const { convertSchemaToFields, resolveFieldRequirements } = load(
  path.join(root, 'src/utils/schema-converter.ts')
);
const schema = {
  required: ['startDate'],
  properties: {
    startDate: { type: 'string', format: 'date', title: 'تاریخ شروع' },
    endDate: {
      type: 'string',
      format: 'date',
      required: true,
      title: 'تاریخ پایان',
    },
    uniformsDate: {
      type: 'string',
      format: 'date',
      uniforms: { required: true },
    },
    optionalDate: { type: 'string', format: 'date', required: false },
    optionalGroup: {
      type: 'object',
      properties: { date: { type: 'string', format: 'date', required: true } },
    },
  },
};
const fields = convertSchemaToFields(schema);
// Older schemas declare these requirements in titles instead of required[].
const titleRequiredFields = convertSchemaToFields({
  required: ['venue'],
  properties: {
    venue: { type: 'string', title: 'محل برگزاری' },
    startDate: { type: 'string', format: 'date', title: 'تاریخ شروع (الزامی)' },
    endDate: { type: 'string', format: 'date', title: 'تاریخ پایان (الزامی)' },
    optionalDate: { type: 'string', format: 'date', title: 'تاریخ اختیاری' },
  },
});
assert.deepEqual(titleRequiredFields.map(field => field.required), [true, true, true, false]);
assert.deepEqual(
  fields.slice(0, 4).map((f) => f.required),
  [true, true, true, false]
);
assert(fields.slice(0, 4).every((f) => f.type === 'date'));
assert.equal(resolveFieldRequirements(fields, {})[4].fields[0].required, false);
assert.equal(
  resolveFieldRequirements(fields, { optionalGroup: { date: '2026-10-06' } })[4]
    .fields[0].required,
  true
);
const DatePicker = load(
  path.join(root, 'src/components/ui/schema-date-picker.tsx')
).default;
const html = renderToStaticMarkup(
  React.createElement(DatePicker, {
    label: 'تاریخ شروع',
    required: true,
    hasError: true,
    id: 'start-date',
    describedBy: 'start-error',
    onChange() {},
  })
);
assert(html.includes('تاریخ شروع (الزامی)'));
assert(html.includes('aria-invalid="true"'));
assert(html.includes('aria-describedby="start-error"'));
assert(html.includes('border-red'));
assert(html.includes('focus:ring-red'));
const optionalHtml = renderToStaticMarkup(
  React.createElement(DatePicker, { onChange() {} })
);
assert(!optionalHtml.includes('aria-required="true"'));
assert(!optionalHtml.includes('aria-invalid="true"'));
console.log(
  'Date checks passed: required sources, optional parents, error styling and accessible date controls.'
);
