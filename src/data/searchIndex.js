/**
 * Global search index for Cynosure CSI.
 * Indexes all courts, divisions, panels, and judges from static data.
 * Built once at module load time — O(1) lookup via search().
 */

import { CA_DIVISIONS } from './csi/caData'
import { FHC_DIVISIONS } from './csi/fhcData'
import { NICN_DIVISIONS } from './csi/nicData'
import {
  NIGERIAN_STATES_LIST,
  STATE_HC_DIVISIONS,
  MAGISTRATE_DIVISIONS,
} from './csi/stateCourtData'

// ─── Index entry shape ────────────────────────────────────────────────────────
// { id, type, category, title, subtitle, meta, href, keywords }

const entries = []

// ── Court of Appeal ───────────────────────────────────────────────────────────
entries.push({
  id: 'court-ca',
  type: 'Court',
  category: 'Federal Courts',
  title: 'Court of Appeal',
  subtitle: '20 divisions · Federal',
  href: '/csi/federal/CA',
  keywords: ['court of appeal', 'ca', 'federal', 'appeal'],
})

CA_DIVISIONS.forEach((div) => {
  entries.push({
    id: `ca-div-${div.id}`,
    type: 'Division',
    category: 'Court of Appeal',
    title: div.name,
    subtitle: `Court of Appeal · ${div.state}${div.active ? '' : ' · Coming Soon'}`,
    href: div.active ? `/csi/federal/CA/${div.id}` : null,
    keywords: [div.name, div.state, div.id, 'court of appeal', 'ca', div.location || ''].map(s => s.toLowerCase()),
    locked: !div.active,
  })

  if (div.active) {
    div.panels.forEach((panel) => {
      entries.push({
        id: `ca-panel-${div.id}-${panel.id}`,
        type: 'Panel',
        category: 'Court of Appeal',
        title: `${panel.name} — ${div.name}`,
        subtitle: `Court of Appeal · ${div.state}`,
        href: `/csi/federal/CA/${div.id}/${panel.id}`,
        keywords: [panel.name, div.name, div.state, 'panel', 'court of appeal'].map(s => s.toLowerCase()),
      })
    })
  }
})

// ── Federal High Court ────────────────────────────────────────────────────────
entries.push({
  id: 'court-fhc',
  type: 'Court',
  category: 'Federal Courts',
  title: 'Federal High Court',
  subtitle: '38 divisions · Federal',
  href: '/csi/federal/FHC',
  keywords: ['federal high court', 'fhc', 'federal'],
})

FHC_DIVISIONS.forEach((div) => {
  entries.push({
    id: `fhc-div-${div.id}`,
    type: 'Division',
    category: 'Federal High Court',
    title: div.name,
    subtitle: `Federal High Court · ${div.state}${div.active ? '' : ' · Coming Soon'}`,
    href: div.active ? `/csi/federal/FHC/${div.id}` : null,
    keywords: [div.name, div.state, div.id, 'fhc', 'federal high court', div.location || ''].map(s => s.toLowerCase()),
    locked: !div.active,
  })

  if (div.active && div.judges) {
    div.judges.forEach((judge) => {
      entries.push({
        id: `fhc-judge-${judge.id}`,
        type: 'Judge',
        category: 'Federal High Court',
        title: judge.name,
        subtitle: `${div.name} · Federal High Court${judge.role ? ' · ' + judge.role : ''}`,
        href: `/csi/federal/FHC/${div.id}/${judge.id}`,
        keywords: [judge.name, div.name, div.state, 'fhc', 'judge', judge.role || ''].map(s => s.toLowerCase()),
        role: judge.role,
      })
    })
  }
})

// ── National Industrial Court ─────────────────────────────────────────────────
entries.push({
  id: 'court-nic',
  type: 'Court',
  category: 'Federal Courts',
  title: 'National Industrial Court',
  subtitle: '27 divisions · Federal',
  href: '/csi/federal/NIC',
  keywords: ['national industrial court', 'nicn', 'nic', 'labour', 'employment', 'federal'],
})

NICN_DIVISIONS.forEach((div) => {
  entries.push({
    id: `nic-div-${div.id}`,
    type: 'Division',
    category: 'National Industrial Court',
    title: div.name,
    subtitle: `NICN · ${div.state}${div.active ? '' : ' · Coming Soon'}`,
    href: div.active ? `/csi/federal/NIC/${div.id}` : null,
    keywords: [div.name, div.state, div.id, 'nicn', 'nic', 'national industrial court', div.location || ''].map(s => s.toLowerCase()),
    locked: !div.active,
  })
})

// ── State High Courts ─────────────────────────────────────────────────────────
entries.push({
  id: 'court-state-hc',
  type: 'Court',
  category: 'State Courts',
  title: 'State High Courts',
  subtitle: '36 states + FCT',
  href: '/csi/state/high-court',
  keywords: ['state high court', 'state', 'high court', 'shc'],
})

