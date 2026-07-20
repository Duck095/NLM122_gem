import type {
  AuctionPublicState,
  EventPublicState,
  GameLogPublic,
  GamePhase,
  Indicators,
  ProjectOwned,
  QuizPublicState,
  RoomPublicState,
  StrategyPublicState,
  TacticalCard,
  TeamPublic
} from "@mln122/shared";
import type { BlindRewardDefinition } from "./game-data.js";

export interface MemberInternal {
  id: string;
  name: string;
  token: string;
  joinedAt: number;
}

export interface TeamInternal extends Omit<TeamPublic, "members" | "scoreBreakdown" | "score" | "rank"> {
  members: MemberInternal[];
}

export interface BlindBoxInternal {
  index: number;
  opened: boolean;
  openedByTeamId?: string;
  reward: BlindRewardDefinition;
}

export interface QuizInternalState extends Omit<QuizPublicState, "question"> {
  question: null;
}

export interface RoomInternal {
  code: string;
  title: string;
  className: string;
  hostToken: string;
  status: "waiting" | "active" | "finished";
  locked: boolean;
  phase: GamePhase;
  maxTeams: number;
  defaultTeamSize: number;
  teams: TeamInternal[];
  quiz: QuizInternalState;
  blindBoxes: BlindBoxInternal[];
  auction: AuctionPublicState;
  event: EventPublicState;
  strategy: StrategyPublicState;
  logs: GameLogPublic[];
  createdAt: number;
  updatedAt: number;
}

export interface PersistedRoom extends RoomInternal {}

export type TeamMutation = (team: TeamInternal) => void;

export interface TeamScore {
  score: number;
  rank: number;
}

export const EMPTY_INDICATORS: Indicators = {
  economy: 0,
  technology: 0,
  autonomy: 0,
  equality: 0,
  sustainability: 0
};

export type { Indicators, ProjectOwned, TacticalCard, RoomPublicState };
