import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Character, Combo, Move } from "../types/game";
import { Trash2, RotateCcw, Check, X } from "lucide-react";

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
  facing?: "right" | "left";
}

type PracticeEntry = {
  kind: "move" | "combo";
  name: string;
  notation: string;
  difficulty?: Combo["difficulty"];
};

export function PracticeArena({
  character,
  facing = "right",
}: PracticeArenaProps) {
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
  type StepState = "pending" | "success" | "fail";
  const [practiceStepStatus, setPracticeStepStatus] = useState<StepState[]>([]);
  const practiceIndexRef = useRef(0);
  const practiceTokensRef = useRef<string[]>([]);
  const resetTimerRef = useRef<number | null>(null);
  const [isResettingPractice, setIsResettingPractice] = useState(false);

  const practiceMoves = useMemo<PracticeEntry[]>(
    () =>
      character.moves.map((move) => ({
        kind: "move" as const,
        name: move.name,
        notation: move.input,
      })),
    [character.moves]
  );

  const practiceCombos = useMemo<PracticeEntry[]>(
    () =>
      character.combos.map((combo) => ({
        kind: "combo" as const,
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

  useEffect(() => {
    practiceTokensRef.current = practiceTokens;
  }, [practiceTokens]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    practiceIndexRef.current = 0;
    lastProcessedSeqRef.current = 0;
    if (practiceEntry && practiceTokens.length > 0) {
      setPracticeStepStatus(practiceTokens.map(() => "pending"));
    } else {
      setPracticeStepStatus([]);
    }
  }, [practiceEntry, practiceTokens]);

  const addInput = useCallback(
    (symbol: string, type: "direction" | "button") => {
      const now = Date.now();
      inputSeqRef.current += 1;
      const seq = inputSeqRef.current;
      setInputHistory((prev) => {
        const newHistory = [...prev, { symbol, type, timestamp: now, seq }];
        return newHistory.slice(-30);
      });
    },
    []
  );

  useEffect(() => {
    if (!practiceEntry || practiceTokens.length === 0 || inputHistory.length === 0)
      return;
    if (isResettingPractice) return;
    const last = inputHistory[inputHistory.length - 1];
    if (last.seq === lastProcessedSeqRef.current) return;
    lastProcessedSeqRef.current = last.seq;

    const prevDir = [...inputHistory]
      .slice(0, -1)
      .reverse()
      .find((e) => e.type === "direction");
    const got =
      last.type === "direction"
        ? arrowPairToNumpad(prevDir?.symbol, last.symbol)
        : last.symbol.toUpperCase();

    const idx = practiceIndexRef.current;
    if (idx >= practiceTokens.length) return;
    const expected = practiceTokens[idx];

    const resetPracticeSoon = (ms: number) => {
      setIsResettingPractice(true);
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

    // Handle neutral "5" as an implicit requirement:
    // the next non-direction input must be entered while no direction is held.
    if (expected === "5") {
      if (last.type === "direction") {
        markStep(idx, "fail");
        resetPracticeSoon(700);
        return;
      }

      const hasDirectionHeld = [...activeKeys].some(
        (key) => KEY_TO_DIRECTION[key] !== undefined
      );
      if (hasDirectionHeld) {
        markStep(idx, "fail");
        resetPracticeSoon(700);
        return;
      }

      markStep(idx, "success");
      const nextIdx = idx + 1;
      practiceIndexRef.current = nextIdx;

      if (nextIdx >= practiceTokens.length) {
        resetPracticeSoon(1000);
        return;
      }

      const nextExpected = practiceTokens[nextIdx];
      if (got === nextExpected) {
        markStep(nextIdx, "success");
        practiceIndexRef.current = nextIdx + 1;
        if (practiceIndexRef.current >= practiceTokens.length) {
          resetPracticeSoon(1000);
        }
      } else {
        markStep(nextIdx, "fail");
        resetPracticeSoon(700);
      }
      return;
    }

    if (got === expected) {
      markStep(idx, "success");
      practiceIndexRef.current = idx + 1;
      if (practiceIndexRef.current >= practiceTokens.length) {
        resetPracticeSoon(1000);
      }
    } else {
      markStep(idx, "fail");
      resetPracticeSoon(700);
    }
  }, [inputHistory, practiceEntry, practiceTokens, activeKeys, isResettingPractice]);

  // Check for motion patterns
  useEffect(() => {
    if (inputHistory.length < 2) return;

    const recentInputs = inputHistory
      .filter((i) => Date.now() - i.timestamp < 2000)
      .map((i) => i.symbol)
      .join("");

    // Check for motion patterns
    for (const motion of MOTION_PATTERNS) {
      if (recentInputs.includes(motion.pattern)) {
        setRecentMotion(motion.name);

        // Check if a button was pressed right after
        const lastInput = inputHistory[inputHistory.length - 1];
        if (lastInput.type === "button") {
          const numpadNotation = motion.numpad + lastInput.symbol;
          const matched = character.moves.find((m) => {
            const moveInput = m.input
              .replace(/\s/g, "")
              .split("or")[0]
              .trim();
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

      // Flip left/right if facing left
      let mappedKey = key;
      if (facing === "left") {
        if (key === "ArrowLeft" || key === "a")
          mappedKey = key === "ArrowLeft" ? "ArrowRight" : "d";
        else if (key === "ArrowRight" || key === "d")
          mappedKey = key === "ArrowRight" ? "ArrowLeft" : "a";
      }

      if (KEY_TO_DIRECTION[mappedKey]) {
        addInput(KEY_TO_DIRECTION[mappedKey], "direction");
      } else if (KEY_TO_BUTTON[key]) {
        addInput(KEY_TO_BUTTON[key], "button");
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
  }, [isActive, activeKeys, addInput, facing, isResettingPractice]);

  const clearHistory = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setIsResettingPractice(false);
    setInputHistory([]);
    setRecentMotion("");
    setMatchedMove(null);
    lastProcessedSeqRef.current = 0;
    practiceIndexRef.current = 0;
    if (practiceEntry) {
      const t = parseMoveInputToTokens(practiceEntry.notation);
      if (t.length > 0) {
        setPracticeStepStatus(t.map(() => "pending"));
      }
    }
  };

  const recentDisplay = inputHistory.slice(-15);

  return (
    <div
      ref={arenaRef}
      className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-blue-500/20 flex items-center justify-between">
        <h3 className="text-white">
          Practice Arena ({facing === "right" ? "Right Facing" : "Left Facing"})
        </h3>
        <div className="flex items-center gap-2">
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
        {/* Click to activate */}
        {!isActive && (
          <button
            onClick={() => setIsActive(true)}
            className="w-full py-8 rounded-xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-center mb-4"
          >
            <p className="text-blue-400 mb-1">Click to activate Practice Arena</p>
            <p className="text-slate-500 text-sm">
              Use arrow keys / WASD for directions, J/K/L/; for P/K/S/H, U/I
              for L/M
            </p>
          </button>
        )}

        {isActive && (
          <>
            {/* Active indicator */}
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

            {/* Direction pad visual */}
            <div className="flex items-start gap-8 mb-6">
              <div className="flex-shrink-0">
                <div className="grid grid-cols-3 gap-1 w-fit">
                  {["↖", "↑", "↗", "←", "●", "→", "↙", "↓", "↘"].map(
                    (dir) => {
                      const isPressed = [...activeKeys].some((key) => {
                        const mapped = KEY_TO_DIRECTION[key];
                        return mapped === dir;
                      });
                      return (
                        <div
                          key={dir}
                          className={`w-10 h-10 rounded-md flex items-center justify-center text-sm transition-colors ${
                            isPressed
                              ? "bg-blue-500 text-white"
                              : "bg-slate-700/50 text-slate-400"
                          }`}
                        >
                          {dir}
                        </div>
                      );
                    }
                  )}
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
                        activeKeys.has(btn.key)
                          ? "bg-red-500 text-white"
                          : "bg-slate-700/50 text-slate-400"
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

            {/* Input history */}
            <div className="bg-[#0a1628] rounded-lg p-4 min-h-[60px] mb-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                {recentDisplay.length === 0 && (
                  <span className="text-slate-500 text-sm">
                    Start pressing keys to see your inputs...
                  </span>
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

            {/* Motion detection */}
            {recentMotion && (
              <div className="text-sm text-blue-300 mb-2">
                Most Recent Input: {recentMotion}
              </div>
            )}

            {/* Matched move */}
            {matchedMove && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 text-sm">
                  Move Detected: <strong>{matchedMove.name}</strong> (
                  {matchedMove.input})
                </p>
              </div>
            )}
          </>
        )}

        {/* Move list + practice selection */}
        <div className="mt-6">
          <h4 className="text-slate-300 mb-1">
            Move and combo list
          </h4>
          <p className="text-slate-500 text-sm mb-3">
            Click any move or combo to practice. Each input step lights up{" "}
            <span className="text-emerald-400 font-medium">green</span> when
            correct and{" "}
            <span className="text-red-400 font-medium">red</span> on a mistake
            (then the sequence resets).
          </p>

          {practiceEntry && practiceTokens.length > 0 && (
            <div className="mb-4 rounded-lg border border-blue-500/30 bg-[#0a1628] p-4 shadow-inner">
              <p className="text-slate-400 text-sm mb-1">
                Practicing:{" "}
                <span className="text-white font-semibold">
                  {practiceEntry.name}
                </span>
                <span className="text-blue-300 text-xs uppercase tracking-wide ml-2">
                  {practiceEntry.kind}
                </span>
                {practiceEntry.kind === "combo" && practiceEntry.difficulty && (
                  <span className="text-purple-300 text-xs uppercase tracking-wide ml-2">
                    {practiceEntry.difficulty}
                  </span>
                )}
                <span className="text-slate-500 font-mono text-xs ml-2">
                  {practiceEntry.notation}
                </span>
              </p>
              <p className="text-slate-500 text-xs mb-3">
                Activate the arena above, then enter directions and buttons in
                order. The highlighted ring shows the next step.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {practiceTokens.map((t, i) => {
                  const st = practiceStepStatus[i] ?? "pending";
                  const isNext =
                    st === "pending" &&
                    practiceTokens.slice(0, i).every(
                      (_, j) => practiceStepStatus[j] === "success"
                    );
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
                      title={
                        st === "success"
                          ? "Correct"
                          : st === "fail"
                            ? "Wrong input"
                            : isNext
                              ? "Next: enter this"
                              : "Pending"
                      }
                    >
                      {st === "success" && (
                        <Check
                          className="size-4 shrink-0 text-emerald-300"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      )}
                      {st === "fail" && (
                        <X
                          className="size-4 shrink-0 text-red-300"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      )}
                      <span>{tokenDisplayLabel(t)}</span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (resetTimerRef.current !== null) {
                    window.clearTimeout(resetTimerRef.current);
                    resetTimerRef.current = null;
                  }
                  setIsResettingPractice(false);
                  setPracticeEntry(null);
                  setInputHistory([]);
                  lastProcessedSeqRef.current = 0;
                }}
                className="mt-3 text-xs text-slate-500 hover:text-slate-300 underline-offset-2 hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}

          {practiceEntry && practiceTokens.length === 0 && (
            <p className="text-amber-400/90 text-sm mb-3">
              This notation couldn&apos;t be parsed into steps.
              Choose another move or combo.
            </p>
          )}

          <div className="space-y-2">
            {practiceMoves.map((entry, entryIdx) => {
              const selected =
                practiceEntry?.kind === entry.kind &&
                practiceEntry?.name === entry.name &&
                practiceEntry?.notation === entry.notation;
              return (
                <button
                  type="button"
                  key={`${entry.kind}-${entry.name}-${entryIdx}`}
                  onClick={() => {
                    if (resetTimerRef.current !== null) {
                      window.clearTimeout(resetTimerRef.current);
                      resetTimerRef.current = null;
                    }
                    setIsResettingPractice(false);
                    setPracticeEntry(entry);
                    setInputHistory([]);
                    lastProcessedSeqRef.current = 0;
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1f35] ${
                    selected
                      ? "bg-blue-600/30 ring-2 ring-blue-400/70 shadow-md"
                      : "bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-700/80"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {entry.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        entry.kind === "combo"
                          ? "bg-purple-500/25 text-purple-200 border border-purple-400/40"
                          : "bg-blue-500/20 text-blue-200 border border-blue-400/40"
                      }`}
                    >
                      {entry.kind}
                    </span>
                    {entry.kind === "combo" && entry.difficulty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-slate-700/70 text-slate-200 border border-slate-500/60">
                        {entry.difficulty}
                      </span>
                    )}
                  </div>
                  <span className="text-blue-300 text-sm font-mono shrink-0">
                    {entry.notation}
                  </span>
                </button>
              );
            })}
          </div>

          {practiceCombos.length > 0 && (
            <>
              <div className="my-4 border-t border-blue-500/25" />
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                Combos
              </p>
              <div className="space-y-2">
                {practiceCombos.map((entry, entryIdx) => {
                  const selected =
                    practiceEntry?.kind === entry.kind &&
                    practiceEntry?.name === entry.name &&
                    practiceEntry?.notation === entry.notation;
                  return (
                    <button
                      type="button"
                      key={`${entry.kind}-${entry.name}-${entryIdx}`}
                      onClick={() => {
                        if (resetTimerRef.current !== null) {
                          window.clearTimeout(resetTimerRef.current);
                          resetTimerRef.current = null;
                        }
                        setIsResettingPractice(false);
                        setPracticeEntry(entry);
                        setInputHistory([]);
                        lastProcessedSeqRef.current = 0;
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1f35] ${
                        selected
                          ? "bg-blue-600/30 ring-2 ring-blue-400/70 shadow-md"
                          : "bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-700/80"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">
                          {entry.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-purple-500/25 text-purple-200 border border-purple-400/40">
                          {entry.kind}
                        </span>
                        {entry.difficulty && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide bg-slate-700/70 text-slate-200 border border-slate-500/60">
                            {entry.difficulty}
                          </span>
                        )}
                      </div>
                      <span className="text-blue-300 text-sm font-mono shrink-0">
                        {entry.notation}
                      </span>
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