from flask import Flask, jsonify, abort
from flask_caching import Cache
import requests

app = Flask(__name__)

# Default cache timeout: 1 hour in seconds
TIMEOUT = 60 * 60
# In-memory cache for endpoint responses
cache = Cache(
    app,
    config={
        "CACHE_TYPE": "SimpleCache",
        "CACHE_DEFAULT_TIMEOUT": TIMEOUT
    },
)


GITHUB_RAW_BASE = (
    "https://raw.githubusercontent.com/D4RKONION/FAT/main/src/js/constants"
)

GAMES = {
    "sf6": {
        "fullName": "Street Fighter 6",
        "abbrName": "SF6",
        "details_path": "gamedetails/SF6GameDetails.json",
        "framedata_path": "framedata/SF6FrameData.json",
    },
    "ggst": {
        "fullName": "Guilty Gear Strive",
        "abbrName": "GGST",
        "details_path": "gamedetails/GGSTGameDetails.json",
        "framedata_path": "framedata/GGSTFrameData.json",
    },
    "2xko": {
        "fullName": "2XKO",
        "abbrName": "2XKO",
        "details_path": "gamedetails/2XKOGameDetails.json",
        "framedata_path": "framedata/2XKOFrameData.json",
    },
}


_DATA_CACHE: dict[str, dict] = {}


def _fetch_json(url: str) -> dict:
    """Fetch JSON from a URL with basic error handling."""
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Failed to fetch data from {url}") from exc

    try:
        return resp.json()
    except ValueError as exc:
        raise RuntimeError(f"Invalid JSON received from {url}") from exc


def _load_game_data(game_id: str) -> dict:
    """
    Load and cache game metadata and frame data for the given game_id.

    Returns a dict with keys:
      - details: game details JSON
      - framedata: frame data JSON
    """
    if game_id in _DATA_CACHE:
        return _DATA_CACHE[game_id]

    game_cfg = GAMES.get(game_id)
    if not game_cfg:
        raise KeyError(f"Unknown game id: {game_id}")

    details_url = f"{GITHUB_RAW_BASE}/{game_cfg['details_path']}"
    framedata_url = f"{GITHUB_RAW_BASE}/{game_cfg['framedata_path']}"

    details = _fetch_json(details_url)
    framedata = _fetch_json(framedata_url)

    _DATA_CACHE[game_id] = {"details": details, "framedata": framedata}
    return _DATA_CACHE[game_id]


@app.route("/games", methods=["GET"])
@cache.cached(timeout=TIMEOUT)
def list_games():
    """Return basic info for all supported games."""
    games_list = []
    for game_id, cfg in GAMES.items():
        games_list.append(
            {
                "id": game_id,
                "fullName": cfg["fullName"],
                "abbrName": cfg["abbrName"],
            }
        )
    return jsonify(games_list)


@app.route("/games/<game_id>", methods=["GET"])
@cache.cached(timeout=60 * 60)
def get_game_details(game_id: str):
    """Return full game details JSON for a specific game."""
    if game_id not in GAMES:
        abort(404, description="Game not found")

    try:
        data = _load_game_data(game_id)
    except RuntimeError as exc:
        abort(502, description=str(exc))

    return jsonify(
        {
            "id": game_id,
            "fullName": data["details"].get("fullName"),
            "abbrName": data["details"].get("abbrName"),
            "characterList": data["details"].get("characterList", []),
            "characterStates": data["details"].get("characterStates", []),
            "specificCharacterStates": data["details"].get(
                "specificCharacterStates", {}
            ),
            "universalDataPoints": data["details"].get("universalDataPoints", {}),
            "statsPoints": data["details"].get("statsPoints", {}),
        }
    )


@app.route("/games/<game_id>/characters", methods=["GET"])
@cache.cached(timeout=TIMEOUT)
def list_characters(game_id: str):
    """Return the character list for a specific game."""
    if game_id not in GAMES:
        abort(404, description="Game not found")

    try:
        data = _load_game_data(game_id)
    except RuntimeError as exc:
        abort(502, description=str(exc))

    characters = data["details"].get("characterList", [])
    return jsonify(characters)


@app.route("/games/<game_id>/characters/<character_name>/moves", methods=["GET"])
@cache.cached(timeout=TIMEOUT)
def get_character_moves(game_id: str, character_name: str):
    """
    Return all moves for a given character in a given game.

    character_name should match the key used in the frame data JSON.
    """
    if game_id not in GAMES:
        abort(404, description="Game not found")

    try:
        data = _load_game_data(game_id)
    except RuntimeError as exc:
        abort(502, description=str(exc))

    framedata = data.get("framedata", {})
    char_data = framedata.get(character_name)
    if not char_data:
        abort(404, description="Character not found in frame data")

    # The FAT JSON groups moves under the "moves" key, which contains
    # categories like "normal", "special", etc. We return that subtree.
    moves = char_data.get("moves", {})
    return jsonify(
        {
            "gameId": game_id,
            "character": character_name,
            "moves": moves,
        }
    )


if __name__ == "__main__":
    # Default development server (for now localhost:8000)
    app.run(host="0.0.0.0", port=8000, debug=True)

