## Fighting Game Data Scraper (Flask) v1.0

This backend exposes fighting game data (games, characters, and move lists) for **SF6**, **GGST**, and **2XKO** by scraping JSON data from the public FAT repository:

- `https://github.com/D4RKONION/FAT`

It uses the `GameDetails` and `FrameData` JSON files from:

- `src/js/constants/gamedetails/`
- `src/js/constants/framedata/`

This is a simple Flask backend that exposes the data via a REST API.

The data is (in-memory) cached for 1 hour to reduce the load on the server.
We plan to have user caching as well (TanStack Query is my suggestion).

WARNING: Currently, this data is taking in too much (all the) information 
from the FAT repo and is not adjusted for our website. This will be solved 
by next week, probably over the weekend even.

### Setup

```bash
python -m venv .venv
.venv\Scripts\activate  # on Windows
pip install -r requirements.txt
python app.py
```

The server will start on `http://localhost:5000`.

### Endpoints

- **GET** `/games`  
  Returns a list of supported games:
  - `id` (e.g. `sf6`, `ggst`, `2xko`)
  - `fullName`
  - `abbrName`

- **GET** `/games/<game_id>`  
  Returns game details including:
  - `fullName`
  - `abbrName`
  - `characterList`
  - `characterStates`
  - `specificCharacterStates`
  - `universalDataPoints`
  - `statsPoints`

- **GET** `/games/<game_id>/characters`  
  Returns the character list for the given game.

- **GET** `/games/<game_id>/characters/<character_name>/moves`  
  Returns the moves for a specific character in a game, using FAT's frame data JSON.
  - `gameId`
  - `character`
  - `moves`: nested object of move categories (e.g. `normal`, `special`) and individual moves.

**Notes**

- `game_id` must be one of: `sf6`, `ggst`, `2xko`.
- `character_name` must match the character key used in the FAT frame data JSON (e.g. `Ahri`, `Ryu`, `Nagoriyuki`), URL-encoded if it contains spaces or punctuation.

