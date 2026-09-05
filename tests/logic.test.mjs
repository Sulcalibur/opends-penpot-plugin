/**
 * Unit tests for the pure logic embedded in public/plugin.js.
 *
 * The Penpot plugin runs as a classic script with no module system, so the
 * pure helpers live between the `OPENDSCORE-START` / `OPENDSCORE-END` marker
 * comments in that file. This test reads the file, extracts that block, and
 * evaluates it into a sandbox — no duplication, no new dependencies, and the
 * tests stay honest about the exact code that ships.
 *
 * Run with: node --test tests/
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const pluginSource = readFileSync(join(here, '..', 'public', 'plugin.js'), 'utf8')

const START = '// OPENDSCORE-START'
const END = '// OPENDSCORE-END'
const startIdx = pluginSource.indexOf(START)
const endIdx = pluginSource.indexOf(END)
assert.ok(startIdx >= 0, 'OPENDSCORE-START marker must exist in plugin.js')
assert.ok(endIdx > startIdx, 'OPENDSCORE-END marker must exist in plugin.js')

// Slice on whole lines so a trailing inline comment after START is excluded.
const coreStart = pluginSource.indexOf('\n', startIdx) + 1
const coreEnd = pluginSource.lastIndexOf('\n', endIdx) + 1
const coreBlock = pluginSource.slice(coreStart, coreEnd)
const core = new Function(
  `${coreBlock}; return { hashFnv1a, canonicalTokenSets, tokenFingerprint, canonicalComponentNames, filterComponentsForScope, scopeIncludesTokens, scopeIncludesComponents, scopeFingerprint, buildWirePayload, buildComponentsPayload, normalizeColor, normalizeDimension, normalizeLineHeight };`,
)()

const sampleSets = () => ({
  colors: [
    { id: 'a', name: 'brand', value: '#FF6B4A', description: 'brand colour' },
    { id: 'b', name: 'text', value: '#23211E', description: null },
  ],
  typographies: [
    { id: 't1', name: 'heading', fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, lineHeight: '1.2', description: null },
  ],
  spacings: [
    { id: 's1', name: 'space-4', value: '1rem', description: null },
  ],
})

test('core block loads from plugin.js', () => {
  assert.equal(typeof core.tokenFingerprint, 'function')
  assert.equal(typeof core.buildWirePayload, 'function')
})

test('fingerprint is stable for identical sets', () => {
  assert.equal(core.tokenFingerprint(sampleSets()), core.tokenFingerprint(sampleSets()))
})

test('fingerprint is stable across array reordering', () => {
  const a = sampleSets()
  const b = sampleSets()
  b.colors.reverse()
  b.spacings = b.spacings.reverse()
  assert.equal(core.tokenFingerprint(a), core.tokenFingerprint(b))
})

test('fingerprint is stable when only descriptions change (payload unaffected)', () => {
  const a = sampleSets()
  const b = sampleSets()
  b.colors[0].description = 'totally different note'
  b.typographies[0].description = 'x'
  assert.equal(core.tokenFingerprint(a), core.tokenFingerprint(b))
})

test('fingerprint changes when a token value changes', () => {
  const a = sampleSets()
  const b = sampleSets()
  b.colors[0].value = '#000000'
  assert.notEqual(core.tokenFingerprint(a), core.tokenFingerprint(b))
})

test('fingerprint changes when a token is added or renamed', () => {
  const base = sampleSets()
  const added = sampleSets()
  added.colors.push({ id: 'c', name: 'accent', value: '#FFD166', description: null })
  assert.notEqual(core.tokenFingerprint(base), core.tokenFingerprint(added))

  const renamed = sampleSets()
  renamed.typographies[0].name = 'heading-2xl'
  assert.notEqual(core.tokenFingerprint(base), core.tokenFingerprint(renamed))
})

test('buildWirePayload uses the OpenDS endpoint keys and counts', () => {
  const sets = sampleSets()
  const payload = core.buildWirePayload(sets, '2026-09-05T00:00:00Z')
  assert.equal(payload.version, '1.0')
  assert.equal(payload.source, 'penpot')
  assert.equal(payload.exportedAt, '2026-09-05T00:00:00Z')
  assert.equal(payload.colors.length, 2)
  assert.equal(payload.typography.length, 1)
  assert.equal(payload.spacing.length, 1)
  // Endpoint expects `typography`/`spacing` (singular) — not `typographies`.
  assert.equal('typographies' in payload, false)
  assert.equal('spacings' in payload, false)
})

test('color normalization expands shorthand hex and drops alpha', () => {
  assert.equal(core.normalizeColor('#f00'), '#ff0000')
  assert.equal(core.normalizeColor('#FF6B4A'), '#FF6B4A')
  assert.equal(core.normalizeColor('#FF6B4ACC'), '#FF6B4A')
  assert.equal(core.normalizeColor('rgb(255, 107, 74)'), 'rgb(255, 107, 74)')
  assert.equal(core.normalizeColor(null), '#000000')
})

test('dimension normalization appends px to unitless values', () => {
  assert.equal(core.normalizeDimension('16'), '16px')
  assert.equal(core.normalizeDimension('1rem'), '1rem')
  assert.equal(core.normalizeDimension('0'), '0px')
})

test('line-height normalization keeps ratios unitless', () => {
  assert.equal(core.normalizeLineHeight('1.2'), '1.2')
  assert.equal(core.normalizeLineHeight('12'), '12px')
  assert.equal(core.normalizeLineHeight('24px'), '24px')
  assert.equal(core.normalizeLineHeight(null), 'normal')
})

/* ------------------------------------------------------------------ */
/* Sync scope                                                          */
/* ------------------------------------------------------------------ */

