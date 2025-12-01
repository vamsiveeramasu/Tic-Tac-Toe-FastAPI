import { useEffect, useMemo, useState } from "react";

// 👇 type-only imports (removed at compile time, not loaded at runtime)
import type {
  Board,
  GameState,
  GameStatus,
  GameSummary,
  Move,
} from "./api";

// 👇 value imports (actual JS functions used at runtime)
import {
  createGame,
  fetchGame,
  fetchGames,
  fetchMoves,
  makeMove,
} from "./api";

type Coord = [number, number];

interface WinningLineResult {
  player: "X" | "O";
  line: Coord[];
}

function getWinningLine(board: Board): WinningLineResult | null {
  const lines: Coord[][] = [
    // rows
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // cols
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // diagonals
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    const v1 = board[a[0]][a[1]];
    const v2 = board[b[0]][b[1]];
    const v3 = board[c[0]][c[1]];

    if (v1 !== " " && v1 === v2 && v2 === v3) {
      const player = v1 === "X" ? "X" : "O";
      return { player, line };
    }
  }

  return null;
}

function formatStatus(status: GameStatus): string {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "human_won":
      return "You won";
    case "computer_won":
      return "Computer won";
    case "draw":
      return "Draw";
    default:
      return status;
  }
}

function App() {
  // Current game (board you play on)
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [currentMoves, setCurrentMoves] = useState<Move[]>([]);

  // All games (sidebar)
  const [games, setGames] = useState<GameSummary[]>([]);

  // Selected game (any game from list)
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameState | null>(null);
  const [selectedGameMoves, setSelectedGameMoves] = useState<Move[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loadingMove, setLoadingMove] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSelectedGame, setLoadingSelectedGame] = useState(false);

  useEffect(() => {
    loadGames().finally(() => setLoadingInitial(false));
  }, []);

  async function loadGames() {
    try {
      const data = await fetchGames();
      setGames(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load games");
    }
  }

  async function handleNewGame() {
    setError(null);
    try {
      const game = await createGame();
      setCurrentGame(game);
      setCurrentMoves(game.moves);

      setSelectedGameId(game.game_id);
      setSelectedGame(game);
      setSelectedGameMoves(game.moves);

      await loadGames();
    } catch (err: any) {
      setError(err.message ?? "Failed to create game");
    }
  }

  async function handleCellClick(x: number, y: number) {
    if (!currentGame) return;
    if (currentGame.status !== "in_progress") {
      setError("Game is already finished. Start a new game.");
      return;
    }
    if (currentGame.board[x][y] !== " ") {
      setError("That square is already taken.");
      return;
    }

    setError(null);
    setLoadingMove(true);
    try {
      const updated = await makeMove(currentGame.game_id, x, y);
      setCurrentGame(updated);
      setCurrentMoves(updated.moves);

      if (selectedGameId === updated.game_id) {
        setSelectedGame(updated);
        setSelectedGameMoves(updated.moves);
      }

      await loadGames();
    } catch (err: any) {
      setError(err.message ?? "Failed to make move");
    } finally {
      setLoadingMove(false);
    }
  }

  async function handleSelectGame(gameId: number) {
    setError(null);
    setSelectedGameId(gameId);
    setLoadingSelectedGame(true);
    try {
      const game = await fetchGame(gameId);
      const mv = await fetchMoves(gameId);
      setSelectedGame(game);
      setSelectedGameMoves(mv);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch game details");
    } finally {
      setLoadingSelectedGame(false);
    }
  }

  const winningLine = useMemo(() => {
    if (!currentGame) return null;
    if (currentGame.status === "in_progress") return null;
    return getWinningLine(currentGame.board);
  }, [currentGame]);

  function renderStatusText() {
    if (!currentGame) return "No active game. Click “New Game” to start.";
    switch (currentGame.status) {
      case "in_progress":
        return "Your turn! Click a square to play.";
      case "human_won":
        return "🎉 You won! Nice.";
      case "computer_won":
        return "💻 The computer won this one.";
      case "draw":
        return "Nobody won. It’s a draw.";
      default:
        return currentGame.status;
    }
  }

  const isCurrentGameOver =
    currentGame &&
    (currentGame.status === "human_won" ||
      currentGame.status === "computer_won" ||
      currentGame.status === "draw");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
          Tic Tac Toe
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          FastAPI backend · React + TypeScript + Tailwind frontend
        </p>
      </header>

      <main className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* Main panel */}
        <section className="flex-1 bg-slate-900/80 border border-slate-700/70 rounded-2xl shadow-2xl shadow-slate-950/60 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-semibold">Current Game</h2>
              <p className="text-xs text-slate-400">
                {currentGame
                  ? `Game #${currentGame.game_id} · ${formatStatus(
                      currentGame.status
                    )}`
                  : "No game in progress"}
              </p>
            </div>
            <button
              onClick={handleNewGame}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-400 bg-cyan-500/90 text-slate-950 text-sm font-medium px-3 py-1.5 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition"
            >
              <span className="text-base leading-none">＋</span>
              New Game
            </button>
          </div>

          <div className="flex items-start gap-2 mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-wide">
              Status
            </span>
            <span className="text-sm">{renderStatusText()}</span>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-rose-400/70 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {loadingMove && (
            <div className="mb-3 rounded-xl border border-cyan-400/70 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Making move…</span>
            </div>
          )}

          <div className="flex justify-center my-4">
            {currentGame ? (
              <GameBoard
                board={currentGame.board}
                disabled={
                  loadingMove || currentGame.status !== "in_progress"
                }
                winningLine={winningLine}
                status={currentGame.status}
                onCellClick={handleCellClick}
              />
            ) : (
              <div className="w-full max-w-sm rounded-xl border border-dashed border-slate-600/80 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-400">
                Click{" "}
                <span className="font-semibold text-cyan-300">New Game</span>{" "}
                to start playing.
              </div>
            )}
          </div>

          {isCurrentGameOver && winningLine && (
            <div className="mt-2 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100 animate-[pulse_1.8s_ease-in-out_infinite]">
                <span>✨</span>
                <span>
                  Winning line for{" "}
                  {winningLine.player === "X" ? "you (X)" : "computer (O)"}!
                </span>
              </div>
            </div>
          )}

          {/* Move history for current game */}
          <section className="mt-5 pt-4 border-t border-slate-700/70">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold">
                  Move History (Current Game)
                </h3>
                <p className="text-xs text-slate-400">
                  {currentGame
                    ? `Game #${currentGame.game_id}`
                    : "No current game yet"}
                </p>
              </div>
            </div>

            {currentGame ? (
              <MoveList moves={currentMoves} />
            ) : (
              <p className="text-xs text-slate-500">
                Start a new game to see its moves here.
              </p>
            )}
          </section>

          {/* Selected game moves (any game) */}
          <section className="mt-5 pt-4 border-t border-slate-700/70">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold">
                  Selected Game Moves (Any Game)
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedGameId
                    ? `Game #${selectedGameId}${
                        currentGame &&
                        selectedGameId === currentGame.game_id
                          ? " (same as current)"
                          : ""
                      }`
                    : "Click a game on the right to inspect its moves."}
                </p>
              </div>
            </div>

            {loadingSelectedGame ? (
              <p className="text-xs text-slate-500">Loading game details…</p>
            ) : selectedGameId ? (
              selectedGameMoves.length > 0 ? (
                <MoveList moves={selectedGameMoves} />
              ) : (
                <p className="text-xs text-slate-500">
                  No moves yet for this game.
                </p>
              )
            ) : (
              <p className="text-xs text-slate-500">
                Select a game from the sidebar to see its full move list.
              </p>
            )}
          </section>
        </section>

        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-slate-900/80 border border-slate-700/70 rounded-2xl shadow-2xl shadow-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold">All Games (session)</h2>
              <p className="text-xs text-slate-400">
                Click a game to inspect its move history.
              </p>
            </div>
            <button
              onClick={loadGames}
              className="text-xs rounded-full border border-slate-600 px-2 py-1 text-slate-300 hover:border-cyan-400 hover:text-cyan-200 transition"
            >
              Refresh
            </button>
          </div>

          {loadingInitial ? (
            <p className="text-xs text-slate-500">Loading games…</p>
          ) : (
            <GameList
              games={games}
              selectedGameId={selectedGameId}
              onSelectGame={handleSelectGame}
            />
          )}
        </aside>
      </main>
    </div>
  );
}

