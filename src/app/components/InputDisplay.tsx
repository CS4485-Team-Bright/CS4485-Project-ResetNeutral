import { parseNotationToSteps, type ParsedStep } from "../utils/inputConfig";

const DIR_SYMBOLS: Record<string, string> = {
  "1": "↙\uFE0E",
  "2": "↓\uFE0E",
  "3": "↘\uFE0E",
  "4": "←\uFE0E",
  "5": "●",
  "6": "→\uFE0E",
  "7": "↖\uFE0E",
  "8": "↑\uFE0E",
  "9": "↗\uFE0E",
};

interface InputDisplayProps {
  input: string;
  /**
   * Game id used to pick the right per-game tokenizer (button names like
   * `LP`/`S1`/`PP` differ between games). Falls back to the generic
   * P/K/S/H/L/M alphabet when omitted.
   */
  gameId?: string;
  size?: "sm" | "md" | "lg";
}

export function InputDisplay({ input, gameId, size = "md" }: InputDisplayProps) {
  const sizeClasses = {
    sm: "min-h-[2rem] min-w-[2rem] text-xs px-2",
    md: "min-h-[2.5rem] min-w-[2.5rem] text-sm px-2.5",
    lg: "min-h-[3rem] min-w-[3rem] text-base px-3",
  };

  const steps = parseNotationToSteps(input ?? "", gameId ?? "");

  // No recognisable steps → just show the raw notation in a single dim chip
  // so the user can still see the original string (e.g. "CHECK NOTES").
  if (steps.length === 0 && input) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className={`${sizeClasses[size]} flex items-center justify-center rounded-lg font-mono border border-slate-700 bg-slate-800/40 text-slate-500 italic`}>
          {input}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {steps.map((step, i) => (
        <Chip key={i} step={step} sizeClass={sizeClasses[size]} />
      ))}
    </div>
  );
}

function Chip({ step, sizeClass }: { step: ParsedStep; sizeClass: string }) {
  if (step.kind === "dir") {
    return (
      <div
        className={`${sizeClass} flex items-center justify-center gap-1 rounded-lg font-mono transition-all border border-slate-600 bg-slate-800/60 text-slate-400`}
      >
        {DIR_SYMBOLS[step.value] ?? step.value}
      </div>
    );
  }

  if (step.kind === "btn") {
    return (
      <div
        className={`${sizeClass} flex items-center justify-center gap-1 rounded-lg font-mono transition-all border border-blue-500/40 bg-blue-500/10 text-blue-300`}
      >
        {step.label}
      </div>
    );
  }

  // macro — distinct styling so simultaneous-press chips read as different
  return (
    <div
      title={step.macro.description}
      className={`${sizeClass} flex items-center justify-center gap-1 rounded-lg font-mono transition-all border border-purple-500/40 bg-purple-500/10 text-purple-200`}
    >
      {step.macro.label}
    </div>
  );
}
