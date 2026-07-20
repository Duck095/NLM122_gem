export type GamePhase =
  | "lobby"
  | "quiz"
  | "auction"
  | "event"
  | "strategy"
  | "results";

export type QuizStatus =
  | "idle"
  | "preview"
  | "buzzing"
  | "answering"
  | "mandatory"
  | "blindbox"
  | "resolved";

export type AuctionStatus = "idle" | "open" | "closed";
export type EventStatus = "idle" | "open" | "resolved";
export type StrategyStatus = "idle" | "open" | "resolved";

export type IndicatorKey =
  | "economy"
  | "technology"
  | "autonomy"
  | "equality"
  | "sustainability";

export interface Indicators {
  economy: number;
  technology: number;
  autonomy: number;
  equality: number;
  sustainability: number;
}

export type TacticalCardType =
  | "shield"
  | "project_recovery"
  | "auction_discount_50"
  | "auction_discount_30";

export interface TacticalCard {
  id: string;
  type: TacticalCardType;
  name: string;
  description: string;
  used: boolean;
  acquiredAt: number;
}

export interface MemberPublic {
  id: string;
  name: string;
  joinedAt: number;
}

export interface ProjectOwned {
  id: string;
  name: string;
  acquiredPrice: number;
  paidPrice: number;
  acquiredAt: number;
  effects: Partial<Indicators>;
}

export interface TeamPublic {
  id: string;
  code: string;
  name: string;
  leaderName: string;
  memberLimit: number;
  members: MemberPublic[];
  color: string;
  capital: number;
  indicators: Indicators;
  cards: TacticalCard[];
  projects: ProjectOwned[];
  correctAnswers: number;
  score: number;
  rank: number;
}

export interface QuestionPublic {
  id: string;
  number: number;
  prompt: string;
  options?: string[];
  explanation?: string;
  correctIndex?: number;
}

export interface BlindBoxPublic {
  index: number;
  opened: boolean;
  openedByTeamId?: string;
  rewardName?: string;
  rewardDescription?: string;
}

export interface QuizPublicState {
  questionIndex: number;
  question: QuestionPublic | null;
  status: QuizStatus;
  answeringTeamId: string | null;
  eliminatedTeamIds: string[];
  buzzRound: number;
  discussionDeadline: number | null;
  mandatoryDeadline: number | null;
  pendingBlindBoxTeamId: string | null;
  lastOutcome: {
    type: "correct" | "wrong" | "timeout" | "no_answer" | "info";
    message: string;
    teamId?: string;
  } | null;
}

export interface ProjectDefinitionPublic {
  id: string;
  name: string;
  description: string;
  startPrice: number;
  effects: Partial<Indicators>;
}

export interface AuctionBidPublic {
  teamId: string;
  amount: number;
  at: number;
}

export interface AuctionPublicState {
  status: AuctionStatus;
  projectIndex: number;
  project: ProjectDefinitionPublic | null;
  currentBid: number;
  leaderTeamId: string | null;
  minIncrement: number;
  bids: AuctionBidPublic[];
  selectedDiscountCardIdByTeam: Record<string, string | null>;
  lastResult: {
    teamId: string;
    projectName: string;
    bid: number;
    paid: number;
    discountPercent: number;
  } | null;
}

export interface EventOptionPublic {
  id: string;
  title: string;
  description: string;
  capitalCost: number;
  effects: Partial<Indicators>;
}

export interface EventDefinitionPublic {
  id: string;
  name: string;
  description: string;
  options: EventOptionPublic[];
}

export interface EventPublicState {
  status: EventStatus;
  eventIndex: number;
  event: EventDefinitionPublic | null;
  choicesByTeam: Record<string, { optionId: string; cardId: string | null }>;
  resolvedTeamIds: string[];
}

export interface StrategyPackagePublic {
  id: string;
  name: string;
  description: string;
  cost: number;
  effects: Partial<Indicators>;
}

export interface StrategyPublicState {
  status: StrategyStatus;
  choicesByTeam: Record<string, string>;
  resolvedTeamIds: string[];
  packages: StrategyPackagePublic[];
}

export interface GameLogPublic {
  id: string;
  at: number;
  message: string;
  tone: "info" | "success" | "warning";
}

export interface RoomPublicState {
  code: string;
  title: string;
  className: string;
  status: "waiting" | "active" | "finished";
  locked: boolean;
  phase: GamePhase;
  maxTeams: number;
  defaultTeamSize: number;
  teams: TeamPublic[];
  quiz: QuizPublicState;
  blindBoxes: BlindBoxPublic[];
  auction: AuctionPublicState;
  event: EventPublicState;
  strategy: StrategyPublicState;
  logs: GameLogPublic[];
  createdAt: number;
  updatedAt: number;
}

export type SocketRole = "host" | "player" | "screen";

export interface SocketAuthPayload {
  roomCode: string;
  role: SocketRole;
  token?: string;
  teamId?: string;
}

export interface AckResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
  economy: "Tăng trưởng kinh tế",
  technology: "Hiện đại hóa công nghệ",
  autonomy: "Tự chủ nội địa",
  equality: "Công bằng xã hội",
  sustainability: "Phát triển bền vững"
};
