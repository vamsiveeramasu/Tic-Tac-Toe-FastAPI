# Tic-Tac-Toe-FastAPI
Created a Tic Tac Toe REST API using FastAPI. 

To Run the code:

1. Install Python 3.9+

Check if Python is installed:

python3 --version


If not, download it here:
https://www.python.org/downloads/

For Homebrew users (Mac):

brew install python

2. Create a project folder
mkdir tictactoe_api
cd tictactoe_api


Place the tictactoe.py (or main.py) file inside this folder.

3. Create a virtual environment (recommended)
python3 -m venv .venv


Activate it:

Mac/Linux:
source .venv/bin/activate

Windows (PowerShell):
.venv\Scripts\activate


You should see (.venv) at the start of your terminal prompt.

4. Install dependencies

Inside the virtual environment, run:

pip install fastapi uvicorn

5. Run the FastAPI server

If the file is named tictactoe.py:

uvicorn tictactoe:app --reload


If the file is named main.py:

uvicorn main:app --reload


You should see:

Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)

6. Test the API
Open the built-in Swagger interface:
http://127.0.0.1:8000/docs

Or test using curl:
curl -X POST http://127.0.0.1:8000/games
curl http://127.0.0.1:8000/games
curl http://127.0.0.1:8000/games/1/moves

7. Stopping the server

Press:

CTRL + C


or close the terminal.


Optinally, you can run pip install -r requirements.txt

