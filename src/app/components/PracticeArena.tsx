import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Character, Combo, Move } from "../types/game";
import { Trash2, RotateCcw, Check, X, Clock, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserMoveMastery, useUserComboMastery, recordMoveAttempt } from "../hooks/useMastery";

// --- AUDIO ENGINE ---
let audioCtx: AudioContext | null = null;

function playAudioFeedback(type: "success" | "fail", chainIndex: number = 0) {
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx = new AudioCtx();
    }
    
    // Some browsers suspend audio context until user interaction
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "success") {
      // Base frequency A4 (440Hz). Pitches up a whole tone (2 semitones) per correct combo step sequentially.
      const freq = 440 * Math.pow(2, (chainIndex * 2) / 12);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      // Clean, plucky envelope
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
    } else {
      // Dull "bzzzt" for failure
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    // Gracefully ignore, browser likely blocked audio
  }
}
// --------------------

/** First variant before "or", strip notes like (charged), j., charge brackets -> digits */
function parseMoveInputToTokens(raw: string): string[] {
  let s = raw.split(/\s+or\s+/i)[0].trim();
  s = s.replace(/\s*\([^)]*\)\s*/g, "").trim();
  s = s.replace(/^j\./i, "");
  s = s.replace(/\[(\d)\]/g, "$1");
  s = s.replace(/\s/g, "");
  const tokens: string[] = [];
  for (const ch of s) {
    if (/[1-9]/.test(ch)) tokens.push(ch);
    else if (/[pkshlm]/i.test(ch)) tokens.push(ch.toUpperCase());
  }
  return tokens;
}

function baseArrowToNumpad(sym: string): string {
  const m: Record<string, string> = { "↓": "2", "↑": "8", "←": "4", "→": "6" };
  return m[sym] ?? sym;
}

/** Map cardinal pairs to diagonals so QCF works as ↓,→,→ without a ↘ key */
function arrowPairToNumpad(prevSym: string | undefined, sym: string): string {
  const diagonals: Record<string, Record<string, string>> = {
    "↓": { "→": "3", "←": "1" },
    "↑": { "→": "9", "←": "7" },
    "←": { "↓": "1", "↑": "7" },
    "→": { "↓": "3", "↑": "9" },
  };
  if (prevSym && diagonals[prevSym]?.[sym]) return diagonals[prevSym][sym];
  return baseArrowToNumpad(sym);
}

function tokenDisplayLabel(t: string): string {
  const n: Record<string, string> = {
    "1": "↙",
    "2": "↓",
    "3": "↘",
    "4": "←",
    "5": "●",
    "6": "→",
    "7": "↖",
    "8": "↑",
    "9": "↗",
  };
  return n[t] ?? t;
}

const KEY_TO_DIRECTION: Record<string, string> = {
  ArrowDown: "↓",
  ArrowUp: "↑",
  ArrowLeft: "←",
  ArrowRight: "→",
  s: "↓",
  w: "↑",
  a: "←",
  d: "→",
};

const KEY_TO_BUTTON: Record<string, string> = {
  j: "P",
  k: "K",
  l: "S",
  ";": "H",
  u: "L",
  i: "M",
};

// Common motion patterns
const MOTION_PATTERNS: { name: string; pattern: string; numpad: string }[] = [
  { name: "Quarter Circle Forward", pattern: "↓↘→", numpad: "236" },
  { name: "Quarter Circle Back", pattern: "↓↙←", numpad: "214" },
  { name: "Dragon Punch", pattern: "→↓↘", numpad: "623" },
  { name: "Half Circle Forward", pattern: "←↙↓↘→", numpad: "41236" },
  { name: "Half Circle Back", pattern: "→↘↓↙←", numpad: "63214" },
  { name: "Double QCF", pattern: "↓↘→↓↘→", numpad: "236236" },
  { name: "Charge Back-Forward", pattern: "←→", numpad: "[4]6" },
  { name: "Charge Down-Up", pattern: "↓↑", numpad: "[2]8" },
];

interface PracticeArenaProps {
  character: Character;
  gameId: string;
  facing?: "right" | "left";
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
  const [recentMotion, setRecentMotion] = useState<string>("");
  const [matchedMove, setMatchedMove] = useState<Move | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(false);
  const arenaRef = useRef<HTMLDivElement>(null);

