import { useEffect, useMemo, useState } from "react";
import { supabase } from "../api/client";
import { useAuth } from "./useAuth";

export type MoveMasteryRow = {
  move_id: string; // Used for moves
  combo_id?: string; // Used for combos
  mastered: boolean;
  best_avg_time_ms: number | null;
  current_streak_count: number;
  current_streak_total_ms: number;
  best_streak_count: number;
};

export function useUserMoveMastery(moveIds: string[]) {
  const { user } = useAuth();
  const [rows, setRows] = useState<MoveMasteryRow[]>([]);

  useEffect(() => {
    async function run() {
      if (!user || moveIds.length === 0) {
        setRows([]);
        return;
      }

      const { data, error } = await supabase
        .from("user_move_mastery")
        .select(
          "move_id, mastered, best_avg_time_ms, current_streak_count, current_streak_total_ms, best_streak_count"
        )
        .eq("user_id", user.id)
        .in("move_id", moveIds);

      if (!error) {
        setRows((data ?? []) as MoveMasteryRow[]);
      }
    }

    run();
  }, [user, moveIds]);

  const map = useMemo(() => {
    const m = new Map<string, MoveMasteryRow>();
    rows.forEach((r) => m.set(r.move_id, r));
    return m;
  }, [rows]);

  return { rows, map };
}

export function useUserComboMastery(comboIds: string[]) {
  const { user } = useAuth();
  const [rows, setRows] = useState<MoveMasteryRow[]>([]);

  useEffect(() => {
    async function run() {
      if (!user || comboIds.length === 0) {
        setRows([]);
        return;
      }

      const { data, error } = await supabase
        .from("user_combo_mastery")
        .select(
          "combo_id, mastered, best_avg_time_ms, current_streak_count, current_streak_total_ms, best_streak_count"
        )
        .eq("user_id", user.id)
        .in("combo_id", comboIds);

      if (!error) {
        setRows((data ?? []) as MoveMasteryRow[]);
      }
    }

    run();
  }, [user, comboIds]);

  const map = useMemo(() => {
    const m = new Map<string, MoveMasteryRow>();
    rows.forEach((r) => m.set(r.combo_id!, r));
    return m;
  }, [rows]);

  return { rows, map };
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
}: RecordMoveAttemptArgs) {
  const table = comboId ? "user_combo_mastery" : "user_move_mastery";
  const idField = comboId ? "combo_id" : "move_id";
  const idValue = comboId || moveId;

  if (!idValue) return;

  const { data: existingData } = await supabase
    .from(table)
    .select(
      `${idField}, mastered, best_avg_time_ms, current_streak_count, current_streak_total_ms, best_streak_count`
    )
    .eq("user_id", userId)
    .eq(idField, idValue)
    .maybeSingle();

  const existing = existingData as MoveMasteryRow | null;

  if (!existing) {
    if (!success) {
      await supabase.from(table).insert({
        user_id: userId,
        [idField]: idValue,
        game_id: gameId,
        character_id: characterId,
        mastered: false,
        current_streak_count: 0,
        current_streak_total_ms: 0,
        best_streak_count: 0,
      });
      return;
    }

    await supabase.from(table).insert({
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
    return;
  }

  if (!success) {
    // Only process the Best Streak check when the active streak is broken
    const newBestStreak = Math.max(existing.best_streak_count || 0, existing.current_streak_count || 0);

    await supabase
      .from(table)
      .update({
        current_streak_count: 0,
        current_streak_total_ms: 0,
        best_streak_count: newBestStreak,
      })
      .eq("user_id", userId)
      .eq(idField, idValue);
    return;
  }

  const nextCount = existing.current_streak_count + 1;
  const duration = Math.max(0, Math.round(durationMs));
  
  // Track absolute best runtime
  let newBestTime = existing.best_avg_time_ms;
  if (duration > 0) {
    newBestTime = newBestTime === null ? duration : Math.min(newBestTime, duration);
  }

  await supabase
    .from(table)
    .update({
      mastered: existing.mastered || nextCount >= 5, // become mastered if hit 5
      current_streak_count: nextCount,               // keep counting forever!
      best_avg_time_ms: newBestTime,
    })
    .eq("user_id", userId)
    .eq(idField, idValue);
}