export interface Duel {
  date: string;
  year: number;
  moon: number;
  event: string;
  type: string;
  participant1: string;
  participant2: string;
  winner: string;
  outcome: string;
}

export interface Character {
  id: number;
  fullName: string;
  birthYear: number;
  house: string;
  ageFromSheet?: number;
  isDead?: boolean;
  skillBonus?: { name: string; value: number } | null;
  currentModifiers?: Modifier[];
  currentTotal?: number;
  totalDuels?: number;
  totalWins?: number;
  careerHistory?: CharHistory;
  snapshots?: CharacterSnapshot[];
}

export interface CharacterSnapshot {
  id: string;
  label: string;
  history: CharHistory;
  modifiers: Modifier[];
  totalModifier: number;
  age: number | null;
  isDead?: boolean;
}

export interface CharHistory {
  totalDuels: number;
  totalWins: number;
  winsAgainstPrimary: number;
  distinctPrimaryOpponentsDueled: Set<string>;
  winsAgainstSkillLevel: Map<number, number>;
  hasWonNoPenaltyAgainstPrimary: boolean;
  winsWithOneHand: number;
  winsWithOneArm: number;
  accumulatedManualModifiers: Modifier[];
  firstDuelYear: number | null;
  startingSkillTierName: string | null;
  lastEffectiveBonusName: string | null;
}

export interface Modifier {
  name: string;
  value: number;
  type: 'bonus' | 'penalty';
  isOverridden?: boolean;
  source?: 'skill' | 'manual' | 'age' | 'other';
}

export interface GainedModifier extends Modifier {
  source: 'skill' | 'manual';
}

export interface ProcessedDuel extends Duel {
  id: string;
  p1Age: number | null;
  p2Age: number | null;
  p1IsDead?: boolean;
  p2IsDead?: boolean;
  p1Modifiers: Modifier[];
  p2Modifiers: Modifier[];
  p1TotalBonus: number;
  p1TotalPenalty: number;
  p1TotalModifier: number;
  p2TotalBonus: number;
  p2TotalPenalty: number;
  p2TotalModifier: number;
  p1Gained: GainedModifier[];
  p2Gained: GainedModifier[];
  p1Id: number | null;
  p2Id: number | null;
  p1DuelsFought: number;
  p1DuelsWon: number;
  p2DuelsFought: number;
  p2DuelsWon: number;
}