  const [practiceEntry, setPracticeEntry] = useState<PracticeEntry | null>(null);
  
  // Optimistic tracking for local streak visually
  const [localStreak, setLocalStreak] = useState<number>(0);
  const [isMastered, setIsMastered] = useState<boolean>(false);
  const [localBestTime, setLocalBestTime] = useState<number | null>(null);
  // Caches mastered moves & combos this session so they don't disappear before DB syncs
  const [sessionMasteredIds, setSessionMasteredIds] = useState<Set<string>>(new Set());

  type StepState = "pending" | "success" | "fail";
  const [practiceStepStatus, setPracticeStepStatus] = useState<StepState[]>([]);
  const practiceIndexRef = useRef(0);
  const practiceTokensRef = useRef<string[]>([]);
  const resetTimerRef = useRef<number | null>(null);
  const [isResettingPractice, setIsResettingPractice] = useState(false);
  const [tooSlowMessage, setTooSlowMessage] = useState(false);

  const attemptStartMsRef = useRef<number | null>(null);

  // Timer bar state
  const [timerProgress, setTimerProgress] = useState(0); // 0-1, 1 = full
  const timerStartRef = useRef<number | null>(null);
  const timerDurationRef = useRef<number>(0);
  const timerRafRef = useRef<number | null>(null);
  const inputWindowTimerRef = useRef<number | null>(null);

  const practiceMoves = useMemo<PracticeEntry[]>(
    () =>
      character.moves.map((move) => ({
        kind: "move" as const,
        id: move.id,
        name: move.name,
        notation: move.input,
      })),
    [character.moves]
  );

  const practiceCombos = useMemo<PracticeEntry[]>(
    () =>
      character.combos.map((combo) => ({
        kind: "combo" as const,
        id: combo.id,
        name: combo.name,
        notation: combo.inputs,
        difficulty: combo.difficulty,
      })),
    [character.combos]
  );

  const practiceTokens = useMemo(
    () => (practiceEntry ? parseMoveInputToTokens(practiceEntry.notation) : []),
    [practiceEntry]
  );

  // Overall Character Mastery Calculation
  const characterMasteryPct = useMemo(() => {
    const totalEntries = character.moves.length + character.combos.length;
    if (totalEntries === 0) return 0;
    
    let masteredCount = 0;
    
    character.moves.forEach(m => {
      if (sessionMasteredIds.has(m.id) || masteryMap.get(m.id)?.mastered) masteredCount++;
    });

    character.combos.forEach(c => {
      if (sessionMasteredIds.has(c.id) || comboMasteryMap.get(c.id)?.mastered) masteredCount++;
    });
    
    return Math.round((masteredCount / totalEntries) * 100);
  }, [character.moves, character.combos, masteryMap, comboMasteryMap, sessionMasteredIds]);

  // Sync DB streak & best time on entry selection
  useEffect(() => {
    if (practiceEntry && practiceEntry.id) {
      const activeMap = practiceEntry.kind === "move" ? masteryMap : comboMasteryMap;
      const dbMastery = activeMap.get(practiceEntry.id);
      const locallyMastered = sessionMasteredIds.has(practiceEntry.id);
      
      setLocalStreak(dbMastery?.current_streak_count || 0);
      setIsMastered(locallyMastered || dbMastery?.mastered || false);
      setLocalBestTime(dbMastery?.best_avg_time_ms || null);
    } else {
      setLocalStreak(0);
      setIsMastered(false);
      setLocalBestTime(null);
    }
  }, [practiceEntry, masteryMap, comboMasteryMap, sessionMasteredIds]);

