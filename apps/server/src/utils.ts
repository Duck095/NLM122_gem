import { customAlphabet, nanoid } from "nanoid";
import type { IndicatorKey, Indicators, ScoreBreakdown, TacticalCard, TacticalCardType } from "@mln122/shared";
import type { TeamInternal } from "./types.js";

const roomAlphabet = customAlphabet("0123456789", 6);
const teamAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

export function createRoomCode(existing: Set<string>): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const code = roomAlphabet();
    if (!existing.has(code)) return code;
  }
  throw new Error("Không thể tạo mã phòng mới");
}

export function createTeamCode(existing: Set<string>): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const code = teamAlphabet();
    if (!existing.has(code)) return code;
  }
  throw new Error("Không thể tạo mã tập đoàn mới");
}

export function createToken(): string {
  return nanoid(32);
}

export function createId(prefix: string): string {
  return `${prefix}_${nanoid(10)}`;
}

export function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function clampIndicator(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

export function applyIndicatorEffects(indicators: Indicators, effects: Partial<Indicators>): void {
  (Object.keys(effects) as IndicatorKey[]).forEach((key) => {
    const delta = Number(effects[key] ?? 0);
    indicators[key] = clampIndicator(indicators[key] + delta);
  });
}

export function teamScoreBreakdown(team: TeamInternal): ScoreBreakdown {
  const values = Object.values(team.indicators);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const spread = Math.max(...values) - Math.min(...values);
  const balanceBonus = Math.max(0, 20 - spread * 0.5);
  const projectBonus = team.projects.length * 8;
  const capitalBonus = Math.max(0, team.capital) / 100;
  const knowledgeBonus = team.correctAnswers * 2;
  const roundComponent = (value: number) => Math.round(value * 100) / 100;
  return {
    indicatorAverage: roundComponent(average),
    balanceBonus: roundComponent(balanceBonus),
    projectBonus,
    capitalBonus: roundComponent(capitalBonus),
    knowledgeBonus,
    total: Math.round((average + balanceBonus + projectBonus + capitalBonus + knowledgeBonus) * 10) / 10
  };
}

export function teamScore(team: TeamInternal): number {
  return teamScoreBreakdown(team).total;
}

export function addCard(team: TeamInternal, type: TacticalCardType, name: string, description: string): TacticalCard {
  const card: TacticalCard = {
    id: createId("card"),
    type,
    name,
    description,
    used: false,
    acquiredAt: Date.now()
  };
  team.cards.push(card);
  return card;
}

export function findUsableCard(team: TeamInternal, cardId: string | null | undefined): TacticalCard | null {
  if (!cardId) return null;
  return team.cards.find((card) => card.id === cardId && !card.used) ?? null;
}

export function markCardUsed(card: TacticalCard): void {
  card.used = true;
}

export function normalizeText(value: unknown, maxLength = 100): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}