const compSets = () => [
  { id: 'c1', name: 'button', description: 'a', type: 'COMPONENT' },
  { id: 'c2', name: 'input', description: 'b', type: 'COMPONENT' },
  { id: 'c3', name: 'badge', description: null, type: 'COMPONENT' },
]

test('scope flags match the four modes', () => {
  assert.equal(core.scopeIncludesTokens({ mode: 'all' }), true)
  assert.equal(core.scopeIncludesTokens({ mode: 'tokens' }), true)
  assert.equal(core.scopeIncludesTokens({ mode: 'components' }), false)
  assert.equal(core.scopeIncludesTokens({ mode: 'pick' }), false)
  assert.equal(core.scopeIncludesComponents({ mode: 'all' }), true)
  assert.equal(core.scopeIncludesComponents({ mode: 'tokens' }), false)
  assert.equal(core.scopeIncludesComponents({ mode: 'components' }), true)
  assert.equal(core.scopeIncludesComponents({ mode: 'pick' }), true)
  assert.equal(core.scopeIncludesTokens(undefined), true) // default all
})

test('filterComponentsForScope honours pick ids and all/components modes', () => {
  const all = compSets()
  assert.equal(core.filterComponentsForScope({ mode: 'all' }, all).length, 3)
  assert.equal(core.filterComponentsForScope({ mode: 'components' }, all).length, 3)
  assert.equal(core.filterComponentsForScope({ mode: 'tokens' }, all).length, 0)

  const picked = core.filterComponentsForScope({ mode: 'pick', componentIds: ['c1', 'c3'] }, all)
  assert.deepEqual(picked.map((c) => c.name).sort(), ['badge', 'button'])

  // Unknown ids are ignored, empty pick yields nothing
  assert.equal(core.filterComponentsForScope({ mode: 'pick', componentIds: ['nope'] }, all).length, 0)
  assert.equal(core.filterComponentsForScope({ mode: 'pick', componentIds: [] }, all).length, 0)
})

test('canonicalComponentNames sorts and filters', () => {
  assert.deepEqual(core.canonicalComponentNames(compSets()), ['badge', 'button', 'input'])
  assert.deepEqual(core.canonicalComponentNames([{ name: '' }, { name: 'x' }]), ['x'])
})

test('scope fingerprint reacts to selected components but not scope-excluded changes', () => {
  const tokens = sampleSets()
  const comps = compSets()

  // Changing an unselected component in pick mode does not change the fingerprint
  const fpPick = core.scopeFingerprint({ mode: 'pick', componentIds: ['c1'] }, tokens, comps)
  const changedOther = compSets()
  changedOther[1].name = 'input-field' // c2, NOT selected
  assert.equal(
    core.scopeFingerprint({ mode: 'pick', componentIds: ['c1'] }, tokens, changedOther),
    fpPick,
  )

  // Renaming a selected component changes it
  const renamedSelected = compSets()
  renamedSelected[0].name = 'button-primary'
  assert.notEqual(
    core.scopeFingerprint({ mode: 'pick', componentIds: ['c1'] }, tokens, renamedSelected),
    fpPick,
  )

  // Tokens mode ignores component changes entirely
  const fpTokens = core.scopeFingerprint({ mode: 'tokens' }, tokens, comps)
  assert.equal(
    core.scopeFingerprint({ mode: 'tokens' }, tokens, changedOther),
    fpTokens,
  )
  const changedTokens = sampleSets()
  changedTokens.colors[0].value = '#000000'
  assert.notEqual(core.scopeFingerprint({ mode: 'tokens' }, changedTokens, comps), fpTokens)
})

test('buildComponentsPayload maps to the OpenDS wire format', () => {
  const payload = core.buildComponentsPayload(compSets(), '2026-09-05T00:00:00Z')
  assert.equal(payload.source, 'penpot')
  assert.equal(payload.components.length, 3)
  const button = payload.components.find((c) => c.name === 'button')
  assert.equal(button.type, 'COMPONENT')
  assert.equal(typeof button.displayName, 'string')
  assert.deepEqual(button.structure, {})
})