  const recordResult = useCallback(
    async (success: boolean) => {
      if (!user || !practiceEntry || !practiceEntry.id) return;

      const durationMs =
        success && attemptStartMsRef.current !== null
          ? Date.now() - attemptStartMsRef.current
          : 0;

      // Optimistic visual update
      if (success) {
        setLocalStreak((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            setIsMastered(true);
            setSessionMasteredIds((s) => new Set(s).add(practiceEntry.id!));
            return 0; // Backend resets active streak count to 0 after 5
          }
          return next;
        });

        // Optimistically update best time if it's faster
        if (durationMs > 0) {
           setLocalBestTime(prev => prev === null ? durationMs : Math.min(prev, durationMs));
        }
      } else {
        setLocalStreak(0);
      }

      await recordMoveAttempt({
        userId: user.id,
        moveId: practiceEntry.kind === "move" ? practiceEntry.id : undefined,
        comboId: practiceEntry.kind === "combo" ? practiceEntry.id : undefined,
        gameId,
        characterId: character.id,
        success,
        durationMs,
      });
    },
    [user, practiceEntry, gameId, character.id]
  );

  useEffect(() => {
    practiceTokensRef.current = practiceTokens;
  }, [practiceTokens]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      if (inputWindowTimerRef.current !== null) window.clearTimeout(inputWindowTimerRef.current);
      if (timerRafRef.current !== null) cancelAnimationFrame(timerRafRef.current);
    };
  }, []);

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
        const tokens = practiceTokensRef.current;
        if (tokens.length > 0) {
          setPracticeStepStatus(tokens.map(() => "pending"));
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
    if (practiceEntry && practiceTokens.length > 0) {
      setPracticeStepStatus(practiceTokens.map(() => "pending"));
    } else {
      setPracticeStepStatus([]);
    }
  }, [practiceEntry, practiceTokens, stopInputTimer]);

  const addInput = useCallback((symbol: string, type: "direction" | "button") => {
    const now = Date.now();
    inputSeqRef.current += 1;
    const seq = inputSeqRef.current;
    setInputHistory((prev) => {
      const newHistory = [...prev, { symbol, type, timestamp: now, seq }];
      return newHistory.slice(-30);
    });
  }, []);

  useEffect(() => {
    if (!practiceEntry || practiceTokens.length === 0 || inputHistory.length === 0) return;
    if (isResettingPractice) return;
    const last = inputHistory[inputHistory.length - 1];
    if (last.seq === lastProcessedSeqRef.current) return;
    lastProcessedSeqRef.current = last.seq;

    const prevDir = [...inputHistory]
      .slice(0, -1)
      .reverse()
      .find((e) => e.type === "direction");

    const gotDiagonal =
      last.type === "direction"
        ? arrowPairToNumpad(prevDir?.symbol, last.symbol)
        : last.symbol.toUpperCase();
    const gotBase =
      last.type === "direction"
        ? baseArrowToNumpad(last.symbol)
        : last.symbol.toUpperCase();

    const idx = practiceIndexRef.current;
    if (idx >= practiceTokens.length) return;
    const expected = practiceTokens[idx];

    const resetPracticeSoon = async (ms: number, success: boolean) => {
      setIsResettingPractice(true);
      stopInputTimer();

      await recordResult(success);

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        practiceIndexRef.current = 0;
        lastProcessedSeqRef.current = 0;
        setInputHistory([]);
        const tokens = practiceTokensRef.current;
        if (tokens.length > 0) {
          setPracticeStepStatus(tokens.map(() => "pending"));
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

    if (expected === "5") {
      if (last.type === "direction") {
        markStep(idx, "fail");
        playAudioFeedback("fail");
        void resetPracticeSoon(700, false);
        return;
      }

      const hasDirectionHeld = [...activeKeys].some((key) => KEY_TO_DIRECTION[key] !== undefined);
      if (hasDirectionHeld) {
        markStep(idx, "fail");
        playAudioFeedback("fail");
        void resetPracticeSoon(700, false);
        return;
      }

      markStep(idx, "success");
      playAudioFeedback("success", idx);
      const nextIdx = idx + 1;
      practiceIndexRef.current = nextIdx;

      if (nextIdx >= practiceTokens.length) {
        void resetPracticeSoon(1000, true);
        return;
      }

      startInputTimer();
      const nextExpected = practiceTokens[nextIdx];
      if (gotDiagonal === nextExpected || gotBase === nextExpected) {
        markStep(nextIdx, "success");
        playAudioFeedback("success", nextIdx);
        practiceIndexRef.current = nextIdx + 1;
        if (practiceIndexRef.current >= practiceTokens.length) {
          void resetPracticeSoon(1000, true);
        } else {
          startInputTimer();
        }
      } else {
        markStep(nextIdx, "fail");
        playAudioFeedback("fail");
        void resetPracticeSoon(700, false);
      }
      return;
    }

    if (gotDiagonal === expected || gotBase === expected) {
      markStep(idx, "success");
      playAudioFeedback("success", idx);
      practiceIndexRef.current = idx + 1;
      if (practiceIndexRef.current >= practiceTokens.length) {
        void resetPracticeSoon(1000, true);
      } else {
        startInputTimer();
      }
    } else {
      markStep(idx, "fail");
      playAudioFeedback("fail");
      void resetPracticeSoon(700, false);
    }
  }, [inputHistory, practiceEntry, practiceTokens, activeKeys, isResettingPractice, startInputTimer, stopInputTimer, recordResult]);

  // Check for motion patterns
  useEffect(() => {
    if (inputHistory.length < 2) return;

    const recentInputs = inputHistory
      .filter((i) => Date.now() - i.timestamp < 2000)
      .map((i) => i.symbol)
      .join("");

    for (const motion of MOTION_PATTERNS) {
      if (recentInputs.includes(motion.pattern)) {
        setRecentMotion(motion.name);

        const lastInput = inputHistory[inputHistory.length - 1];
        if (lastInput.type === "button") {
          const numpadNotation = motion.numpad + lastInput.symbol;
          const matched = character.moves.find((m) => {
            const moveInput = m.input.replace(/\s/g, "").split("or")[0].trim();
            return moveInput.startsWith(numpadNotation);
          });
          if (matched) {
            setMatchedMove(matched);
            setTimeout(() => setMatchedMove(null), 3000);
          }
        }
        break;
      }
    }
  }, [inputHistory, character.moves]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (isResettingPractice) {
        e.preventDefault();
        return;
      }
      e.preventDefault();

      const key = e.key;
      if (activeKeys.has(key)) return;

      setActiveKeys((prev) => new Set(prev).add(key));

      let mappedKey = key;
      if (facing === "left") {
        if (key === "ArrowLeft" || key === "a") {
          mappedKey = key === "ArrowLeft" ? "ArrowRight" : "d";
        } else if (key === "ArrowRight" || key === "d") {
          mappedKey = key === "ArrowRight" ? "ArrowLeft" : "a";
        }
      }

      if (KEY_TO_DIRECTION[mappedKey]) {
        addInput(KEY_TO_DIRECTION[mappedKey], "direction");
        if (practiceEntry && practiceIndexRef.current === 0 && timerStartRef.current === null) {
          attemptStartMsRef.current = Date.now();
          startInputTimer();
        }
      } else if (KEY_TO_BUTTON[key]) {
        addInput(KEY_TO_BUTTON[key], "button");
        if (practiceEntry && practiceIndexRef.current === 0 && timerStartRef.current === null) {
          attemptStartMsRef.current = Date.now();
          startInputTimer();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isActive, activeKeys, addInput, facing, isResettingPractice, practiceEntry, startInputTimer]);

  const clearHistory = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    stopInputTimer();
    setIsResettingPractice(false);
    setTooSlowMessage(false);
    setInputHistory([]);
    setRecentMotion("");
    setMatchedMove(null);
    lastProcessedSeqRef.current = 0;
    practiceIndexRef.current = 0;
    attemptStartMsRef.current = null;
    if (practiceEntry) {
      const t = parseMoveInputToTokens(practiceEntry.notation);
      if (t.length > 0) {
        setPracticeStepStatus(t.map(() => "pending"));
      }
    }
  };

  const recentDisplay = inputHistory.slice(-15);

  const timerBarColor =
    timerProgress > 0.5
      ? "bg-emerald-400"
      : timerProgress > 0.25
        ? "bg-yellow-400"
        : "bg-red-400";

    return (
    <div ref={arenaRef} className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden relative">
      <style>{`
        @keyframes slideInFade {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-fade {
          animation: slideInFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <div className="p-4 border-b border-blue-500/20 flex items-center justify-between">
        <h3 className="text-white">
          Practice Arena ({facing === "right" ? "Right Facing" : "Left Facing"})
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={12} />
            <span>{practiceEntry?.kind === "combo" ? comboLinkWindowMs : inputWindowMs}ms</span>
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
            onClick={() => setIsActive(true)}
            className="w-full py-8 rounded-xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-center mb-4"
          >
            <p className="text-blue-400 mb-1">Click to activate Practice Arena</p>
            <p className="text-slate-500 text-sm">
              Use arrow keys / WASD for directions, J/K/L/; for P/K/S/H, U/I for L/M
            </p>
          </button>
        )}

        {isActive && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm">Arena Active</span>
              <span className="text-slate-500 text-sm ml-2">
                Arrows/WASD = Directions | J=P K=K L=S ;=H U=L I=M
              </span>
              <button
                onClick={() => setIsActive(false)}
                className="ml-auto text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1"
              >
                <RotateCcw size={14} /> Deactivate
              </button>
            </div>

            <div className="flex items-start gap-8 mb-6">
              <div className="flex-shrink-0">
                <div className="grid grid-cols-3 gap-1 w-fit">
                  {["↖", "↑", "↗", "←", "●", "→", "↙", "↓", "↘"].map((dir) => {
                    const isPressed = [...activeKeys].some((key) => {
                      const mapped = KEY_TO_DIRECTION[key];
                      return mapped === dir;
                    });
                    return (
                      <div
                        key={dir}
                        className={`w-10 h-10 rounded-md flex items-center justify-center text-sm transition-colors ${
                          isPressed ? "bg-blue-500 text-white" : "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {dir}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "L (U)", key: "u" },
                  { label: "M (I)", key: "i" },
                  { label: "", key: "" },
                  { label: "P (J)", key: "j" },
                  { label: "K (K)", key: "k" },
                  { label: "S (L)", key: "l" },
                  { label: "H (;)", key: ";" },
                  { label: "", key: "" },
                  { label: "", key: "" },
                ].map((btn, i) =>
                  btn.key ? (
                    <div
                      key={i}
                      className={`w-14 h-10 rounded-md flex items-center justify-center text-xs transition-colors ${
                        activeKeys.has(btn.key) ? "bg-red-500 text-white" : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {btn.label}
                    </div>
                  ) : (
                    <div key={i} />
                  )
                )}
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
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                      input.type === "direction"
                        ? "bg-slate-700 border border-slate-500 text-white"
                        : "bg-blue-600 border border-blue-400 text-white"
                    }`}
                  >
                    {input.symbol}
                  </div>
                ))}
              </div>
            </div>

            {recentMotion && (
              <div className="text-sm text-blue-300 mb-2">
                Most Recent Input: {recentMotion}
              </div>
            )}

            {matchedMove && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 text-sm">
                  Move Detected: <strong>{matchedMove.name}</strong> ({matchedMove.input})
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-slate-300">Move and combo list</h4>
            {user && (
              <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)] flex items-center gap-1.5">
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

          {practiceEntry && practiceTokens.length > 0 && (
            <div className="mb-4 rounded-lg border border-blue-500/30 bg-[#0a1628] p-4 shadow-inner">
              <p className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                <span>Practicing: <span className="text-white font-semibold">{practiceEntry.name}</span></span>
                <span className="text-blue-300 text-[10px] uppercase tracking-wide bg-blue-500/10 px-1.5 py-0.5 rounded">{practiceEntry.kind}</span>
                {practiceEntry.kind === "combo" && practiceEntry.difficulty && (
                  <span className="text-purple-300 text-[10px] uppercase tracking-wide bg-purple-500/10 px-1.5 py-0.5 rounded">
                    {practiceEntry.difficulty}
                  </span>
                )}
                <span className="text-slate-500 font-mono text-xs">{practiceEntry.notation}</span>
              </p>
              
              {/* STREAK & BEST TIME VISUALIZER */}
              {user && (
                <div className="flex flex-col gap-2 mt-2 mb-3 w-fit">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <Check size={12} className="text-amber-400/70" />
                      Streak
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div
                          key={step}
                          className={`w-5 h-1.5 rounded-full transition-colors ${
                            isMastered
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                              : step <= localStreak
                                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    {isMastered && <span className="text-[10px] text-emerald-400 ml-1 font-bold uppercase tracking-wider animate-slide-in-fade">Mastered!</span>}
                  </div>
                  
                  {localBestTime !== null && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800/20 text-xs w-fit overflow-hidden">
                      <Zap size={12} className="text-blue-400" />
                      <span className="text-slate-400">Best runtime:</span>
                      <span className="text-blue-300 font-mono font-medium animate-slide-in-fade">{localBestTime} ms</span>
                    </div>
                  )}
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
                {practiceTokens.map((t, i) => {
                  const st = practiceStepStatus[i] ?? "pending";
                  const isNext =
                    st === "pending" &&
                    practiceTokens.slice(0, i).every((_, j) => practiceStepStatus[j] === "success");

                  const chip =
                    st === "success"
                      ? "border-2 border-emerald-400 bg-emerald-500/20 text-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
                      : st === "fail"
                        ? "border-2 border-red-500 bg-red-500/25 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                        : isNext
                          ? "border-2 border-amber-400/80 bg-slate-800/80 text-slate-100 ring-2 ring-amber-500/40"
                          : "border border-slate-600 bg-slate-800/60 text-slate-400";

                  return (
                    <div
                      key={`${t}-${i}`}
                      className={`flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-sm font-mono transition-all ${chip}`}
                    >
                      {st === "success" && <Check className="size-4 shrink-0 text-emerald-300" strokeWidth={2.5} />}
                      {st === "fail" && <X className="size-4 shrink-0 text-red-300" strokeWidth={2.5} />}
                      <span>{tokenDisplayLabel(t)}</span>
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
                ? (sessionMasteredIds.has(entry.id) || masteryMap.get(entry.id)?.mastered)
                : false;

              return (
                <button
                  type="button"
                  key={`${entry.kind}-${entry.name}-${entryIdx}`}
                  onClick={() => {
                    if (resetTimerRef.current !== null) {
                      window.clearTimeout(resetTimerRef.current);
                      resetTimerRef.current = null;
                    }
                    stopInputTimer();
                    setIsResettingPractice(false);
                    setTooSlowMessage(false);
                    setPracticeEntry(entry);
                    setInputHistory([]);
                    lastProcessedSeqRef.current = 0;
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "bg-blue-600/30 ring-2 ring-blue-400/70 shadow-md"
                      : "bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-700/80"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">{entry.name}</span>
                    {isMoveMastered && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 ml-1 animate-slide-in-fade">
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
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Combos</p>
              <div className="space-y-2">
                {practiceCombos.map((entry, entryIdx) => {
                  const selected =
                    practiceEntry?.kind === entry.kind &&
                    practiceEntry?.name === entry.name &&
                    practiceEntry?.notation === entry.notation;
                    
                  const isComboMastered = entry.id 
                    ? (sessionMasteredIds.has(entry.id) || comboMasteryMap.get(entry.id)?.mastered)
                    : false;

                  return (
                    <button
                      type="button"
                      key={`${entry.kind}-${entry.name}-${entryIdx}`}
                      onClick={() => {
                        if (resetTimerRef.current !== null) {
                          window.clearTimeout(resetTimerRef.current);
                          resetTimerRef.current = null;
                        }
                        stopInputTimer();
                        setIsResettingPractice(false);
                        setTooSlowMessage(false);
                        setPracticeEntry(entry);
                        setInputHistory([]);
                        lastProcessedSeqRef.current = 0;
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "bg-blue-600/30 ring-2 ring-blue-400/70 shadow-md"
                          : "bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-700/80"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">{entry.name}</span>
                        {isComboMastered && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 ml-1 animate-slide-in-fade">
                            Mastered!
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-purple-500/25 text-purple-200 border border-purple-400/40">
                          combo
                        </span>
                        {entry.difficulty && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-slate-700/70 text-slate-200 border border-slate-500/60">
                            {entry.difficulty}
                          </span>
                        )}
                      </div>
                      <span className="text-blue-300 text-sm font-mono shrink-0">{entry.notation}</span>
                    </button>
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