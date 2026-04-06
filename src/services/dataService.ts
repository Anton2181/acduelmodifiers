import Papa from 'papaparse';
import type { Character, ProcessedDuel, Modifier, GainedModifier, CharHistory } from '../types';

const DUELS_URL = 'https://docs.google.com/spreadsheets/d/1QpAlKSJKM2RfI47KnTf1M5lF-qBa5e8SrZV0vf1J2UU/export?format=csv&gid=2136520867';
const CHARACTERS_URL = 'https://docs.google.com/spreadsheets/d/1WKSeqB1yX91A2TyD9Lie-mwNkc4qLIrN-pIPbX2knac/export?format=csv&gid=0';
const METADATA_URL = 'https://docs.google.com/spreadsheets/d/1QpAlKSJKM2RfI47KnTf1M5lF-qBa5e8SrZV0vf1J2UU/export?format=csv&gid=2101836998';

// Manual starting bonuses — for pre-game history, ward-based bonuses (Superior Tutelage),
// or any condition that cannot be derived from the duel log alone.
const MANUAL_STARTING_BONUSES: Record<string, { name: string; value: number }> = {
  'daemon velaryon': { name: 'Proven Duelist', value: 1 },
  'aegon targaryen': { name: 'Proven Duelist', value: 1 },
  'harrold harroway': { name: 'Proven Duelist', value: 1 },
  'patrek mallister': { name: 'Proven Duelist', value: 1 },
  'samantha redwyne': { name: 'Proven Duelist', value: 1 },
  'illyrio yronwood': { name: 'Proven Duelist', value: 1 },
  'aulor celtigar': { name: 'Proven Duelist', value: 1 },
  'edric vance of atranta': { name: 'Proven Duelist', value: 1 },
  'bennard strong': { name: 'Proven Duelist', value: 1 },
  'lymond mallister': { name: 'Proven Duelist', value: 1 },
  'brandon bolton': { name: 'Proven Duelist', value: 1 },
  'armen peake': { name: 'Proven Duelist', value: 1 },
  'reynard reyne': { name: 'Experienced Duelist', value: 1 },
  'hallyn hoare': { name: 'Experienced Duelist', value: 1 },
  'davos darklyn': { name: 'Experienced Duelist', value: 1 },
  'quenton qoherys': { name: 'Experienced Duelist', value: 1 },
  'imry florent': { name: 'Experienced Duelist', value: 1 },
  'ambrose beesbury': { name: 'Experienced Duelist', value: 1 },
  "vorian vance of wayfarer's rest": { name: 'Experienced Duelist', value: 1 },
  'doran yronwood': { name: 'Experienced Duelist', value: 1 },
  "armistead vance of wayfarer's rest": { name: 'Experienced Duelist', value: 1 },
  'armond connington': { name: 'Experienced Duelist', value: 1 },
  'addam tarly': { name: 'Experienced Duelist', value: 1 },
  'hoster blackwood': { name: 'Expert Duelist', value: 4 },
  'harmen martell': { name: 'Good Duelist', value: 2 },
  'tynan whiteclaw': { name: 'Good Duelist', value: 2 },
  'edwyn storm': { name: 'Good Duelist', value: 2 },
  'ronnet connington': { name: 'Good Duelist', value: 2 },
  'argilac durrandon': { name: 'Veteran Duelist', value: 2 },
  'mors martell': { name: 'Veteran Duelist', value: 2 },
  'manfryd blackwood': { name: 'Veteran Duelist', value: 2 },
  'jon connington': { name: 'Veteran Duelist', value: 2 },
  'willem lannister': { name: 'Superior Duelist', value: 3 },
  'quentyn peake': { name: 'Superior Duelist', value: 3 },
  'crispian celtigar': { name: 'Superior Duelist', value: 3 },
  'osmund strong': { name: 'Superior Duelist', value: 3 },
};

const MASTER_OFFSET = 5;

// ─── Skill Bonus Progression Tiers (checked highest first) ──────────────────

