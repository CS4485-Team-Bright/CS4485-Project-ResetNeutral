import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Character, Combo, Move } from "../types/game";
import { Trash2, RotateCcw, Check, X, Clock, Zap, HelpCircle, Flame } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserMoveMastery, useUserComboMastery, recordMoveAttempt } from "../hooks/useMastery";
import {
  parseNotationToSteps,
  getGameConfig,
  buildKeyToButton,
  activeButtonIds,
  satisfiesMacro,
  type ParsedStep,
} from "../utils/inputConfig";

// --- AUDIO ENGINE ---
let audioCtx: AudioContext | null = null;

function playAudioFeedback(type: "success" | "fail", chainIndex: number = 0) {
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx = new AudioCtx();
    }
    
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "success") {
      const freq = 440 * Math.pow(2, (chainIndex * 2) / 12);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    // Gracefully ignore
  }
}
// --------------------

// Pretty-print a keyboard binding (lowercased internal key) for the legend.
// Examples: "j" -> "J", " " -> "Space", ";" -> ";"
function keyDisplayLabel(key: string): string {
  if (key === " ") return "Space";
  if (key.length === 1) return key.toUpperCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function tokenDisplayLabel(t: string, facing: "right" | "left" = "right"): string {  // \uFE0E forces text presentation instead of emoji rendering for OS that substitute arrows
  if (facing === "right") {
    const rightMap: Record<string, string> = {
      "1": "↙\uFE0E", "2": "↓\uFE0E", "3": "↘\uFE0E",
      "4": "←\uFE0E", "5": "●", "6": "→\uFE0E",
      "7": "↖\uFE0E", "8": "↑\uFE0E", "9": "↗\uFE0E",
    };
    return rightMap[t] ?? t;
  } else {
    // Visually mirror the horizontal directions for Left Facing
    const leftMap: Record<string, string> = {
      "1": "↘\uFE0E", "2": "↓\uFE0E", "3": "↙\uFE0E",
      "4": "→\uFE0E", "5": "●", "6": "←\uFE0E",
      "7": "↗\uFE0E", "8": "↑\uFE0E", "9": "↖\uFE0E",
    };
    return leftMap[t] ?? t;
  }
}

function getActiveDirectionNumpad(keys: Set<string>, facing: "right" | "left"): string {
  let up = keys.has("w") || keys.has("ArrowUp") || keys.has("W");
  let down = keys.has("s") || keys.has("ArrowDown") || keys.has("S");
  let left = keys.has("a") || keys.has("ArrowLeft") || keys.has("A");
  let right = keys.has("d") || keys.has("ArrowRight") || keys.has("D");

  if (facing === "left") {
    const temp = left;
    left = right;
    right = temp;
  }

  // SOCD Neutral
  if (up && down) { up = false; down = false; }
  if (left && right) { left = false; right = false; }

  if (up && left) return "7";
  if (up && right) return "9";
  if (down && left) return "1";
  if (down && right) return "3";
  if (up) return "8";
  if (down) return "2";
  if (left) return "4";
  if (right) return "6";
  return "5";
}

function getDifficultyBadgeStyles(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";
    case "intermediate":
      return "bg-amber-500/20 text-amber-200 border-amber-400/40";
    case "advanced":
      return "bg-red-500/20 text-red-200 border-red-400/40";
    default:
      return "bg-slate-700/70 text-slate-200 border-slate-500/60";
  }
}

