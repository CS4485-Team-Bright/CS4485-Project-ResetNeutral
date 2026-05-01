import { useState, useEffect } from "react";
import { supabase } from "../api/client";
import type { Game, Character } from "../types/game";

async function withTimeout<T>(promise: Promise<T>, ms = 45000): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out while contacting Supabase.")), ms)
    ),
  ]);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }
  throw lastError;
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGames() {
      try {
        const gamesRes = await withRetry(
          () => withTimeout(supabase.from("games").select("*"), 45000),
          1
        );

        if (gamesRes.error) {
          if (!cancelled) setError(gamesRes.error.message);
          return;
        }

        const baseGames = (gamesRes.data ?? []) as Game[];
        if (baseGames.length === 0) {
          if (!cancelled) setGames([]);
          return;
        }

        const gameIds = baseGames.map((g) => g.id);

        const charsRes = await withRetry(
          () =>
            withTimeout(
              supabase.from("characters").select("*").in("game_id", gameIds),
              45000
            ),
          1
        );

        if (charsRes.error) {
          if (!cancelled) setError(charsRes.error.message);
          return;
        }

        const characters = (charsRes.data ?? []) as Character[];
        const byGame = new Map<string, Character[]>();

        for (const c of characters) {
          const list = byGame.get(c.game_id) ?? [];
          list.push(c);
          byGame.set(c.game_id, list);
        }

        if (!cancelled) {
          setGames(
            baseGames.map((g) => ({
              ...g,
              characters: byGame.get(g.id) ?? [],
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error loading games.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGames();

    return () => {
      cancelled = true;
    };
  }, []);

  return { games, loading, error };
}

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGame() {
      if (!gameId) {
        setLoading(false);
        return;
      }

      try {
        const [gameRes, charsRes] = await withRetry(
          () =>
            withTimeout(
              Promise.all([
                supabase.from("games").select("*").eq("id", gameId).single(),
                supabase.from("characters").select("*").eq("game_id", gameId),
              ]),
              45000
            ),
          1
        );

        if (!cancelled) {
          if (gameRes.error) {
            setError(gameRes.error.message);
          } else if (charsRes.error) {
            setError(charsRes.error.message);
          } else {
            setGame({
              ...(gameRes.data as Game),
              characters: (charsRes.data ?? []) as Character[],
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error loading game.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGame();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { game, loading, error };
}

export function useCharacter(gameId: string, characterId: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCharacter() {
      if (!gameId || !characterId) {
        setLoading(false);
        return;
      }

      try {
        const [gameRes, charRes] = await withRetry(
          () =>
            withTimeout(
              Promise.all([
                supabase.from("games").select("*").eq("id", gameId).single(),
                supabase
                  .from("characters")
                  .select("*, moves(*), combos(*)")
                  .eq("id", characterId)
                  .eq("game_id", gameId)
                  .single(),
              ]),
              45000
            ),
          1
        );

        if (!cancelled) {
          if (gameRes.error) {
            setError(gameRes.error.message);
          } else if (charRes.error) {
            setError(charRes.error.message);
          } else {
            setGame({ ...(gameRes.data as Game), characters: [] });
            setCharacter({
              ...(charRes.data as Character),
              moves: charRes.data.moves ?? [],
              combos: charRes.data.combos ?? [],
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error loading character.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCharacter();

    return () => {
      cancelled = true;
    };
  }, [gameId, characterId]);

  return { game, character, loading, error };
}