from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional, Dict, Tuple
from datetime import datetime
import random

app = FastAPI(title="Tic Tac Toe API")

PlayerType = Literal["human", "computer"]
GameStatus = Literal["in_progress", "human_won", "computer_won", "draw"]

class MoveRequest(BaseModel):
    x: int  # row: 0-2
    y: int  # col: 0-2

class Move(BaseModel):
    move_number: int
    player: PlayerType
    x: int
    y: int
    timestamp: datetime

class GameSummary(BaseModel):
    game_id: int
    created_at: datetime
    status: GameStatus

class GameState(BaseModel):
    game_id: int
    board: List[List[str]]
    status: GameStatus
    winner: Optional[PlayerType]
    moves: List[Move]


# ---------- In-memory "database" ----------

class Game:
    def __init__(self, game_id: int):
        self.game_id = game_id
        self.board = [[" " for _ in range(3)] for _ in range(3)]
        self.moves: List[Move] = []
        self.status: GameStatus = "in_progress"
        self.created_at: datetime = datetime.utcnow()
        self.updated_at: datetime = self.created_at

    def to_state(self) -> GameState:
        winner: Optional[PlayerType] = None
        if self.status == "human_won":
            winner = "human"
        elif self.status == "computer_won":
            winner = "computer"

        return GameState(
            game_id=self.game_id,
            board=self.board,
            status=self.status,
            winner=winner,
            moves=self.moves,
        )


games: Dict[int, Game] = {}
next_game_id: int = 1


# ---------- Helper functions ----------

def check_winner(board: List[List[str]], symbol: str) -> bool:
    # Rows
    for row in board:
        if all(cell == symbol for cell in row):
            return True
    # Columns
    for c in range(3):
        if all(board[r][c] == symbol for r in range(3)):
            return True
    # Diagonals
    if board[0][0] == board[1][1] == board[2][2] == symbol:
        return True
    if board[0][2] == board[1][1] == board[2][0] == symbol:
        return True
    return False


def get_empty_cells(board: List[List[str]]) -> List[Tuple[int, int]]:
    return [(r, c) for r in range(3) for c in range(3) if board[r][c] == " "]


def update_game_status(game: Game):
    board = game.board
    # Check human win
    if check_winner(board, "X"):
        game.status = "human_won"
        return
    # Check computer win
    if check_winner(board, "O"):
        game.status = "computer_won"
        return
    # Check draw
    if not get_empty_cells(board):
        game.status = "draw"
        return
    # Otherwise still in progress
    game.status = "in_progress"


def apply_human_move(game: Game, x: int, y: int):
    # Validate coordinates
    if not (0 <= x <= 2 and 0 <= y <= 2):
        raise HTTPException(status_code=400, detail="Coordinates must be between 0 and 2.")

    # Validate empty cell
    if game.board[x][y] != " ":
        raise HTTPException(status_code=400, detail="Cell is already occupied.")

    # Place human move
    game.board[x][y] = "X"

    move_number = len(game.moves) + 1
    game.moves.append(
        Move(
            move_number=move_number,
            player="human",
            x=x,
            y=y,
            timestamp=datetime.utcnow(),
        )
    )

    game.updated_at = datetime.utcnow()


def apply_computer_move(game: Game):
    empty_cells = get_empty_cells(game.board)
    if not empty_cells:
        return  # No moves available

    x, y = random.choice(empty_cells)
    game.board[x][y] = "O"

    move_number = len(game.moves) + 1
    game.moves.append(
        Move(
            move_number=move_number,
            player="computer",
            x=x,
            y=y,
            timestamp=datetime.utcnow(),
        )
    )

    game.updated_at = datetime.utcnow()


# ---------- Endpoints ----------

@app.post("/games", response_model=GameState)
def create_game():
    global next_game_id
    game_id = next_game_id
    next_game_id += 1

    game = Game(game_id)
    games[game_id] = game

    return game.to_state()


@app.get("/games", response_model=List[GameSummary])
def list_games():
    return [
        GameSummary(
            game_id=g.game_id,
            created_at=g.created_at,
            status=g.status,
        )
        for g in sorted(games.values(), key=lambda g: g.created_at)
    ]


@app.post("/games/{game_id}/moves", response_model=GameState)
def make_move(game_id: int, move_req: MoveRequest):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found.")

    game = games[game_id]

    if game.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail=f"Game already finished with status '{game.status}'."
        )

    # ---- Human Move ----
    apply_human_move(game, move_req.x, move_req.y)
    update_game_status(game)

    if game.status != "in_progress":
        return game.to_state()

    # ---- Computer Move ----
    apply_computer_move(game)
    update_game_status(game)

    return game.to_state()


@app.get("/games/{game_id}/moves", response_model=List[Move])
def list_moves(game_id: int):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found.")

    game = games[game_id]
    return sorted(game.moves, key=lambda m: m.move_number)