const SKILL_BONUS_TIERS: { name: string; value: number; check: (h: CharHistory) => boolean }[] = [
  {
    name: 'Master Duelist', value: 5,
    check: h => (h.winsAgainstSkillLevel.get(4) ?? 0) > 0 && h.distinctPrimaryOpponentsDueled.size >= 24
  },
  {
    name: 'Expert Duelist', value: 4,
    check: h => (h.winsAgainstSkillLevel.get(3) ?? 0) > 0 && h.distinctPrimaryOpponentsDueled.size >= 12
  },
  {
    name: 'Superior Duelist', value: 3,
    check: h => (h.winsAgainstSkillLevel.get(2) ?? 0) > 0 && h.distinctPrimaryOpponentsDueled.size >= 6
  },
  { name: 'Veteran Duelist', value: 2, check: h => h.winsAgainstPrimary >= 6 },
  { name: 'Good Duelist',    value: 2, check: h => (h.winsAgainstSkillLevel.get(1) ?? 0) > 0 },
  { name: 'Experienced Duelist', value: 1, check: h => h.totalDuels >= 6 },
  { name: 'Proven Duelist',  value: 1, check: h => h.hasWonNoPenaltyAgainstPrimary },
];

function computeEarnedSkillBonus(history: CharHistory): { name: string; value: number } | null {
  for (const tier of SKILL_BONUS_TIERS) {
    if (tier.check(history)) return { name: tier.name, value: tier.value };
  }
  return null;
}

// Returns the highest effective skill bonus (max of manual starting and earned from duels)
function getEffectiveSkillBonus(
  normName: string,
  history: CharHistory
): { name: string; value: number } | null {
  const manual = MANUAL_STARTING_BONUSES[normName] ?? null;
  const earned = computeEarnedSkillBonus(history);

  if (!manual && !earned) return null;
  if (!manual) return earned;
  if (!earned) return manual;
  // Prefer the earned name if value is greater or equal (earned tracks actual progression)
  return earned.value >= manual.value ? earned : manual;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const normalizeName = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/^(lord|ser|lady|prince|princess|king|queen|the)\s+/i, '')
    .trim();
};

const parseYear = (dateStr: string): number => {
  if (!dateStr) return 0;
  const match = dateStr.match(/(-?\d+)\s*DV/i);
  return match ? parseInt(match[1]) : 0;
};

const parseMoon = (dateStr: string): number => {
  if (!dateStr) return 0;
  const match = dateStr.match(/(\d+)(st|nd|rd|th)\s*Moon/i);
  return match ? parseInt(match[1]) : 0;
};

const calculateAgeMalus = (age: number): number => {
  if (age < 14) return 0;
  if (age <= 16) return -2;
  if (age <= 39) return 0;
  if (age <= 49) return -1;
  if (age <= 59) return -2;
  if (age <= 64) return -3;
  if (age <= 69) return -4;
  if (age <= 74) return -5;
  if (age <= 79) return -7;
  return -10;
};

// Parses "Name +N" or "Name -N" from the P1 Gained / P2 Gained columns
function parseManualGain(raw: string | undefined): Modifier | null {
  if (!raw?.trim()) return null;
  const match = raw.trim().match(/^(.+?)\s+([+-]\d+)$/);
  if (!match) return null;
  const value = parseInt(match[2]);
  return { name: match[1].trim(), value, type: value >= 0 ? 'bonus' : 'penalty', source: 'manual' };
}

function makeHistory(): CharHistory {
  return {
    totalDuels: 0,
    totalWins: 0,
    winsAgainstPrimary: 0,
    distinctPrimaryOpponentsDueled: new Set(),
    winsAgainstSkillLevel: new Map(),
    hasWonNoPenaltyAgainstPrimary: false,
    accumulatedManualModifiers: [],
    firstDuelYear: null,
    lastEffectiveBonusName: null,
  };
}

function cloneHistory(h: CharHistory): CharHistory {
  return {
    ...h,
    distinctPrimaryOpponentsDueled: new Set(h.distinctPrimaryOpponentsDueled),
    winsAgainstSkillLevel: new Map(h.winsAgainstSkillLevel),
    accumulatedManualModifiers: h.accumulatedManualModifiers.map(m => ({ ...m })),
  };
}

