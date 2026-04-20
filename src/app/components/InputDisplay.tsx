const INPUT_SYMBOLS: Record<string, string> = {
  "1": "↙\uFE0E",
  "2": "↓\uFE0E",
  "3": "↘\uFE0E",
  "4": "←\uFE0E",
  "5": "●",
  "6": "→\uFE0E",
  "7": "↖\uFE0E",
  "8": "↑\uFE0E",
  "9": "↗\uFE0E",
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
    sm: "min-h-[2rem] min-w-[2rem] text-xs px-2",
    md: "min-h-[2.5rem] min-w-[2.5rem] text-sm px-2.5",
    lg: "min-h-[3rem] min-w-[3rem] text-base px-3",
  };

  const tokens = parseInput(input);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tokens.map((token, i) => {
        if (token.type === "separator") {
          return (
            <span key={i} className="text-slate-500 mx-0.5 font-mono text-sm leading-[0]">
              {token.value}
            </span>
          );
        }
        
        const isButton = "PKSHLM".includes(token.value);

        // Styling matches the sleek Practice Arena sequence chips
        const chipStyles = isButton
          ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
          : "border-slate-600 bg-slate-800/60 text-slate-400";

        return (
          <div
            key={i}
            className={`${sizeClasses[size]} flex items-center justify-center gap-1 rounded-lg font-mono transition-all border ${chipStyles}`}
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
  let i = 0;
  
  while (i < input.length) {
    if (input[i] === " ") {
      i++;
      continue;
    }

    // Group alphabetical letters together into words
    const letterMatch = input.slice(i).match(/^[a-zA-Z]+/);
    if (letterMatch) {
      const word = letterMatch[0];
      const upper = word.toUpperCase();
      
      if (["P", "K", "S", "H", "L", "M"].includes(upper)) {
        tokens.push({ type: "input", value: upper });
      } else if (["HP", "HK", "LP", "LK", "MP", "MK"].includes(upper)) {
        tokens.push({ type: "input", value: upper[1] }); // Grab the P/K base
      } else {
        // It's a standard word like "charged", "air", "hold"
        tokens.push({ type: "separator", value: word });
      }
      i += word.length;
      continue;
    }
    
    const ch = input[i];
    if (ch === ">" || ch === ",") {
      tokens.push({ type: "separator", value: ">" });
    } else if ("123456789".includes(ch)) {
      tokens.push({ type: "input", value: ch });
    } else if (ch === "[" || ch === "]" || ch === "(" || ch === ")") {
      // skip bracket notation
    } else {
      tokens.push({ type: "separator", value: ch });
    }
    i++;
  }
  return tokens;
}
