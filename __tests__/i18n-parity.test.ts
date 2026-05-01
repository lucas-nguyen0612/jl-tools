import { describe, expect, it } from 'vitest'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

type Tree = { [key: string]: string | Tree }

function flatten(node: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      out.set(path, value)
    } else if (value && typeof value === 'object') {
      for (const [p, v] of flatten(value as Tree, path)) out.set(p, v)
    } else {
      throw new Error(`Unexpected value at ${path}: ${typeof value}`)
    }
  }
  return out
}

const enFlat = flatten(en as Tree)
const viFlat = flatten(vi as Tree)

describe('i18n parity', () => {
  it('every key in en.json exists in vi.json', () => {
    const missing = [...enFlat.keys()].filter((k) => !viFlat.has(k))
    expect(missing).toEqual([])
  })

  it('vi.json has no extra keys beyond en.json', () => {
    const extra = [...viFlat.keys()].filter((k) => !enFlat.has(k))
    expect(extra).toEqual([])
  })

  it('every leaf in en.json is a non-empty string', () => {
    const empty = [...enFlat.entries()]
      .filter(([, v]) => typeof v !== 'string' || v.trim() === '')
      .map(([k]) => k)
    expect(empty).toEqual([])
  })

  it('every leaf in vi.json is a non-empty string', () => {
    const empty = [...viFlat.entries()]
      .filter(([, v]) => typeof v !== 'string' || v.trim() === '')
      .map(([k]) => k)
    expect(empty).toEqual([])
  })

  it('no vi value contains __MISSING__ or __TODO__ placeholders', () => {
    const placeholders = [...viFlat.entries()]
      .filter(([, v]) => /__MISSING__|__TODO__/.test(v))
      .map(([k]) => k)
    expect(placeholders).toEqual([])
  })

  it('ICU placeholders in vi match en (no translated placeholder names)', () => {
    // Extract only top-level (depth 0) ICU placeholders. Nested plural/select
    // arms like `{count, plural, one {# day} other {# days}}` should yield only
    // `count`, not `# day` / `# days`.
    function topLevelParams(str: string): string[] {
      const out: string[] = []
      let depth = 0
      for (let i = 0; i < str.length; i++) {
        const ch = str[i]
        if (ch === '{') {
          if (depth === 0) {
            // Read identifier following the `{`.
            const m = /^\{([A-Za-z_][A-Za-z0-9_]*)/.exec(str.slice(i))
            if (m) out.push(m[1])
          }
          depth++
        } else if (ch === '}') {
          depth--
        }
      }
      return out.sort()
    }
    const mismatches: { key: string; en: string[]; vi: string[] }[] = []
    for (const [key, enValue] of enFlat) {
      const viValue = viFlat.get(key)
      if (!viValue) continue
      const enParams = topLevelParams(enValue)
      const viParams = topLevelParams(viValue)
      // Dedupe (a placeholder used twice in selector + body shows up twice).
      const enUnique = [...new Set(enParams)].sort()
      const viUnique = [...new Set(viParams)].sort()
      if (JSON.stringify(enUnique) !== JSON.stringify(viUnique)) {
        mismatches.push({ key, en: enUnique, vi: viUnique })
      }
    }
    expect(mismatches).toEqual([])
  })
})
