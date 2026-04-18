import { useState, useEffect } from "react";
import { supabase } from "../api/client";
import type { Game, Character } from "../types/game";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase
        .from("games")
        .select("*, characters(*)");

      if (error) {
        setError(error.message);
      } else {
        setGames(
          (data ?? []).map((g) => ({
            ...g,
            characters: g.characters ?? [],
          }))
        );
      }
      setLoading(false);
    }

    fetchGames();
  }, []);

  return { games, loading, error };
}

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    async function fetchGame() {
      const { data, error } = await supabase
        .from("games")
        .select("*, characters(*)")
        .eq("id", gameId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setGame({ ...data, characters: data.characters ?? [] });
      }
      setLoading(false);
    }

    fetchGame();
  }, [gameId]);

  return { game, loading, error };
}

export function useCharacter(gameId: string, characterId: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId || !characterId) return;

    async function fetchCharacter() {
      const [gameRes, charRes] = await Promise.all([
        supabase.from("games").select("*").eq("id", gameId).single(),
        supabase
          .from("characters")
          .select("*, moves(*), combos(*)")
          .eq("id", characterId)
          .eq("game_id", gameId)
          .single(),
      ]);

      if (gameRes.error) {
        setError(gameRes.error.message);
      } else if (charRes.error) {
        setError(charRes.error.message);
      } else {
        setGame({ ...gameRes.data, characters: [] });
        setCharacter({
          ...charRes.data,
          moves: charRes.data.moves ?? [],
          combos: charRes.data.combos ?? [],
        });
      }
      setLoading(false);
    }

    fetchCharacter();
  }, [gameId, characterId]);

  return { game, character, loading, error };
}