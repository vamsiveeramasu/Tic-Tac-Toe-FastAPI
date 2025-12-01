// src/api.ts

const API_BASE = "http://localhost:8000";

export type PlayerType = "human" | "computer";
export type GameStatus = "in_progress" | "human_won" | "computer_won" | "draw";
export type Cell = " " | "X" | "O";
export type Board = Cell[][];

export interface Move {
  move_number: number;
  player: PlayerType;
  x: number;
  y: number;
  timestamp: string; // ISO string from backend
}

export interface GameState {
  game_id: number;
  board: Board;
  status: GameStatus;
  winner: PlayerType | null;
  moves: Move[];
}

export interface GameSummary {
  game_id: number;
  created_at: string;
  status: GameStatus;
}

export async function createGame(): Promise<GameState> {
  const res = await fetch(`${API_BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create game");
  return res.json();
}

export async function makeMove(
  gameId: number,
  x: number,
  y: number
): Promise<GameState> {
  const res = await fetch(`${API_BASE}/games/${gameId}/moves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to make move");
  }

  return res.json();
}

export async function fetchGames(): Promise<GameSummary[]> {
  const res = await fetch(`${API_BASE}/games`);
  if (!res.ok) throw new Error("Failed to fetch games");
  return res.json();
}

export async function fetchMoves(gameId: number): Promise<Move[]> {
  const res = await fetch(`${API_BASE}/games/${gameId}/moves`);
  if (!res.ok) throw new Error("Failed to fetch moves");
  return res.json();
}

export async function fetchGame(gameId: number): Promise<GameState> {
  const res = await fetch(`${API_BASE}/games/${gameId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to fetch game");
  }
  return res.json();
}
