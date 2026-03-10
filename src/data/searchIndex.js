/**
 * Global search quick-links for Cynosure CSI.
 * Dynamic court/judge/division search is powered by the backend API (/search/).
 * This file only provides top-level navigation entries and quick links.
 */

// ─── Top-level navigation entries ────────────────────────────────────────────
const entries = [
  {
    id: 'court-ca',
    type: 'Court',
    category: 'Federal Courts',
    title: 'Court of Appeal',
    subtitle: 'Federal · 20 divisions',
    href: '/csi/federal/CA',
    keywords: ['court of appeal', 'ca', 'federal', 'appeal'],
  },
  {
    id: 'court-fhc',
    type: 'Court',
    category: 'Federal Courts',
    title: 'Federal High Court',
    subtitle: 'Federal · 38 divisions',
    href: '/csi/federal/FHC',
    keywords: ['federal high court', 'fhc', 'federal'],
  },
  {
    id: 'court-nic',
    type: 'Court',
    category: 'Federal Courts',
    title: 'National Industrial Court',
    subtitle: 'Federal · 27 divisions',
    href: '/csi/federal/NIC',
    keywords: ['national industrial court', 'nicn', 'nic', 'labour', 'employment', 'federal'],
  },
  {
    id: 'court-state-hc',
    type: 'Court',
    category: 'State Courts',
    title: 'State High Courts',
    subtitle: '36 states + FCT',
    href: '/csi/state/high-court',
    keywords: ['state high court', 'state', 'high court', 'shc'],
  },
  {
    id: 'court-magistrate',
    type: 'Court',
    category: 'State Courts',
    title: 'Magistrate Courts',
    subtitle: '36 states + FCT',
    href: '/csi/state/magistrate',
    keywords: ['magistrate', 'magistrate court', 'mc', 'state'],
  },
]

// ─── Local search (top-level only) ───────────────────────────────────────────
function score(entry, q) {
  const query = q.toLowerCase().trim()
  if (!query) return 0
  const title = entry.title.toLowerCase()
  const subtitle = (entry.subtitle || '').toLowerCase()
  const kws = entry.keywords || []
  let s = 0
  if (title === query) s += 100
  else if (title.startsWith(query)) s += 80
  else if (title.includes(query)) s += 50
  if (title.split(/\s+/).some(w => w.startsWith(query))) s += 30
  if (subtitle.includes(query)) s += 20
  kws.forEach(kw => {
    if (kw === query) s += 40
    else if (kw.startsWith(query)) s += 25
    else if (kw.includes(query)) s += 10
  })
  return s
}

export function search(query, limit = 12) {
  if (!query || query.trim().length < 2) return []
  return entries
    .map(entry => ({ entry, score: score(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry)
}

// Quick links shown when search is empty
export const QUICK_LINKS = [
  { title: 'Court of Appeal', subtitle: 'Federal · 20 divisions', href: '/csi/federal/CA', type: 'Court' },
  { title: 'Federal High Court', subtitle: 'Federal · 38 divisions', href: '/csi/federal/FHC', type: 'Court' },
  { title: 'National Industrial Court', subtitle: 'Federal · 27 divisions', href: '/csi/federal/NIC', type: 'Court' },
  { title: 'State High Courts', subtitle: 'All 36 states + FCT', href: '/csi/state/high-court', type: 'Court' },
  { title: 'Magistrate Courts', subtitle: 'All states', href: '/csi/state/magistrate', type: 'Court' },
]