interface GameBoardProps {
  board: Board;
  disabled: boolean;
  winningLine: WinningLineResult | null;
  status: GameStatus;
  onCellClick: (x: number, y: number) => void;
}

function GameBoard({
  board,
  disabled,
  winningLine,
  status,
  onCellClick,
}: GameBoardProps) {
  const isGameOver =
    status === "human_won" || status === "computer_won" || status === "draw";

  return (
    <div
      className={[
        "grid grid-cols-3 gap-2 p-3 rounded-3xl border border-slate-700/80",
        "bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl shadow-slate-950/70",
        disabled ? "opacity-80" : "",
      ].join(" ")}
    >
      {board.map((row, x) =>
        row.map((cell, y) => {
          const isWinningCell =
            winningLine?.line.some(([cx, cy]) => cx === x && cy === y) ?? false;

          const baseClasses =
            "h-20 w-20 md:h-24 md:w-24 rounded-2xl border flex items-center justify-center text-3xl md:text-4xl font-bold transition-all";

          const colorClasses =
            cell === "X"
              ? "text-cyan-300 border-cyan-500/50 shadow-[0_0_24px_rgba(34,211,238,0.4)]"
              : cell === "O"
              ? "text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_24px_rgba(217,70,239,0.4)]"
              : "text-slate-400 border-slate-600/60 hover:border-cyan-400/70 hover:shadow-[0_0_16px_rgba(56,189,248,0.35)]";

          const stateClasses = [
            isWinningCell
              ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-[pulse_1.3s_ease-in-out_infinite]"
              : "",
            cell === " " && !isGameOver && !disabled
              ? "cursor-pointer hover:-translate-y-0.5"
              : "cursor-default",
            disabled && !isWinningCell ? "opacity-75" : "",
          ].join(" ");

          return (
            <button
              key={`${x}-${y}`}
              disabled={disabled || cell !== " "}
              onClick={() => onCellClick(x, y)}
              className={`${baseClasses} ${colorClasses} ${stateClasses}`}
            >
              {cell === "X" ? "X" : cell === "O" ? "O" : ""}
            </button>
          );
        })
      )}
    </div>
  );
}