const computeStats = (
  pChar: Character | undefined,
  effBonus: { name: string; value: number } | null,
  history: CharHistory,
  evalYear: number
) => {
  const modifiers: Modifier[] = [];
  if (!pChar) return { age: null, modifiers, totalBonus: 0, totalPenalty: 0, totalModifier: 0 };

  const ageAtCurrent = evalYear - pChar.birthYear;

  // 1. Skill bonus (earned or manual starting)
  if (effBonus) {
    modifiers.push({ name: effBonus.name, value: effBonus.value, type: 'bonus', source: 'skill' });
  }

  // 2. Accumulated manual modifiers (injuries, etc. from prior duels)
  for (const m of history.accumulatedManualModifiers) {
    modifiers.push({ ...m });
  }

  // 3. Age malus (with Master Duelist negation)
  let ageMalusValue = calculateAgeMalus(ageAtCurrent);
  if (effBonus?.name === 'Master Duelist' && ageMalusValue < 0) {
    ageMalusValue = Math.min(0, ageMalusValue + MASTER_OFFSET);
  }
  if (ageMalusValue !== 0) {
    modifiers.push({ name: 'Age Penalty', value: ageMalusValue, type: 'penalty', source: 'age' });
  }

  // 4. Wasted Youth / Starting Too Late (only for born after 80 DV)
  if (pChar.birthYear > 80 && history.firstDuelYear !== null) {
    const ageAtFirstDuel = history.firstDuelYear - pChar.birthYear;
    if (ageAtFirstDuel >= 35) {
      modifiers.push({ name: 'Starting Too Late', value: -1, type: 'penalty', source: 'other' });
    } else if (ageAtFirstDuel >= 25) {
      modifiers.push({ name: 'Wasted Youth', value: -1, type: 'penalty', source: 'other' });
    }
  }

  // Only the highest skill bonus counts; other bonuses (manual) stack
  const skillBonuses = modifiers.filter(m => m.source === 'skill');
  const otherBonuses = modifiers.filter(m => m.type === 'bonus' && m.source !== 'skill');
  const penalties = modifiers.filter(m => m.type === 'penalty');

  const maxSkillValue = skillBonuses.length > 0 ? Math.max(...skillBonuses.map(b => b.value)) : 0;
  skillBonuses.forEach(b => { if (b.value < maxSkillValue) b.isOverridden = true; });

  const totalBonus = maxSkillValue + otherBonuses.reduce((s, b) => s + b.value, 0);
  const totalPenalty = penalties.reduce((s, p) => s + p.value, 0);

  return { age: ageAtCurrent, modifiers, totalBonus, totalPenalty, totalModifier: totalBonus + totalPenalty };
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export const fetchAllData = async (): Promise<{ duels: ProcessedDuel[], currentDate: string, allFighters: Character[] }> => {
  const [duelsRes, charactersRes, metadataRes] = await Promise.all([
    fetch(DUELS_URL).then(res => res.text()),
    fetch(CHARACTERS_URL).then(res => res.text()),
    fetch(METADATA_URL).then(res => res.text()),
  ]);

  const charactersData = Papa.parse(charactersRes, { header: true }).data as any[];
  const metadataData = Papa.parse(metadataRes, { header: false }).data as any[];
  const duelsDataRaw = Papa.parse(duelsRes, { header: true }).data as any[];

  const currentDateStr = metadataData[0]?.[1] || 'Unknown';

  // Build character map
  const characterMap = new Map<string, Character>();
  charactersData.forEach(c => {
    const name = c.FullName || `${c['First Name']} ${c.House}`.trim();
    if (name) {
      const character: Character = {
        id: parseInt(c['Character ID (numeric)']),
        fullName: name,
        birthYear: parseYear(c['Year of Birth']),
        house: c.House,
      };
      characterMap.set(normalizeName(name), character);
    }
  });

  // Sort duels chronologically
  const sortedRawDuels = duelsDataRaw
    .filter(d => d.Type && d.Type.toLowerCase().includes('duel'))
    .sort((a, b) => {
      const yearA = parseYear(a['Date (in-game)']);
      const yearB = parseYear(b['Date (in-game)']);
      if (yearA !== yearB) return yearA - yearB;
      return parseMoon(a['Date (in-game)']) - parseMoon(b['Date (in-game)']);
    });

  // Per-character history state (built up as we process duels chronologically)
  const histories = new Map<string, CharHistory>();
  const getHistory = (normName: string): CharHistory => {
    if (!histories.has(normName)) histories.set(normName, makeHistory());
    return histories.get(normName)!;
  };

  // Set initial lastEffectiveBonusName for characters with manual starting bonuses
  // so the FIRST duel doesn't appear as a "gain" for a pre-existing bonus.
  for (const [normName, bonus] of Object.entries(MANUAL_STARTING_BONUSES)) {
    getHistory(normName).lastEffectiveBonusName = bonus.name;
  }

  const snapshotsMap = new Map<string, import('../types').CharacterSnapshot[]>();

  const captureSnapshot = (normName: string, id: string, label: string, hist: CharHistory, evalYear: number | null) => {
    const pChar = characterMap.get(normName);
    if (!pChar) return;
    const currentHist = cloneHistory(hist);
    const effBonus = getEffectiveSkillBonus(normName, currentHist);
    const stats = evalYear !== null 
      ? computeStats(pChar, effBonus, currentHist, evalYear)
      : { age: null, modifiers: effBonus ? [{ name: effBonus.name, value: effBonus.value, type: 'bonus' as const, source: 'skill' as const }] : [], totalModifier: effBonus ? effBonus.value : 0 };

    if (!snapshotsMap.has(normName)) snapshotsMap.set(normName, []);
    snapshotsMap.get(normName)!.push({
      id, label,
      history: currentHist,
      modifiers: stats.modifiers,
      totalModifier: stats.totalModifier,
      age: stats.age
    });
  };

  // ── 0. Capture Initial "Starting" Snapshots ──
  characterMap.forEach((_, normName) => {
    captureSnapshot(normName, 'starting', 'Starting state (01/94 AC)', getHistory(normName), 94);
  });

  const processedDuels: ProcessedDuel[] = sortedRawDuels.map((d, index) => {
    const duelYear = parseYear(d['Date (in-game)']);
    const normP1 = normalizeName(d['Participant 1']);
    const normP2 = normalizeName(d['Participant 2']);
    const normWinner = normalizeName(d.Winner || '');

    const p1Char = characterMap.get(normP1);
    const p2Char = characterMap.get(normP2);
    const p1Hist = getHistory(normP1);
    const p2Hist = getHistory(normP2);

    // Effective bonuses BEFORE this duel (from prior history)
    const p1EffBonus = getEffectiveSkillBonus(normP1, p1Hist);
    const p2EffBonus = getEffectiveSkillBonus(normP2, p2Hist);

    // ── Compute modifiers for each participant ──────────────────────────────

    const stats1 = computeStats(p1Char, p1EffBonus, p1Hist, duelYear);
    const stats2 = computeStats(p2Char, p2EffBonus, p2Hist, duelYear);

    // ── Update history after processing this duel ───────────────────────────

    if (p1Hist.firstDuelYear === null) p1Hist.firstDuelYear = duelYear;
    if (p2Hist.firstDuelYear === null) p2Hist.firstDuelYear = duelYear;

    p1Hist.totalDuels++;
    p2Hist.totalDuels++;

    const p1Won = normWinner === normP1;
    const p2Won = normWinner === normP2;

    if (p1Won) p1Hist.totalWins++;
    if (p2Won) p2Hist.totalWins++;

    // Update P1's record vs primary character P2
    if (p2Char) {
      p1Hist.distinctPrimaryOpponentsDueled.add(normP2);
      if (p1Won) {
        p1Hist.winsAgainstPrimary++;
        const p2EffLevel = p2EffBonus?.value ?? 0;
        if (p2EffLevel > 0) {
          p1Hist.winsAgainstSkillLevel.set(p2EffLevel, (p1Hist.winsAgainstSkillLevel.get(p2EffLevel) ?? 0) + 1);
        }
        if (stats1.totalPenalty === 0) {
          p1Hist.hasWonNoPenaltyAgainstPrimary = true;
        }
      }
    }

    // Update P2's record vs primary character P1
    if (p1Char) {
      p2Hist.distinctPrimaryOpponentsDueled.add(normP1);
      if (p2Won) {
        p2Hist.winsAgainstPrimary++;
        const p1EffLevel = p1EffBonus?.value ?? 0;
        if (p1EffLevel > 0) {
          p2Hist.winsAgainstSkillLevel.set(p1EffLevel, (p2Hist.winsAgainstSkillLevel.get(p1EffLevel) ?? 0) + 1);
        }
        if (stats2.totalPenalty === 0) {
          p2Hist.hasWonNoPenaltyAgainstPrimary = true;
        }
      }
    }

    // Parse manual gains from spreadsheet columns (P1 Gained / P2 Gained)
    const p1ManualGain = parseManualGain(d['P1 Gained']);
    const p2ManualGain = parseManualGain(d['P2 Gained']);
    if (p1ManualGain) p1Hist.accumulatedManualModifiers.push(p1ManualGain);
    if (p2ManualGain) p2Hist.accumulatedManualModifiers.push(p2ManualGain);

    // Detect newly earned bonuses by comparing effective bonus after update
    const p1EffBonusAfter = getEffectiveSkillBonus(normP1, p1Hist);
    const p2EffBonusAfter = getEffectiveSkillBonus(normP2, p2Hist);

    const p1Gained: GainedModifier[] = [];
    const p2Gained: GainedModifier[] = [];

    if (p1EffBonusAfter?.name !== p1Hist.lastEffectiveBonusName) {
      if (p1EffBonusAfter) {
        p1Gained.push({ name: p1EffBonusAfter.name, value: p1EffBonusAfter.value, type: 'bonus', source: 'skill' });
      }
      p1Hist.lastEffectiveBonusName = p1EffBonusAfter?.name ?? null;
    }
    if (p2EffBonusAfter?.name !== p2Hist.lastEffectiveBonusName) {
      if (p2EffBonusAfter) {
        p2Gained.push({ name: p2EffBonusAfter.name, value: p2EffBonusAfter.value, type: 'bonus', source: 'skill' });
      }
      p2Hist.lastEffectiveBonusName = p2EffBonusAfter?.name ?? null;
    }

    if (p1ManualGain) p1Gained.push({ ...p1ManualGain, source: 'manual' });
    if (p2ManualGain) p2Gained.push({ ...p2ManualGain, source: 'manual' });

    const currentDuel = {
      id: `duel-${index}`,
      date: d['Date (in-game)'],
      year: duelYear,
      moon: parseMoon(d['Date (in-game)']),
      event: d.Event,
      type: d.Type,
      participant1: d['Participant 1'],
      participant2: d['Participant 2'],
      winner: d.Winner,
      outcome: d.Outcome,
      p1Age: stats1.age,
      p2Age: stats2.age,
      p1Modifiers: stats1.modifiers,
      p2Modifiers: stats2.modifiers,
      p1TotalBonus: stats1.totalBonus,
      p1TotalPenalty: stats1.totalPenalty,
      p1TotalModifier: stats1.totalModifier,
      p2TotalBonus: stats2.totalBonus,
      p2TotalModifier: stats2.totalModifier,
      p1Gained,
      p2Gained,
      p1DuelsFought: p1Hist.totalDuels,
      p1DuelsWon: p1Hist.totalWins,
      p2DuelsFought: p2Hist.totalDuels,
      p2DuelsWon: p2Hist.totalWins,
    } as ProcessedDuel;

    // ── 2. Capture Duel Snapshots ──
    captureSnapshot(normP1, currentDuel.id, `${duelYear} AC: vs ${d['Participant 2']}`, p1Hist, duelYear);
    captureSnapshot(normP2, currentDuel.id, `${duelYear} AC: vs ${d['Participant 1']}`, p2Hist, duelYear);

    return currentDuel;
  });

  // ── 3. Capture Final "Current" Snapshots ──
  const currentYear = parseYear(currentDateStr);
  characterMap.forEach((_, normName) => {
    captureSnapshot(normName, 'current', 'Current state', getHistory(normName), currentYear);
  });

  // Build the allFighters list with their final (post-all-duels) effective bonus
  const fightersWithDuels = new Set(histories.keys());
  const fightersWithBonuses = new Set(Object.keys(MANUAL_STARTING_BONUSES));

  const allFighters: Character[] = Array.from(characterMap.values())
    .filter(c => {
      const norm = normalizeName(c.fullName);
      return fightersWithDuels.has(norm) || fightersWithBonuses.has(norm);
    })
    .map(c => {
      const norm = normalizeName(c.fullName);
      const hist = getHistory(norm);
      const finalBonus = getEffectiveSkillBonus(norm, hist);

      // Compute current modifiers as of the current date
      const currentYear = parseYear(currentDateStr);
      const stats = computeStats(c, finalBonus, hist, currentYear);

      return { 
        ...c, 
        skillBonus: finalBonus, 
        currentModifiers: stats.modifiers, 
        currentTotal: stats.totalModifier,
        totalDuels: hist.totalDuels,
        totalWins: hist.totalWins,
        careerHistory: hist,
        snapshots: snapshotsMap.get(norm) || []
      };
    });

  return { duels: processedDuels, currentDate: currentDateStr, allFighters };
};
