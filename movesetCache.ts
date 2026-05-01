import { supabase } from "../api/client";
import type { Move, Combo } from "../types/game";

export type MovesetData = {
  moves: Move[];
  combos: Combo[];
};

// ─── Level 1: Global — every character in the DB ───────────────────────────
const globalCache = new Map<string, MovesetData>(); // key: characterId
let globalCachePopulated = false;
let globalCacheInflight: Promise<void> | null = null;

// ─── Level 2: Per-game — all characters within one game ────────────────────
const gameCache = new Map<string, Map<string, MovesetData>>(); // gameId → characterId → data
const gameCacheInflight = new Map<string, Promise<void>>();

// ─── Level 3: Single character — most recent individual lookup ─────────────
let singleCharCache: {
  gameId: string;
  characterId: string;
  data: MovesetData;
} | null = null;

// ─── Internal helpers ──────────────────────────────────────────────────────

function promoteToL2(gameId: string, characterId: string, data: MovesetData) {
  if (!gameCache.has(gameId)) gameCache.set(gameId, new Map());
  gameCache.get(gameId)!.set(characterId, data);
}

function promoteToL3(gameId: string, characterId: string, data: MovesetData) {
  singleCharCache = { gameId, characterId, data };
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * L1 — Prefetch every character's moveset in the database.
 * Call once on app init or a "load all" action.
 * Subsequent calls are no-ops if already populated.
 */
export async function populateGlobalCache(): Promise<void> {
  if (globalCachePopulated) return;
  if (globalCacheInflight) return globalCacheInflight;

  globalCacheInflight = (async () => {
    const { data, error } = await supabase
      .from("characters")
      .select("id, game_id, moves(*), combos(*)");

    if (error) throw new Error(error.message);

    for (const char of data ?? []) {
      const entry: MovesetData = {
        moves: char.moves ?? [],
        combos: char.combos ?? [],
      };
      globalCache.set(char.id, entry);
      promoteToL2(char.game_id, char.id, entry);
    }

    globalCachePopulated = true;
  })();

  try {
    await globalCacheInflight;
  } finally {
    globalCacheInflight = null;
  }
}

/**
 * L2 — Fetch all movesets for a given game.
 * Call when a game page loads or when a game is selected in Testing Grounds.
 * Deduplicates concurrent in-flight requests for the same gameId.
 */
export async function populateGameCache(gameId: string): Promise<void> {
  if (gameCache.get(gameId)?.size) return;
  if (gameCacheInflight.has(gameId)) return gameCacheInflight.get(gameId);

  const inflight = (async () => {
    const { data, error } = await supabase
      .from("characters")
      .select("id, moves(*), combos(*)")
      .eq("game_id", gameId);

    if (error) throw new Error(error.message);

    for (const char of data ?? []) {
      const entry: MovesetData = {
        moves: char.moves ?? [],
        combos: char.combos ?? [],
      };
      promoteToL2(gameId, char.id, entry);
      globalCache.set(char.id, entry); // opportunistically fill L1
    }
  })();

  gameCacheInflight.set(gameId, inflight);
  try {
    await inflight;
  } finally {
    gameCacheInflight.delete(gameId);
  }
}

/**
 * L3 → L2 → L1 → network.
 * Returns the moveset for one character, checking every cache level
 * before falling through to a Supabase fetch.
 */
export async function getMoveset(
  gameId: string,
  characterId: string
): Promise<MovesetData> {
  // L3 check
  if (
    singleCharCache?.characterId === characterId &&
    singleCharCache?.gameId === gameId
  ) {
    return singleCharCache.data;
  }

  // L2 check
  const fromGame = gameCache.get(gameId)?.get(characterId);
  if (fromGame) {
    promoteToL3(gameId, characterId, fromGame);
    return fromGame;
  }

  // L1 check
  const fromGlobal = globalCache.get(characterId);
  if (fromGlobal) {
    promoteToL2(gameId, characterId, fromGlobal);
    promoteToL3(gameId, characterId, fromGlobal);
    return fromGlobal;
  }

  // Network fallback — single character fetch, then populate all levels
  const { data, error } = await supabase
    .from("characters")
    .select("moves(*), combos(*)")
    .eq("id", characterId)
    .eq("game_id", gameId)
    .single();

  if (error) throw new Error(error.message);

  const entry: MovesetData = {
    moves: data.moves ?? [],
    combos: data.combos ?? [],
  };

  globalCache.set(characterId, entry);
  promoteToL2(gameId, characterId, entry);
  promoteToL3(gameId, characterId, entry);

  return entry;
}

/**
 * Invalidate a single character across all cache levels.
 * Call after editing a character's moves or combos.
 */
export function invalidateCharacter(gameId: string, characterId: string) {
  globalCache.delete(characterId);
  gameCache.get(gameId)?.delete(characterId);
  if (singleCharCache?.characterId === characterId) singleCharCache = null;
}

/**
 * Full cache wipe. Call after bulk data changes or on sign-out.
 */
export function clearAllCaches() {
  globalCache.clear();
  gameCache.clear();
  singleCharCache = null;
  globalCachePopulated = false;
}