NIGERIAN_STATES_LIST.forEach((state) => {
  const hcStatus = state.hcStatus
  entries.push({
    id: `state-hc-${state.id}`,
    type: 'State Court',
    category: 'State High Courts',
    title: `${state.name} State High Court`,
    subtitle: `${state.capital}${hcStatus ? '' : ' · Coming Soon'}`,
    href: hcStatus ? `/csi/state/high-court/${state.id}` : null,
    keywords: [state.name, state.capital, 'state high court', 'shc', state.id, state.stateCode.toLowerCase()],
    locked: !hcStatus,
  })
})

// State HC divisions and judges (from static data)
Object.entries(STATE_HC_DIVISIONS).forEach(([stateId, divisions]) => {
  const state = NIGERIAN_STATES_LIST.find(s => s.id === stateId)
  divisions.forEach((div) => {
    entries.push({
      id: `shc-div-${stateId}-${div.id}`,
      type: 'Division',
      category: `${state?.name || stateId} High Court`,
      title: div.name,
      subtitle: `${state?.name} State High Court${div.parentDivision && div.parentDivision !== div.name ? ' · ' + div.parentDivision : ''}`,
      href: `/csi/state/high-court/${stateId}/${div.id}`,
      keywords: [div.name, div.parentDivision || '', state?.name || '', 'state high court', stateId].map(s => s.toLowerCase()),
    })

    if (div.judges) {
      div.judges.forEach((judge) => {
        entries.push({
          id: `shc-judge-${stateId}-${div.id}-${judge.id}`,
          type: 'Judge',
          category: `${state?.name || stateId} High Court`,
          title: judge.name,
          subtitle: `${div.name} · ${state?.name} State High Court`,
          href: `/csi/state/high-court/${stateId}/${div.id}/${judge.id}`,
          keywords: [judge.name, div.name, state?.name || '', 'state high court', 'judge'].map(s => s.toLowerCase()),
        })
      })
    }
  })
})

// ── Magistrate Courts ─────────────────────────────────────────────────────────
entries.push({
  id: 'court-magistrate',
  type: 'Court',
  category: 'State Courts',
  title: 'Magistrate Courts',
  subtitle: '36 states + FCT',
  href: '/csi/state/magistrate',
  keywords: ['magistrate', 'magistrate court', 'mc', 'state'],
})

Object.entries(MAGISTRATE_DIVISIONS).forEach(([stateId, divisions]) => {
  const state = NIGERIAN_STATES_LIST.find(s => s.id === stateId)
  divisions.forEach((div) => {
    entries.push({
      id: `mag-div-${stateId}-${div.id}`,
      type: 'Division',
      category: 'Magistrate Courts',
      title: div.name,
      subtitle: `${state?.name} Magistrate Court · ${div.location || ''}`,
      href: `/csi/state/magistrate/${stateId}/${div.id}`,
      keywords: [div.name, state?.name || '', 'magistrate', stateId, div.location || ''].map(s => s.toLowerCase()),
    })
  })
})

// ─── Search function ──────────────────────────────────────────────────────────

function score(entry, q) {
  const query = q.toLowerCase().trim()
  if (!query) return 0

  const title = entry.title.toLowerCase()
  const subtitle = (entry.subtitle || '').toLowerCase()
  const kws = entry.keywords || []

  let s = 0

  // Title matches
  if (title === query) s += 100
  else if (title.startsWith(query)) s += 80
  else if (title.includes(query)) s += 50

  // Word boundary match in title
  if (title.split(/\s+/).some(w => w.startsWith(query))) s += 30

  // Subtitle match
  if (subtitle.includes(query)) s += 20

  // Keyword matches
  kws.forEach(kw => {
    if (kw === query) s += 40
    else if (kw.startsWith(query)) s += 25
    else if (kw.includes(query)) s += 10
  })

  return s
}

// Type priority for tie-breaking: Judges > Divisions > Panels > Courts > State Courts
const TYPE_ORDER = { Judge: 0, Panel: 1, Division: 2, Court: 3, 'State Court': 4 }

export function search(query, limit = 12) {
  if (!query || query.trim().length < 2) return []

  return entries
    .map(entry => ({ entry, score: score(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (TYPE_ORDER[a.entry.type] ?? 9) - (TYPE_ORDER[b.entry.type] ?? 9)
    })
    .slice(0, limit)
    .map(({ entry }) => entry)
}

// Quick links shown when search is empty
export const QUICK_LINKS = [
  { title: 'Court of Appeal', subtitle: 'Federal · 20 divisions', href: '/csi/federal/CA', type: 'Court' },
  { title: 'Federal High Court', subtitle: 'Federal · 38 divisions', href: '/csi/federal/FHC', type: 'Court' },
  { title: 'National Industrial Court', subtitle: 'Federal · 27 divisions', href: '/csi/federal/NIC', type: 'Court' },
  { title: 'Lagos State High Court', subtitle: 'State · 14 specialized courts', href: '/csi/state/high-court/lagos', type: 'Division' },
  { title: 'Lagos Magistrate Court', subtitle: 'State · 6 divisions', href: '/csi/state/magistrate/lagos', type: 'Division' },
]
