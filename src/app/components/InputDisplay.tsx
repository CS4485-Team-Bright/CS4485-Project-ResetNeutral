const INPUT_SYMBOLS: Record<string, string> = {
  "1": "↙",
  "2": "↓",
  "3": "↘",
  "4": "←",
  "5": "●",
  "6": "→",
  "7": "↖",
  "8": "↑",
  "9": "↗",
  P: "P",
  K: "K",
  S: "S",
  H: "H",
  L: "L",
  M: "M",
};

interface InputDisplayProps {
  input: string;
  size?: "sm" | "md" | "lg";
}

export function InputDisplay({ input, size = "md" }: InputDisplayProps) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const tokens = parseInput(input);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tokens.map((token, i) => {
        if (token.type === "separator") {
          return (
            <span key={i} className="text-slate-400 mx-0.5">
              {token.value}
            </span>
          );
        }
        const isDirection = "12346789".includes(token.value);
        const isButton = "PKSHLM".includes(token.value);

        return (
          <div
            key={i}
            className={`${sizeClasses[size]} rounded-md flex items-center justify-center ${
              isDirection
                ? "bg-slate-700 border border-slate-500 text-white"
                : isButton
                ? "bg-blue-600 border border-blue-400 text-white"
                : "bg-slate-600 border border-slate-400 text-slate-200"
            }`}
          >
            {INPUT_SYMBOLS[token.value] || token.value}
          </div>
        );
      })}
    </div>
  );
}

interface Token {
  type: "input" | "separator";
  value: string;
}

function parseInput(input: string): Token[] {
  const tokens: Token[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === " ") continue;
    if (ch === ">" || ch === ",") {
      tokens.push({ type: "separator", value: ">" });
    } else if ("123456789".includes(ch)) {
      tokens.push({ type: "input", value: ch });
    } else if ("PKSHLM".includes(ch.toUpperCase())) {
      tokens.push({ type: "input", value: ch.toUpperCase() });
    } else if (ch === "[" || ch === "]" || ch === "(" || ch === ")") {
      // skip bracket notation
    } else {
      tokens.push({ type: "separator", value: ch });
    }
  }
  return tokens;
}
