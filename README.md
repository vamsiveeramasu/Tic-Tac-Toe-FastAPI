# 🎮 Tic Tac Toe — Full-Stack Web App  
### FastAPI • React • TypeScript • SQLite • Tailwind • Vite

A complete full-stack Tic Tac Toe game featuring:

- ⚡ **FastAPI backend** (Python)
- 🗄️ **SQLite database** (persistent game + move history)
- 🎨 **React + TypeScript** UI (Vite)
- 💅 **Tailwind CSS styling**
- 🤖 **Random computer opponent**
- 🧠 **Winner detection + winning-line highlights**
- 📜 **Full game history + per-game move list**

---

# 📦 Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- Pydantic models
- Uvicorn ASGI server

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

---

# 📁 Project Structure

EthycaCodingChallenge/
│
├── tictactoe.py # FastAPI backend (uses SQLite)
├── tictactoe.db # SQLite file (auto-created)
├── .venv/ # Python virtual environment (ignored)
│
├── tic-tac-toe-ui-ts/ # Frontend (React + TypeScript + Tailwind)
│ ├── src/
│ │ ├── App.tsx
│ │ ├── api.ts
│ │ ├── main.tsx
│ │ └── index.css
│ ├── package.json
│ ├── tailwind.config.js
│ └── postcss.config.js
│
└── README.md


---

# 🚀 Getting Started (COMPLETE SETUP)

Below is the **full setup guide** for backend + frontend.

---

# 🛠 1. BACKEND SETUP (FastAPI + SQLite)

## 1️⃣ Install Python 3.10+

Verify:

```bash
2️⃣ Create & activate a virtual environment

Run these in the project root:

python3 -m venv .venv


Activate it:

macOS / Linux:
source .venv/bin/activate

Windows:
.venv\Scripts\activate


You should now see:

(.venv) your-terminal-here

3️⃣ Install backend dependencies

Inside the activated venv:

pip install fastapi uvicorn sqlalchemy

4️⃣ Run the backend

From project root:

uvicorn tictactoe:app --reload


Backend runs at:

http://localhost:8000

API Documentation:
http://localhost:8000/docs


A SQLite DB file is automatically created as:

tictactoe.db

🖥 2. FRONTEND SETUP (React + TypeScript + Vite + Tailwind)

Open a new terminal tab/window.
DO NOT close the backend.

Then:

cd tic-tac-toe-ui-ts

1️⃣ Install Node dependencies
npm install

2️⃣ Run the frontend
npm run dev


You will see:

  ➜  Local:   http://localhost:5173/


Open in your browser:

http://localhost:5173

🔗 3. BACKEND ↔ FRONTEND Integration

Frontend calls backend at:

http://localhost:8000


Backend allows the frontend through CORS:

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


This enables seamless API communication.

🎮 4. Gameplay & Features
✔ Start a new game
✔ Human selects a board cell
✔ Computer plays a random valid move
✔ Board updates in real time
✔ Winner/draw detection
✔ Winning-line highlight
✔ View move history of:

current game

any past game (click in sidebar)

✔ Persistent storage (SQLite)
✔ UI auto-refreshes on every move
🧪 5. API ENDPOINTS (FOR REFERENCE)
POST /games

Create a new game.

GET /games

List all games (chronological).

GET /games/{game_id}

Get full game state.

POST /games/{game_id}/moves

Make a player move → computer responds.

GET /games/{game_id}/moves

Return move history for that game.

🐞 6. TROUBLESHOOTING
❗ Tailwind not working

Make sure:

index.css includes:

@tailwind base;
@tailwind components;
@tailwind utilities;


main.tsx imports it:

import "./index.css";


You restarted dev server:

npm run dev

❗ Module not found: tailwindcss

Reinstall Tailwind v3:

npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@3 postcss autoprefixer

❗ uvicorn: command not found

You forgot to activate your venv:

source .venv/bin/activate

❗ "Address already in use" for port 8000

Find the process:

lsof -i :8000


Kill it:

kill -9 <PID>

❗ White screen in React

Check browser console:

Usually a missing type export in api.ts

Or a bad import path in App.tsx

