import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../api/client";
import { useAuth } from "./useAuth";

export type MoveMasteryRow = {
  move_id: string;
  combo_id?: string;
  mastered: boolean;
  best_avg_time_ms: number | null;
  current_streak_count: number;
  current_streak_total_ms: number;
  best_streak_count: number;
};

export function useUserMoveMastery(_moveIds: string[]) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [rows, setRows] = useState<MoveMasteryRow[]>([]);
  const [fetchTick, setFetchTick] = useState(0);

  const refetch = useCallback(() => setFetchTick((t) => t + 1), []);

  useEffect(() => {
    async function run() {
      if (!userId) {
        setRows([]);
        return;
      }

      // Fetch ALL mastery rows for the user — no .in() filter.
      // Filtering by a large ID list generates a URL that exceeds PostgREST's
      // limit and causes a CORS-like error. Fetching all rows is safe since
      // a user will never have millions of mastery entries.
      const { data, error } = await supabase
        .from("user_move_mastery")
        .select(
          "move_id, mastered, best_avg_time_ms, current_streak_count, current_streak_total_ms, best_streak_count"
        )
        .eq("user_id", userId);

      if (error) {
        console.error("[useMastery] Failed to fetch move mastery:", error.message, error);
        return;
      }
      setRows((data ?? []) as MoveMasteryRow[]);
    }

    run();
  }, [userId, fetchTick]);

  const map = useMemo(() => {
    const m = new Map<string, MoveMasteryRow>();
    rows.forEach((r) => m.set(r.move_id, r));
    return m;
  }, [rows]);

  return { rows, map, refetch };
}

export function useUserComboMastery(_comboIds: string[]) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [rows, setRows] = useState<MoveMasteryRow[]>([]);
  const [fetchTick, setFetchTick] = useState(0);

  const refetch = useCallback(() => setFetchTick((t) => t + 1), []);

  useEffect(() => {
    async function run() {
      if (!userId) {
        setRows([]);
        return;
      }

      const { data, error } = await supabase
        .from("user_combo_mastery")
        .select(
          "combo_id, mastered, best_avg_time_ms, current_streak_count, current_streak_total_ms, best_streak_count"
        )
        .eq("user_id", userId);

      if (error) {
        console.error("[useMastery] Failed to fetch combo mastery:", error.message, error);
        return;
      }
      setRows((data ?? []) as MoveMasteryRow[]);
    }

    run();
  }, [userId, fetchTick]);

  const map = useMemo(() => {
    const m = new Map<string, MoveMasteryRow>();
    rows.forEach((r) => m.set(r.combo_id!, r));
    return m;
  }, [rows]);

  return { rows, map, refetch };
}

type RecordMoveAttemptArgs = {
  userId: string;
  moveId?: string;
  comboId?: string;
  gameId: string;
  characterId: string;
  success: boolean;
  durationMs?: number;
};

export async function recordMoveAttempt({
  userId,
  moveId,
  comboId,
  gameId,
  characterId,
  success,
  durationMs = 0,
}: RecordMoveAttemptArgs): Promise<{ error: string | null }> {
  const table = comboId ? "user_combo_mastery" : "user_move_mastery";
  const idField = comboId ? "combo_id" : "move_id";
  const idValue = comboId || moveId;

  if (!idValue) return { error: "No move or combo id provided" };

  const { data: existingData, error: selectError } = await supabase
    .from(table)
    .select(
      `${idField}, mastered, best_avg_time_ms, current_streak_count, current_streak_total_ms, best_streak_count`
    )
    .eq("user_id", userId)
    .eq(idField, idValue)
    .maybeSingle();

  if (selectError) {
    console.error(`[recordMoveAttempt] SELECT failed on ${table}:`, selectError.message, selectError);
    return { error: selectError.message };
  }

  const existing = existingData as MoveMasteryRow | null;

  if (!existing) {
    if (!success) {
      const { error: insertError } = await supabase.from(table).insert({
        user_id: userId,
        [idField]: idValue,
        game_id: gameId,
        character_id: characterId,
        mastered: false,
        current_streak_count: 0,
        current_streak_total_ms: 0,
        best_streak_count: 0,
      });
      if (insertError) {
        console.error(`[recordMoveAttempt] INSERT (fail, new row) failed on ${table}:`, insertError.message, insertError);
        return { error: insertError.message };
      }
      return { error: null };
    }

    const { error: insertError } = await supabase.from(table).insert({
      user_id: userId,
      [idField]: idValue,
      game_id: gameId,
      character_id: characterId,
      mastered: false,
      current_streak_count: 1,
      current_streak_total_ms: Math.max(0, Math.round(durationMs)),
      best_streak_count: 1,
      best_avg_time_ms: Math.max(0, Math.round(durationMs)),
    });
    if (insertError) {
      console.error(`[recordMoveAttempt] INSERT (success, new row) failed on ${table}:`, insertError.message, insertError);
      return { error: insertError.message };
    }
    return { error: null };
  }

  if (!success) {
    const newBestStreak = Math.max(existing.best_streak_count || 0, existing.current_streak_count || 0);
    const { error: updateError } = await supabase
      .from(table)
      .update({
        current_streak_count: 0,
        current_streak_total_ms: 0,
        best_streak_count: newBestStreak,
      })
      .eq("user_id", userId)
      .eq(idField, idValue);
    if (updateError) {
      console.error(`[recordMoveAttempt] UPDATE (fail) failed on ${table}:`, updateError.message, updateError);
      return { error: updateError.message };
    }
    return { error: null };
  }

  const nextCount = existing.current_streak_count + 1;
  const duration = Math.max(0, Math.round(durationMs));

  let newBestTime = existing.best_avg_time_ms;
  if (duration > 0) {
    newBestTime = newBestTime === null ? duration : Math.min(newBestTime, duration);
  }

  const { error: updateError } = await supabase
    .from(table)
    .update({
      mastered: existing.mastered || nextCount >= 5,
      current_streak_count: nextCount,
      best_streak_count: Math.max(existing.best_streak_count || 0, nextCount),
      best_avg_time_ms: newBestTime,
    })
    .eq("user_id", userId)
    .eq(idField, idValue);

  if (updateError) {
    console.error(`[recordMoveAttempt] UPDATE (success) failed on ${table}:`, updateError.message, updateError);
    return { error: updateError.message };
  }
  return { error: null };
}

export async function resetAllUserMastery(userId: string) {
  const { error: moveError } = await supabase.from("user_move_mastery").delete().eq("user_id", userId);
  const { error: comboError } = await supabase.from("user_combo_mastery").delete().eq("user_id", userId);

  if (moveError) console.error("Failed to delete moves:", moveError);
  if (comboError) console.error("Failed to delete combos:", comboError);

  window.location.reload();
}