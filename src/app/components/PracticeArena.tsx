import { useState, useEffect, useCallback, useRef } from "react";
import type { Character, Move } from "../data/gameData";
import { Trash2, RotateCcw } from "lucide-react";

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

const DIRECTION_TO_NUMPAD: Record<string, string> = {
  "↓": "2",
  "↑": "8",
  "←": "4",
  "→": "6",
  "↙": "1",
  "↘": "3",
  "↖": "7",
  "↗": "9",
  "↓→": "3",
  "↓←": "1",
  "↑→": "9",
  "↑←": "7",
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

export function PracticeArena({
  character,
  facing = "right",
}: PracticeArenaProps) {
  const [inputHistory, setInputHistory] = useState<
    { symbol: string; type: "direction" | "button"; timestamp: number }[]
  >([]);
  const [recentMotion, setRecentMotion] = useState<string>("");
  const [matchedMove, setMatchedMove] = useState<Move | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(false);
  const arenaRef = useRef<HTMLDivElement>(null);

  const addInput = useCallback(
    (symbol: string, type: "direction" | "button") => {
      const now = Date.now();
      setInputHistory((prev) => {
        const newHistory = [...prev, { symbol, type, timestamp: now }];
        // Keep last 30 inputs
        return newHistory.slice(-30);
      });
    },
    []
  );

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
      e.preventDefault();

      const key = e.key;
      if (activeKeys.has(key)) return;

      setActiveKeys((prev) => new Set(prev).add(key));

      // Flip left/right if facing left
      let mappedKey = key;
      if (facing === "left") {
        if (key === "ArrowLeft" || key === "a") mappedKey = key === "ArrowLeft" ? "ArrowRight" : "d";
        else if (key === "ArrowRight" || key === "d") mappedKey = key === "ArrowRight" ? "ArrowLeft" : "a";
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
  }, [isActive, activeKeys, addInput, facing]);

  const clearHistory = () => {
    setInputHistory([]);
    setRecentMotion("");
    setMatchedMove(null);
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

        {/* Move list reference */}
        <div className="mt-6">
          <h4 className="text-slate-300 mb-3">
            Move List - Try these inputs:
          </h4>
          <div className="space-y-2">
            {character.moves.slice(0, 4).map((move) => (
              <div
                key={move.name}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
              >
                <span className="text-white text-sm">{move.name}</span>
                <span className="text-blue-300 text-sm font-mono">
                  {move.input}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
