import { getApiBase } from "./config";

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.error || "Yêu cầu thất bại");
  }
  return payload.data;
}

export function createRoom(input: {
  title: string;
  className: string;
  maxTeams: number;
  defaultTeamSize: number;
}) {
  return request<{ roomCode: string; hostToken: string }>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getRoom(code: string) {
  return request<{
    roomCode: string;
    title: string;
    className: string;
    status: string;
    locked: boolean;
    teamCount: number;
    maxTeams: number;
    defaultTeamSize: number;
    teams: Array<{
      id: string;
      code: string;
      name: string;
      members: number;
      memberLimit: number;
      color: string;
    }>;
  }>(`/api/rooms/${encodeURIComponent(code)}`);
}

export function createTeam(
  roomCode: string,
  input: { name: string; leaderName: string; memberLimit: number; color: string }
) {
  return request<{ teamId: string; teamCode: string; playerToken: string }>(
    `/api/rooms/${encodeURIComponent(roomCode)}/teams`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function joinTeam(
  roomCode: string,
  input: { teamCode: string; playerName: string }
) {
  return request<{ teamId: string; teamCode: string; playerToken: string }>(
    `/api/rooms/${encodeURIComponent(roomCode)}/teams/join`,
    { method: "POST", body: JSON.stringify(input) }
  );
}
