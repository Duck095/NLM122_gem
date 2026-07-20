export function hostKey(roomCode: string): string {
  return `mln122:host:${roomCode}`;
}

export function playerKey(roomCode: string): string {
  return `mln122:player:${roomCode}`;
}

export function saveHostSession(roomCode: string, hostToken: string): void {
  localStorage.setItem(hostKey(roomCode), hostToken);
}

export function readHostSession(roomCode: string): string | null {
  return localStorage.getItem(hostKey(roomCode));
}

export function savePlayerSession(roomCode: string, data: { teamId: string; playerToken: string }): void {
  localStorage.setItem(playerKey(roomCode), JSON.stringify(data));
}

export function readPlayerSession(roomCode: string): { teamId: string; playerToken: string } | null {
  const raw = localStorage.getItem(playerKey(roomCode));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { teamId: string; playerToken: string };
  } catch {
    return null;
  }
}