function AutoScrollText({ text, parentHovered }: { text: string; parentHovered: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollAmount, setScrollAmount] = useState(0);
  const [needsScroll, setNeedsScroll] = useState(false);

  // Safely measure layout to dictate bounds
  const checkOverflow = useCallback(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;
      const overflow = textWidth > containerWidth;
      setNeedsScroll(overflow);

      if (parentHovered && overflow) {
        // Add a little padding to the end scroll to let user read the last character cleanly
        setScrollAmount(textWidth - containerWidth + 24);
      } else {
        setScrollAmount(0);
      }
    }
  }, [parentHovered, text]);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden ${needsScroll ? "combo-notation-fade-out text-left" : "text-right"}`}
    >
      <span
        ref={textRef}
        className="inline-block whitespace-nowrap"
        style={{
          transform: `translateX(-${scrollAmount}px)`,
          transition: scrollAmount > 0 ? `transform ${scrollAmount * 20}ms linear 0.5s` : "transform 0.2s ease-out",
        }}
      >
        {text}
      </span>
    </div>
  );
}

interface PracticeArenaProps {
  character: Character;
  gameId: string;
  facing?: "right" | "left";
  onFacingChange?: (facing: "right" | "left") => void;
  inputWindowMs?: number;
  comboLinkWindowMs?: number;
}

type PracticeEntry = {
  kind: "move" | "combo";
  id?: string;
  name: string;
  notation: string;
  difficulty?: Combo["difficulty"];
};

const DEFAULT_INPUT_WINDOW = 300;
const DEFAULT_COMBO_LINK_WINDOW = 700;

export function PracticeArena({
  character,
  gameId,
  facing = "right",
  onFacingChange,
  inputWindowMs = DEFAULT_INPUT_WINDOW,
  comboLinkWindowMs = DEFAULT_COMBO_LINK_WINDOW,
}: PracticeArenaProps) {
  const { user } = useAuth();
  
  const allMoveIds = useMemo(() => character.moves.map(m => m.id), [character.moves]);
  const allComboIds = useMemo(() => character.combos.map(c => c.id), [character.combos]);

  const { map: masteryMap } = useUserMoveMastery(allMoveIds);
  const { map: comboMasteryMap } = useUserComboMastery(allComboIds);

  const [inputHistory, setInputHistory] = useState<
    { symbol: string; type: "direction" | "button"; timestamp: number; seq: number }[]
  >([]);
  const inputSeqRef = useRef(0);
  const lastProcessedSeqRef = useRef(0);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(false);
  const arenaRef = useRef<HTMLDivElement>(null);

  const [practiceEntry, setPracticeEntry] = useState<PracticeEntry | null>(null);
  
  // Local Stats & Caching
  const [localStreak, setLocalStreak] = useState<number>(0);
  const [localBestStreak, setLocalBestStreak] = useState<number>(0);
  const [isMastered, setIsMastered] = useState<boolean>(false);
  const [localBestTime, setLocalBestTime] = useState<number | null>(null);
  
  type SessionProgress = { streak: number; bestStreak: number; bestTime: number | null; mastered: boolean; };
  const [sessionProgressMap, setSessionProgressMap] = useState<Record<string, SessionProgress>>({});
  
  const [pulseFlame, setPulseFlame] = useState(false);
  const [showNewBest, setShowNewBest] = useState(false);
  const [animatingMastery, setAnimatingMastery] = useState(false);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const activeEntryIdRef = useRef<string | null>(null);

  type StepState = "pending" | "success" | "fail";
  const [practiceStepStatus, setPracticeStepStatus] = useState<StepState[]>([]);
  const practiceIndexRef = useRef(0);
  const practiceStepsRef = useRef<ParsedStep[]>([]);
  const resetTimerRef = useRef<number | null>(null);
  const [isResettingPractice, setIsResettingPractice] = useState(false);
  const [tooSlowMessage, setTooSlowMessage] = useState(false);

  const attemptStartMsRef = useRef<number | null>(null);

  const [timerProgress, setTimerProgress] = useState(0); 
  const timerStartRef = useRef<number | null>(null);
  const timerDurationRef = useRef<number>(0);
  const timerRafRef = useRef<number | null>(null);
  const inputWindowTimerRef = useRef<number | null>(null);
  
  const lastNumpadDirRef = useRef<string>("5");

  const practiceMoves = useMemo<PracticeEntry[]>(() => {
    const getWeight = (type: string) => {
      const t = (type || "").toLowerCase();
      if (t.includes("special")) return 1;
      if (t.includes("super") || t.includes("art") || t.includes("ultimate") || t.includes("critical")) return 2;
      if (t.includes("command") || t.includes("unique")) return 3;
      if (t.includes("normal")) return 4;
      return 5;
    };

    const sortedMoves = [...(character.moves || [])].sort((a, b) => {
      const weightA = getWeight(a.type);
      const weightB = getWeight(b.type);
      if (weightA !== weightB) return weightA - weightB;
      return a.name.localeCompare(b.name);
    });

    return sortedMoves.map((move) => ({
      kind: "move" as const,
      id: move.id,
      name: move.name,
      notation: move.input,
    }));
  }, [character.moves]);

  const practiceCombos = useMemo<PracticeEntry[]>(() => {
    const getDiffWeight = (diff: string) => {
      const d = (diff || "").toLowerCase();
      if (d === "beginner") return 1;
      if (d === "intermediate") return 2;
      if (d === "advanced") return 3;
      return 4;
    };

    const sortedCombos = [...(character.combos || [])].sort((a, b) => {
      const weightA = getDiffWeight(a.difficulty || "");
      const weightB = getDiffWeight(b.difficulty || "");
      if (weightA !== weightB) return weightA - weightB;
      return a.name.localeCompare(b.name);
    });

    return sortedCombos.map((combo) => ({
      kind: "combo" as const,
      id: combo.id,
      name: combo.name,
      notation: combo.inputs,
      difficulty: combo.difficulty,
    }));
  }, [character.combos]);

  const practiceSteps = useMemo<ParsedStep[]>(
    () => (practiceEntry ? parseNotationToSteps(practiceEntry.notation, gameId) : []),
    [practiceEntry, gameId]
  );

  // Per-game keyboard binding map (e.g. SF6: u→LP, i→MP, ... ; 2XKO: j→L, etc.).
  const keyToButton = useMemo(() => buildKeyToButton(gameId), [gameId]);
  const buttonKeySet = useMemo(() => new Set(Object.keys(keyToButton)), [keyToButton]);
  const gameConfig = useMemo(() => getGameConfig(gameId), [gameId]);

  const characterMasteryPct = useMemo(() => {
    const totalEntries = character.moves.length + character.combos.length;
    if (totalEntries === 0) return 0;
    
    let masteredCount = 0;
    character.moves.forEach(m => {
      if (sessionProgressMap[m.id]?.mastered || masteryMap.get(m.id)?.mastered) masteredCount++;
    });
    character.combos.forEach(c => {
      if (sessionProgressMap[c.id]?.mastered || comboMasteryMap.get(c.id)?.mastered) masteredCount++;
    });
    return Math.round((masteredCount / totalEntries) * 100);
  }, [character.moves, character.combos, masteryMap, comboMasteryMap, sessionProgressMap]);

  useEffect(() => {
    if (practiceEntry && practiceEntry.id) {
      const activeMap = practiceEntry.kind === "move" ? masteryMap : comboMasteryMap;
      const dbMastery = activeMap.get(practiceEntry.id);
      const localSession = sessionProgressMap[practiceEntry.id];
      
      // Overwrite visual state seamlessly from local session if we have been training it, otherwise DB fallback
      const applyStreak = localSession !== undefined ? localSession.streak : (dbMastery?.current_streak_count || 0);
      const applyBestStreak = localSession !== undefined ? localSession.bestStreak : (dbMastery?.best_streak_count || 0);
      const applyMastered = localSession !== undefined ? localSession.mastered : (dbMastery?.mastered || false);
      const applyBestTime = localSession !== undefined ? localSession.bestTime : (dbMastery?.best_avg_time_ms || null);

      if (activeEntryIdRef.current !== practiceEntry.id) {
        setAnimatingMastery(false);
        // Reset entirely for new move to prevent carrying over previous move's streak visually
        setLocalStreak(applyStreak);
        setLocalBestStreak(applyBestStreak);
        bestStreakRef.current = applyBestStreak;
        setIsMastered(applyMastered);
        setLocalBestTime(applyBestTime);
        activeEntryIdRef.current = practiceEntry.id;
      } else {
        setLocalStreak(applyStreak);
        streakRef.current = applyStreak;
        setLocalBestStreak(applyBestStreak);
        bestStreakRef.current = applyBestStreak;
        setIsMastered(applyMastered);
        setLocalBestTime(applyBestTime);
      }
    } else {
      activeEntryIdRef.current = null;
      setAnimatingMastery(false);
      setLocalStreak(0);
      setLocalBestStreak(0);
      streakRef.current = 0;
      bestStreakRef.current = 0;
      setIsMastered(false);
      setLocalBestTime(null);
    }
  }, [practiceEntry, masteryMap, comboMasteryMap]); // Do NOT include sessionProgressMap (recordResult automatically tracks its own state synchronously)

  const recordResult = useCallback(async (success: boolean) => {
    if (!user || !practiceEntry || !practiceEntry.id) return;
    const entryId = practiceEntry.id!;
    const durationMs = success && attemptStartMsRef.current !== null ? Date.now() - attemptStartMsRef.current : 0;
    
    // Evaluate Next Stats instantly using robust Ref handling
    const nextStreak = success ? streakRef.current + 1 : 0;
    streakRef.current = nextStreak;
    
    let nextBestStreak = bestStreakRef.current;
    if (success && nextStreak > nextBestStreak && nextStreak > 1) {
      nextBestStreak = nextStreak;
      bestStreakRef.current = nextStreak;
      setShowNewBest(true);
      setTimeout(() => setShowNewBest(false), 1500);
    }

    if (success) {
      setPulseFlame(true);
      setTimeout(() => setPulseFlame(false), 300); // Glow decay window
    }

    // Apply visual feedback flawlessly across states without waiting for React batch queues
    setLocalStreak(nextStreak);
    setLocalBestStreak(nextBestStreak);

    setIsMastered(prevIsM => {
      const justHit5 = nextStreak === 5 && !prevIsM;
      const nextMastered = prevIsM || nextStreak >= 5;

      if (justHit5) {
        setAnimatingMastery(true);
        setTimeout(() => {
          setAnimatingMastery(false);
        }, 1200);
      }
      
      setLocalBestTime(prevTime => {
        const nextBestTime = (success && durationMs > 0) ? (prevTime === null ? durationMs : Math.min(prevTime, durationMs)) : prevTime;
        
        // Final synchronous operation - Save everything to active session progress map
        setSessionProgressMap(prevMap => ({
          ...prevMap,
          [entryId]: {
            streak: nextStreak,
            bestStreak: nextBestStreak,
            mastered: nextMastered,
            bestTime: nextBestTime
          }
        }));
        
        return nextBestTime;
      });
      return nextMastered;
    });

    // Make backend DB request silently
    await recordMoveAttempt({
      userId: user.id,
      moveId: practiceEntry.kind === "move" ? entryId : undefined,
      comboId: practiceEntry.kind === "combo" ? entryId : undefined,
      gameId,
      characterId: character.id,
      success,
      durationMs,
    });
  }, [user, practiceEntry, gameId, character.id]);

  useEffect(() => {
    practiceStepsRef.current = practiceSteps;
  }, [practiceSteps]);

  const getWindowMs = useCallback(() => {
    if (!practiceEntry) return inputWindowMs;
    return practiceEntry.kind === "combo" ? comboLinkWindowMs : inputWindowMs;
  }, [practiceEntry, inputWindowMs, comboLinkWindowMs]);

  const startInputTimer = useCallback(() => {
    if (inputWindowTimerRef.current !== null) {
      window.clearTimeout(inputWindowTimerRef.current);
      inputWindowTimerRef.current = null;
    }
    if (timerRafRef.current !== null) {
      cancelAnimationFrame(timerRafRef.current);
      timerRafRef.current = null;
    }

    const windowMs = getWindowMs();
    timerStartRef.current = performance.now();
    timerDurationRef.current = windowMs;
    setTimerProgress(1);

    const animate = () => {
      const start = timerStartRef.current;
      if (start === null) return;
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, 1 - elapsed / timerDurationRef.current);
      setTimerProgress(remaining);
      if (remaining > 0) {
        timerRafRef.current = requestAnimationFrame(animate);
      }
    };
    timerRafRef.current = requestAnimationFrame(animate);

    inputWindowTimerRef.current = window.setTimeout(async () => {
      setTooSlowMessage(true);
      setTimerProgress(0);
      setIsResettingPractice(true);
      playAudioFeedback("fail");
      await recordResult(false);

      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        practiceIndexRef.current = 0;
        lastProcessedSeqRef.current = 0;
        setInputHistory([]);
        if (practiceStepsRef.current.length > 0) {
          setPracticeStepStatus(practiceStepsRef.current.map(() => "pending"));
        }
        setIsResettingPractice(false);
        setTooSlowMessage(false);
        resetTimerRef.current = null;
        timerStartRef.current = null;
        attemptStartMsRef.current = null;
      }, 800);
      inputWindowTimerRef.current = null;
    }, windowMs);
  }, [getWindowMs, recordResult]);

  const stopInputTimer = useCallback(() => {
    if (inputWindowTimerRef.current !== null) {
      window.clearTimeout(inputWindowTimerRef.current);
      inputWindowTimerRef.current = null;
    }
    if (timerRafRef.current !== null) {
      cancelAnimationFrame(timerRafRef.current);
      timerRafRef.current = null;
    }
    timerStartRef.current = null;
    setTimerProgress(0);
  }, []);

  useEffect(() => {
    practiceIndexRef.current = 0;
    lastProcessedSeqRef.current = 0;
    stopInputTimer();
    setTooSlowMessage(false);
    attemptStartMsRef.current = null;
    if (practiceEntry && practiceSteps.length > 0) {
      setPracticeStepStatus(practiceSteps.map(() => "pending"));
    } else {
      setPracticeStepStatus([]);
    }
  }, [practiceEntry, practiceSteps, stopInputTimer]);

  const addInput = useCallback((symbol: string, type: "direction" | "button") => {
    const now = Date.now();
    inputSeqRef.current += 1;
    const seq = inputSeqRef.current;
    setInputHistory((prev) => {
      return [...prev, { symbol, type, timestamp: now, seq }].slice(-30);
    });
  }, []);

  useEffect(() => {
    if (!practiceEntry || practiceSteps.length === 0 || inputHistory.length === 0) return;
    if (isResettingPractice) return;
    const last = inputHistory[inputHistory.length - 1];
    if (last.seq === lastProcessedSeqRef.current) return;
    lastProcessedSeqRef.current = last.seq;

    let idx = practiceIndexRef.current;
    if (idx >= practiceSteps.length) return;
    let expected = practiceSteps[idx];

    const resetPracticeSoon = async (ms: number, success: boolean) => {
      setIsResettingPractice(true);
      stopInputTimer();
      await recordResult(success);

      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        practiceIndexRef.current = 0;
        lastProcessedSeqRef.current = 0;
        setInputHistory([]);
        if (practiceStepsRef.current.length > 0) {
          setPracticeStepStatus(practiceStepsRef.current.map(() => "pending"));
        }
        setIsResettingPractice(false);
        setTooSlowMessage(false);
        attemptStartMsRef.current = null;
        resetTimerRef.current = null;
      }, ms);
    };

    const markStep = (stepIdx: number, state: StepState) => {
      setPracticeStepStatus((prev) => {
        const next = [...prev];
        if (next[stepIdx] !== undefined) next[stepIdx] = state;
        return next;
      });
    };

    const advanceStep = () => {
      markStep(idx, "success");
      playAudioFeedback("success", idx);
      practiceIndexRef.current = idx + 1;
      if (practiceIndexRef.current >= practiceSteps.length) {
        void resetPracticeSoon(1000, true);
      } else {
        startInputTimer();
      }
    };

    const failStep = () => {
      markStep(idx, "fail");
      playAudioFeedback("fail");
      void resetPracticeSoon(700, false);
    };

    // ── 1. "Neutral" auto-pass: when the next step is direction "5" and the
    //       player hits a button while no direction key is held, accept the 5
    //       and immediately re-evaluate the same input against the next step.
    if (expected.kind === "dir" && expected.value === "5" && last.type === "button") {
      if (getActiveDirectionNumpad(activeKeys, facing) === "5") {
        markStep(idx, "success");
        playAudioFeedback("success", idx);
        idx += 1;
        practiceIndexRef.current = idx;
        if (idx >= practiceSteps.length) {
          void resetPracticeSoon(1000, true);
          return;
        }
        startInputTimer();
        expected = practiceSteps[idx];
      } else {
        failStep();
        return;
      }
    }

    // ── 2. Direction step ───────────────────────────────────────────────
    if (expected.kind === "dir") {
      if (last.type === "direction") {
        if (last.symbol === expected.value) advanceStep();
        // Wrong direction press is treated as "still searching" — wait for
        // the right one rather than punish brief overshoots.
        return;
      }
      // A button press while a direction was expected is a real mistake.
      failStep();
      return;
    }

    // ── 3. Button step (single button or any-of for SF6 bare P/K) ───────
    if (expected.kind === "btn") {
      if (last.type === "direction") return; // ignore stray direction blips
      if (expected.ids.includes(last.symbol)) advanceStep();
      else failStep();
      return;
    }

    // ── 4. Macro step (simultaneous multi-button press) ─────────────────
    if (expected.kind === "macro") {
      if (last.type === "direction") return;

      const macro = expected.macro;
      // Buttons currently held down (mapped via the per-game key binding).
      const held = activeButtonIds(activeKeys, gameId);
      // The just-pressed button should always be considered held even if
      // React state hasn't flushed yet.
      held.add(last.symbol);

      if (satisfiesMacro(macro, held)) {
        advanceStep();
        return;
      }

      // Is the just-pressed button at least part of this macro? If so wait
      // (the player is mid-press and might still complete the macro before
      // the input window closes). Otherwise it's an unrelated button → fail.
      const relevantPool =
        macro.spec.kind === "all" ? macro.spec.required : macro.spec.pool;
      if (relevantPool.includes(last.symbol)) return;

      failStep();
      return;
    }
  }, [inputHistory, practiceEntry, practiceSteps, activeKeys, isResettingPractice, startInputTimer, stopInputTimer, recordResult, facing, gameId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (isResettingPractice) {
        e.preventDefault();
        return;
      }

      const key = e.key;
      if (activeKeys.has(key)) return;

      const kLow = key.toLowerCase();
      const isDir = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(kLow);
      const buttonId = keyToButton[kLow];
      const isBtn = !!buttonId;

      if (!isDir && !isBtn) return;
      e.preventDefault();

      const nextKeys = new Set(activeKeys);
      nextKeys.add(key);
      setActiveKeys(nextKeys);

      if (isBtn) {
        addInput(buttonId, "button");
        if (practiceEntry && practiceIndexRef.current === 0 && timerStartRef.current === null) {
          attemptStartMsRef.current = Date.now();
          startInputTimer();
        }
      }

      if (isDir) {
        const nextDir = getActiveDirectionNumpad(nextKeys, facing);
        if (nextDir !== lastNumpadDirRef.current) {
          lastNumpadDirRef.current = nextDir;
          addInput(nextDir, "direction"); 
          if (practiceEntry && practiceIndexRef.current === 0 && timerStartRef.current === null) {
            attemptStartMsRef.current = Date.now();
            startInputTimer();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!activeKeys.has(e.key)) return;

      const nextKeys = new Set(activeKeys);
      nextKeys.delete(e.key);
      setActiveKeys(nextKeys);

      const kLow = e.key.toLowerCase();
      const isDir = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(kLow);

      if (isDir) {
        const nextDir = getActiveDirectionNumpad(nextKeys, facing);
        if (nextDir !== lastNumpadDirRef.current) {
          lastNumpadDirRef.current = nextDir;
          addInput(nextDir, "direction");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isActive, activeKeys, addInput, facing, isResettingPractice, practiceEntry, startInputTimer, keyToButton]);

  const clearHistory = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    stopInputTimer();
    setIsResettingPractice(false);
    setTooSlowMessage(false);
    setInputHistory([]);
    lastProcessedSeqRef.current = 0;
    practiceIndexRef.current = 0;
    lastNumpadDirRef.current = "5";
    attemptStartMsRef.current = null;
    if (practiceEntry) {
      const steps = parseNotationToSteps(practiceEntry.notation, gameId);
      if (steps.length > 0) {
        setPracticeStepStatus(steps.map(() => "pending"));
      }
    }
  };

  const activateArena = useCallback(() => {
    setIsActive(true);
  }, []);

  const handlePracticeEntrySelect = useCallback((entry: PracticeEntry, selected: boolean) => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    stopInputTimer();
    setIsResettingPractice(false);
    setTooSlowMessage(false);
    setInputHistory([]);
    lastProcessedSeqRef.current = 0;

    if (selected) {
      setPracticeEntry(null);
    } else {
      setPracticeEntry(entry);
      activateArena();
    }
  }, [activateArena, stopInputTimer]);

  const recentDisplay = inputHistory.slice(-15);

  const timerBarColor =
    timerProgress > 0.5
      ? "bg-emerald-400"
      : timerProgress > 0.25
        ? "bg-yellow-400"
        : "bg-red-400";

  const physicalNumpad = getActiveDirectionNumpad(activeKeys, "right");

  return (
    <div ref={arenaRef} className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');

        @keyframes slideInFade {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-fade {
          animation: slideInFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes punchyRight {
          0% { opacity: 0; transform: translateX(-20px); animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
          20% { opacity: 1; transform: translateX(0); animation-timing-function: linear; }
          80% { opacity: 1; transform: translateX(0); animation-timing-function: cubic-bezier(0.36, 0, 0.66, -0.56); }
          100% { opacity: 0; transform: translateX(20px); }
        }
        .animate-punchy-right {
          animation: punchyRight 1.5s forwards;
        }

        @keyframes masteryBoxPulse {
          0% { border-color: rgba(59,130,246,0.3); transform: scale(1); }
          15% { border-color: rgba(52,211,153,1); box-shadow: 0 0 30px rgba(52,211,153,0.5); transform: scale(1.03); }
          30% { transform: scale(0.98); }
          45% { transform: scale(1.01); }
          100% { border-color: rgba(59,130,246,0.3); box-shadow: none; transform: scale(1); }
        }
        .anim-mastery-box {
          animation: masteryBoxPulse 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards !important;
        }

        @keyframes barWipeOut {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-10px); }
        }

        @keyframes masteryBarsWidth {
          0% { width: 125px; margin-right: 0.25rem; opacity: 1; }
          40% { width: 125px; margin-right: 0.25rem; opacity: 1; }
          70% { width: 0px; margin-right: 0px; opacity: 0; }
          100% { width: 0px; margin-right: 0px; opacity: 0; }
        }
        .anim-bars-container {
          width: 125px;
          animation: masteryBarsWidth 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes masteryLineIn {
          0%, 60% { opacity: 0; }
          80%, 100% { opacity: 1; }
        }
        .anim-mastery-line-in {
          animation: masteryLineIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes masteryTextSlideIn {
          0%, 70% { opacity: 0; transform: translateX(-15px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .anim-mastery-text-in {
          animation: masteryTextSlideIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .combo-notation-fade-out {
          mask-image: linear-gradient(to right, black calc(100% - 40px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black calc(100% - 40px), transparent 100%);
          mask-size: 100% 100%;
          mask-repeat: no-repeat;
          mask-position: left;
        }
      `}</style>
      
      <div className="p-4 border-b border-blue-500/20 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-['Orbitron']">Practice Arena</h3>
          {onFacingChange && (
            <div className="flex rounded-lg overflow-hidden border border-blue-500/20">
              <button
                onClick={() => onFacingChange("right")}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  facing === "right"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                → Right
              </button>
              <button
                onClick={() => onFacingChange("left")}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  facing === "left"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                ← Left
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="group relative flex items-center gap-1.5 text-xs text-slate-500 cursor-help">
            <Clock size={12} />
            <span>{practiceEntry?.kind === "combo" ? comboLinkWindowMs : inputWindowMs}ms</span>
            <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center">
              <p className="text-[10px] text-slate-300 leading-tight">
                Maximum time allowed between inputs for a successful sequence.
              </p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title="Clear inputs"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {!user && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-300 text-sm">
            You are not logged in. Mastery progress will not be saved.
          </div>
        )}

        {!isActive && (
          <button
            onClick={activateArena}
            className="w-full py-8 rounded-xl border border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 transition-all text-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] group relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent group-hover:via-blue-400 transition-all" />
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent group-hover:via-blue-400 transition-all" />
            <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-blue-400/80 to-transparent group-hover:via-blue-400 transition-all" />
            <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-blue-400/80 to-transparent group-hover:via-blue-400 transition-all" />
            
            <p className="text-blue-400 mb-2 font-['Orbitron'] tracking-wider text-lg font-bold group-hover:text-blue-300 transition-colors">
              Click to activate Practice Arena
            </p>
            <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Use <span className="text-slate-300 font-mono bg-slate-800/80 px-1 rounded border border-slate-700">arrow keys</span> or <span className="text-slate-300 font-mono bg-slate-800/80 px-1 rounded border border-slate-700">WASD</span> for directions<br/>
              <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-1">
                {gameConfig.buttons.map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1">
                    <span className="text-slate-300 font-mono bg-slate-800/80 px-1 rounded border border-slate-700">{keyDisplayLabel(b.key)}</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-slate-300 font-semibold">{b.label}</span>
                  </span>
                ))}
              </span>
            </p>
          </button>
        )}

        {isActive && (
          <>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-6 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 relative overflow-hidden">
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)] flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider font-['Orbitron']">Arena Active</span>
                </div>
                <div className="hidden lg:flex flex-col items-start text-[11px] text-slate-500 font-medium tracking-wide gap-1.5 mt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="px-1 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300 font-mono font-normal">Arrows</span>
                    <span>/</span>
                    <span className="px-1 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300 font-mono font-normal">WASD</span>
                    <span className="ml-1 text-slate-600">=</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider font-['Orbitron']">Directions</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {gameConfig.buttons.map((b) => (
                      <span key={b.id} className="flex items-center gap-1" title={b.description}>
                        <span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300 font-mono font-normal">{keyDisplayLabel(b.key)}</span>
                        <span className="text-slate-600">=</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider font-['Orbitron']">{b.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsActive(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-[0_0_10px_rgba(239,68,68,0.15)] text-xs font-bold uppercase tracking-wider font-['Orbitron'] flex-shrink-0 self-start xl:self-auto"
              >
                <RotateCcw size={14} strokeWidth={2.5} /> Deactivate
              </button>
            </div>

            <div className="flex items-start gap-8 mb-6">
              <div className="flex-shrink-0">
                <div className="grid grid-cols-3 gap-1 w-fit">
                  {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((dirNumpad) => {
                    const isPressed = physicalNumpad === dirNumpad;
                    // The layout grid always shows physical right-facing reality (Keys mapped to layout)
                    const label = tokenDisplayLabel(dirNumpad, "right");
                    return (
                      <div
                        key={dirNumpad}
                        className={`w-10 h-10 rounded-md flex items-center justify-center font-mono text-sm transition-colors ${
                          isPressed ? "bg-blue-500 text-white" : "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-w-[420px]">
                {gameConfig.buttons.map((b) => {
                  const pressed = activeKeys.has(b.key) || activeKeys.has(b.key.toUpperCase());
                  return (
                    <div
                      key={b.id}
                      title={`${b.description}${b.controller ? ` (controller: ${b.controller})` : ""}`}
                      className={`min-w-[3.5rem] h-10 px-2 rounded-md flex flex-col items-center justify-center transition-colors leading-tight ${
                        pressed ? "bg-red-500 text-white" : "bg-slate-700/50 text-slate-300"
                      }`}
                    >
                      <span className="font-mono text-sm font-semibold">{b.label}</span>
                      <span className={`text-[10px] ${pressed ? "text-red-100" : "text-slate-500"}`}>
                        {keyDisplayLabel(b.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0a1628] rounded-lg p-4 min-h-[60px] mb-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                {recentDisplay.length === 0 && (
                  <span className="text-slate-500 text-sm">Start pressing keys to see your inputs...</span>
                )}
                {recentDisplay.map((input, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded flex items-center justify-center font-mono text-xs ${
                      input.type === "direction"
                        ? "bg-slate-700 border border-slate-500 text-white"
                        : "bg-blue-600 border border-blue-400 text-white"
                    }`}
                  >
                    {tokenDisplayLabel(input.symbol, facing)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-['Orbitron']">Move and combo list</h4>
              <div className="group relative flex items-center">
                <HelpCircle size={15} className="text-slate-500 cursor-help hover:text-blue-400 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                  <p className="text-sm text-blue-300 font-semibold mb-1">Numpad Notation (Right-Facing)</p>
                  <p className="text-xs text-slate-400 mb-3 leading-tight">
                    Numbers correspond to directions on a PC numpad, assuming your character is facing right.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono text-slate-300 bg-slate-900/50 p-2 rounded">
                    <div>
                      7 8 9<br/>
                      4 5 6<br/>
                      1 2 3
                    </div>
                    <div>
                      ↖ ↑ ↗<br/>
                      ← ● →<br/>
                      ↙ ↓ ↘
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {user && (
              <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)] flex items-center gap-1.5 font-['Orbitron']">
                <Check size={14} />
                Mastery: {characterMasteryPct}%
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mb-3">
            Click any move or combo to practice. Each input step lights up{" "}
            <span className="text-emerald-400 font-medium">green</span> when correct and{" "}
            <span className="text-red-400 font-medium">red</span> on a mistake (then the sequence resets).
          </p>

          {practiceEntry && practiceSteps.length > 0 && (
            <div className={`mb-4 rounded-lg border p-4 shadow-inner transition-all duration-300 ${animatingMastery ? 'anim-mastery-box z-10 relative bg-[#0a1628]' : 'border-blue-500/30 bg-[#0a1628]'}`}>
              <p className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                <span>Practicing: <span className="text-white font-semibold font-['Orbitron']">{practiceEntry.name}</span></span>
                {practiceEntry.kind === "move" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-blue-500/20 text-blue-200 border border-blue-400/40">
                    move
                  </span>
                )}
                {practiceEntry.kind === "combo" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-purple-500/25 text-purple-200 border border-purple-400/40">
                    combo
                  </span>
                )}
                {practiceEntry.kind === "combo" && practiceEntry.difficulty && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide border ${getDifficultyBadgeStyles(practiceEntry.difficulty)}`}>
                    {practiceEntry.difficulty}
                  </span>
                )}
                <span className="text-slate-500 font-mono text-xs">{practiceEntry.notation}</span>
              </p>
              
              {user && (
                <div className="flex flex-col gap-2 mt-2 mb-3 w-fit">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-800/40 min-w-[220px] relative transition-all duration-300 ${pulseFlame && !animatingMastery ? "border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.6)] bg-orange-500/20 scale-105" : "border-slate-700/50"}`}>
                    <span className="text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                      <Flame size={14} strokeWidth={2.5} className={`transition-all duration-300 ${pulseFlame && !animatingMastery ? "text-yellow-400 scale-[1.7] rotate-12 drop-shadow-[0_0_12px_rgba(250,204,21,1)]" : "text-orange-500 scale-100"}`} />
                      Streak
                    </span>
                    
                    {!isMastered && !animatingMastery && (
                      <div className="flex gap-1.5 ml-2">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className={`w-5 h-1.5 rounded-full transition-colors ${
                              step <= localStreak
                                ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                                : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {animatingMastery && (
                      <div className="flex items-center ml-2 h-full">
                        <div className="flex gap-1.5 anim-bars-container shrink-0 overflow-hidden">
                          {[1,2,3,4,5].map((step, idx) => (
                             <div
                               key={`anim-${step}`}
                               className="w-5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] shrink-0"
                               style={{
                                 animation: `barWipeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                                 animationDelay: `${idx * 0.08}s`
                               }}
                             />
                          ))}
                        </div>
                        <div className="anim-mastery-line-in border-l border-slate-600 pl-3 flex items-center h-full">
                           <span className="anim-mastery-text-in font-black font-['Orbitron'] text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] text-xl tracking-wider inline-block">
                             {localStreak}
                           </span>
                        </div>
                      </div>
                    )}
                    
                    {isMastered && !animatingMastery && (
                      <div className="flex items-center ml-2 border-l border-slate-600 pl-3">
                        <span className={`font-black font-['Orbitron'] tracking-wider shadow-sm transition-all duration-300 ${pulseFlame ? "text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,1)] scale-[1.3]" : "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] scale-100"} ${localStreak > 999 ? 'text-sm' : localStreak > 99 ? 'text-base' : 'text-xl'}`}>
                          {localStreak}
                        </span>
                      </div>
                    )}
                    
                    {showNewBest && (
                      <span className="text-[10px] text-emerald-400 ml-3 font-bold uppercase tracking-wider font-['Orbitron'] animate-punchy-right absolute left-[210px] whitespace-nowrap drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">
                        New Best!
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {localBestStreak > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-xs w-fit overflow-hidden">
                        <Flame size={12} className="text-orange-400" />
                        <span className="text-slate-400">Best streak:</span>
                        <span className="text-orange-300 font-mono font-medium">{localBestStreak}</span>
                      </div>
                    )}
                    
                    {localBestTime !== null && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-xs w-fit overflow-hidden">
                        <Zap size={12} className="text-blue-400" />
                        <span className="text-slate-400">Best runtime:</span>
                        <span className="text-blue-300 font-mono font-medium animate-slide-in-fade">{localBestTime} ms</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-slate-500 text-xs mb-3">
                Activate the arena above, then enter directions and buttons in order. The highlighted ring shows the
                next step.
                <span className="text-amber-400/70 ml-1">
                  Input window: {practiceEntry.kind === "combo" ? comboLinkWindowMs : inputWindowMs}ms
                </span>
              </p>

              {timerProgress > 0 && (
                <div className="w-full h-1.5 bg-slate-700 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-none ${timerBarColor}`}
                    style={{ width: `${timerProgress * 100}%` }}
                  />
                </div>
              )}

              {tooSlowMessage && (
                <div className="mb-3 text-center">
                  <span className="text-red-400 text-sm font-semibold animate-pulse">⏱ Too slow! Resetting...</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {practiceSteps.map((step, i) => {
                  const st = practiceStepStatus[i] ?? "pending";
                  const isNext =
                    st === "pending" &&
                    practiceSteps.slice(0, i).every((_, j) => practiceStepStatus[j] === "success");

                  const baseChip =
                    st === "success"
                      ? "border-2 border-emerald-400 bg-emerald-500/20 text-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
                      : st === "fail"
                        ? "border-2 border-red-500 bg-red-500/25 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                        : isNext
                          ? "border-2 border-amber-400/80 bg-slate-800/80 text-slate-100 ring-2 ring-amber-500/40"
                          : step.kind === "btn"
                            ? "border border-blue-500/40 bg-blue-500/10 text-blue-200"
                            : step.kind === "macro"
                              ? "border border-purple-500/40 bg-purple-500/10 text-purple-200"
                              : "border border-slate-600 bg-slate-800/60 text-slate-400";

                  const label =
                    step.kind === "dir"
                      ? tokenDisplayLabel(step.value, facing)
                      : step.kind === "btn"
                        ? step.label
                        : step.macro.label;

                  const tooltip =
                    step.kind === "macro" ? step.macro.description : undefined;

                  return (
                    <div
                      key={`${label}-${i}`}
                      title={tooltip}
                      className={`flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-sm font-mono transition-all ${baseChip}`}
                    >
                      {st === "success" && <Check className="size-4 shrink-0 text-emerald-300" strokeWidth={2.5} />}
                      {st === "fail" && <X className="size-4 shrink-0 text-red-300" strokeWidth={2.5} />}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {practiceMoves.map((entry, entryIdx) => {
              const selected =
                practiceEntry?.kind === entry.kind &&
                practiceEntry?.name === entry.name &&
                practiceEntry?.notation === entry.notation;
                
              const isMoveMastered = entry.id 
                ? (sessionProgressMap[entry.id]?.mastered || masteryMap.get(entry.id)?.mastered)
                : false;

              return (
                <button
                  type="button"
                  key={`${entry.kind}-${entry.name}-${entryIdx}`}
                  onClick={() => handlePracticeEntrySelect(entry, selected)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "bg-blue-600/30 ring-2 ring-blue-400/70 shadow-md"
                      : "bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-700/80"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2 shrink-0">
                    <span className="text-white text-sm font-medium truncate font-['Orbitron']">{entry.name}</span>
                    {isMoveMastered && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 ml-1 animate-slide-in-fade font-['Orbitron']">
                        Mastered!
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-blue-500/20 text-blue-200 border border-blue-400/40">
                      move
                    </span>
                  </div>
                  <span className="text-blue-300 text-sm font-mono shrink-0">{entry.notation}</span>
                </button>
              );
            })}
          </div>

          {practiceCombos.length > 0 && (
            <>
              <div className="my-4 border-t border-blue-500/25" />
              <p className="text-white font-['Orbitron'] tracking-wider mb-2">Combos</p>
              <div className="space-y-2">
                {practiceCombos.map((entry, entryIdx) => {
                  const selected =
                    practiceEntry?.kind === entry.kind &&
                    practiceEntry?.name === entry.name &&
                    practiceEntry?.notation === entry.notation;
                    
                  const isComboMastered = entry.id 
                    ? (sessionProgressMap[entry.id]?.mastered || comboMasteryMap.get(entry.id)?.mastered)
                    : false;

                  return (
                    <ComboButton
                      key={`${entry.kind}-${entry.name}-${entryIdx}`}
                      entry={entry}
                      selected={selected}
                      isComboMastered={isComboMastered!}
                      onClick={() => handlePracticeEntrySelect(entry, selected)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ComboButton({
  entry,
  selected,
  isComboMastered,
  onClick,
}: {
  entry: PracticeEntry;
  selected: boolean;
  isComboMastered: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        selected
          ? "bg-blue-600/30 ring-2 ring-blue-400/70 shadow-md"
          : "bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-700/80"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 shrink-0">
        <span className="text-white text-sm font-medium truncate font-['Orbitron']">{entry.name}</span>
        {isComboMastered && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 ml-1 animate-slide-in-fade font-['Orbitron']">
            Mastered!
          </span>
        )}
        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-purple-500/25 text-purple-200 border border-purple-400/40">
          combo
        </span>
        {entry.difficulty && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide border ${getDifficultyBadgeStyles(entry.difficulty)}`}>
            {entry.difficulty}
          </span>
        )}
      </div>
      <div className="text-blue-300 text-sm font-mono overflow-hidden ml-4 pl-4 border-l border-slate-700 min-w-0 flex-grow">
        <AutoScrollText text={entry.notation} parentHovered={hovered} />
      </div>
    </button>
  );
}