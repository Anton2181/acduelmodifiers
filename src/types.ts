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
  skillBonus?: { name: string; value: number } | null;
  currentModifiers?: Modifier[];
  currentTotal?: number;
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
}