interface MoveListProps {
  moves: Move[];
}

function MoveList({ moves }: MoveListProps) {
  if (!moves || moves.length === 0) {
    return (
      <p className="text-xs text-slate-500">No moves yet in this game.</p>
    );
  }

  return (
    <ul className="space-y-1 text-xs">
      {moves.map((m) => (
        <li
          key={m.move_number}
          className="flex flex-col rounded-xl border border-slate-700/70 bg-slate-900/70 px-2.5 py-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">
              #{m.move_number} –{" "}
              <span className="inline-flex items-center rounded-full border border-slate-600 px-2 py-0.5 text-[0.7rem]">
                {m.player === "human" ? "You (X)" : "Computer (O)"}
              </span>
            </span>
            <span className="text-[0.7rem] text-slate-400">
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <span className="text-[0.7rem] text-slate-400 mt-0.5">
            Move to ({m.x}, {m.y})
          </span>
        </li>
      ))}
    </ul>
  );
}

interface GameListProps {
  games: GameSummary[];
  selectedGameId: number | null;
  onSelectGame: (id: number) => void;
}

function GameList({ games, selectedGameId, onSelectGame }: GameListProps) {
  if (!games || games.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No games yet in this session. Start a new one!
      </p>
    );
  }

  return (
    <ul className="space-y-1 text-xs">
      {games.map((g) => {
        const isSelected = g.game_id === selectedGameId;
        return (
          <li key={g.game_id}>
            <button
              onClick={() => onSelectGame(g.game_id)}
              className={[
                "w-full text-left rounded-xl border px-2.5 py-2 transition",
                "border-slate-700/70 bg-slate-900/60 hover:border-cyan-400/80 hover:bg-slate-900",
                isSelected
                  ? "border-cyan-400/90 bg-slate-900/90 shadow-[0_0_18px_rgba(56,189,248,0.45)]"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Game #{g.game_id}</span>
                <span className="text-[0.7rem] text-slate-400">
                  {formatStatus(g.status)}
                </span>
              </div>
              <div className="text-[0.7rem] text-slate-500 mt-0.5">
                {new Date(g.created_at).toLocaleString()}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default App;
