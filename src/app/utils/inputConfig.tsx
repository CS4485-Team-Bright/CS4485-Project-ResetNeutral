// Per-game input configuration & tokenizer.
//
// Each supported game defines its own button vocabulary (e.g. GGST has
// P/K/S/H/D, SF6 Classic has LP/MP/HP/LK/MK/HK, 2XKO has L/M/H/S1/S2/T/P/DASH),
// and may also define macros (simultaneous multi-button presses such as
// SF6's "PP" / "LPLK" or 2XKO's "LM" / "MH").
//
// The tokenizer here is responsible for converting a raw move-list notation
// string (e.g. "j.236[K]" or "214214P" or "(2)S1") into a flat list of
// practice steps that the Practice Arena can step through and that the
// InputDisplay can render as chips.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single attack/utility button on a particular game's controller. */
export interface ButtonDef {
  /** Canonical id used inside move notation (e.g. "LP", "S1", "P"). */
  id: string;
  /** Display label rendered on chips and in the button-grid legend. */
  label: string;
  /** Long-form description shown in the legend (e.g. "Light Punch"). */
  description: string;
  /** Lower-cased keyboard key bound to this button (matches `e.key.toLowerCase()`). */
  key: string;
  /** Optional controller-button hint (e.g. "X", "RT"). Mirrors controls.txt. */
  controller?: string;
}

/** A macro = simultaneous multi-button press. */
export type MacroSpec =
  | { kind: "all"; required: string[] }
  | { kind: "anyOf"; pool: string[]; count: number };

export interface MacroDef {
  /** Notation token that triggers this macro (e.g. "PP", "LM", "S1+S2"). */
  id: string;
  /** Display label rendered on the chip (e.g. "PP", "L+M"). */
  label: string;
  /** Tooltip / legend text. */
  description: string;
  spec: MacroSpec;
}

export interface GameInputConfig {
  gameId: string;
  buttons: ButtonDef[];
  macros: MacroDef[];
  /**
   * Notation aliases — used when a single token in notation should be
   * satisfied by ANY of several real buttons. E.g. in SF6 a Critical Art
   * notated `214214P` accepts any punch button, so "P" → ["LP","MP","HP"].
   */
  notationAliases: Record<string, string[]>;
}

/** Output of the tokenizer — the unit the Practice Arena steps through. */
export type ParsedStep =
  | { kind: "dir"; value: string }                    // "1".."9"
  | { kind: "btn"; ids: string[]; label: string }     // accepts any of `ids`
  | { kind: "macro"; macro: MacroDef };               // simultaneous press

// ---------------------------------------------------------------------------
// Per-game configurations
// ---------------------------------------------------------------------------

const guiltyGearStrive: GameInputConfig = {
  gameId: "guilty-gear-strive",
  buttons: [
    { id: "P", label: "P", description: "Punch",       key: "j", controller: "X"  },
    { id: "K", label: "K", description: "Kick",        key: "k", controller: "A"  },
    { id: "S", label: "S", description: "Slash",       key: "l", controller: "Y"  },
    { id: "H", label: "H", description: "Heavy Slash", key: ";", controller: "B"  },
    { id: "D", label: "D", description: "Dust",        key: "u", controller: "RB" },
  ],
  macros: [],
  notationAliases: {},
};

const streetFighter6: GameInputConfig = {
  gameId: "street-fighter-6",
  buttons: [
    { id: "LP", label: "LP", description: "Light Punch",  key: "u", controller: "X"  },
    { id: "MP", label: "MP", description: "Medium Punch", key: "i", controller: "Y"  },
    { id: "HP", label: "HP", description: "Heavy Punch",  key: "o", controller: "RT" },
    { id: "LK", label: "LK", description: "Light Kick",   key: "j", controller: "A"  },
    { id: "MK", label: "MK", description: "Medium Kick",  key: "k", controller: "B"  },
    { id: "HK", label: "HK", description: "Heavy Kick",   key: "l", controller: "RB" },
  ],
  macros: [
    { id: "LPLK", label: "LP+LK", description: "Throw (LP+LK)",      spec: { kind: "all",   required: ["LP", "LK"] } },
    { id: "MPMK", label: "MP+MK", description: "Drive Parry (MP+MK)", spec: { kind: "all",   required: ["MP", "MK"] } },
    { id: "HPHK", label: "HP+HK", description: "Drive Impact (HP+HK)", spec: { kind: "all", required: ["HP", "HK"] } },
    { id: "PPP",  label: "PPP",   description: "All three punches",  spec: { kind: "anyOf", pool: ["LP", "MP", "HP"], count: 3 } },
    { id: "KKK",  label: "KKK",   description: "All three kicks",    spec: { kind: "anyOf", pool: ["LK", "MK", "HK"], count: 3 } },
    { id: "PP",   label: "PP",    description: "Two punches (OD)",   spec: { kind: "anyOf", pool: ["LP", "MP", "HP"], count: 2 } },
    { id: "KK",   label: "KK",    description: "Two kicks (OD)",     spec: { kind: "anyOf", pool: ["LK", "MK", "HK"], count: 2 } },
  ],
  // Bare `P` / `K` in SF6 notation (Supers, Critical Arts) — any punch / kick satisfies.
  notationAliases: {
    P: ["LP", "MP", "HP"],
    K: ["LK", "MK", "HK"],
  },
};

const twoXKO: GameInputConfig = {
  gameId: "2xko",
  buttons: [
    { id: "L",    label: "L",    description: "Light",     key: "j", controller: "X"  },
    { id: "M",    label: "M",    description: "Medium",    key: "k", controller: "Y"  },
    { id: "H",    label: "H",    description: "Heavy",     key: "l", controller: "B"  },
    { id: "S1",   label: "S1",   description: "Special 1", key: "u", controller: "LT" },
    { id: "S2",   label: "S2",   description: "Special 2", key: "i", controller: "RT" },
    { id: "T",    label: "T",    description: "Tag",       key: "o", controller: "A"  },
    { id: "P",    label: "P",    description: "Parry",     key: ";", controller: "LB" },
    { id: "DASH", label: "Dash", description: "Dash",      key: " ", controller: "RB" },
  ],
  macros: [
    { id: "S1+S2", label: "S1+S2", description: "Specials together (S1+S2)", spec: { kind: "all", required: ["S1", "S2"] } },
    { id: "LM",    label: "L+M",   description: "Light + Medium",            spec: { kind: "all", required: ["L", "M"]   } },
    { id: "MH",    label: "M+H",   description: "Medium + Heavy",            spec: { kind: "all", required: ["M", "H"]   } },
    { id: "LH",    label: "L+H",   description: "Light + Heavy",             spec: { kind: "all", required: ["L", "H"]   } },
  ],
  notationAliases: {},
};

/**
 * Fallback config used when a gameId isn't recognised. Keeps the original
 * generic button alphabet so unknown / new games still work in the arena.
 */
const fallback: GameInputConfig = {
  gameId: "_fallback",
  buttons: [
    { id: "P", label: "P", description: "Punch",       key: "j" },
    { id: "K", label: "K", description: "Kick",        key: "k" },
    { id: "S", label: "S", description: "Slash",       key: "l" },
    { id: "H", label: "H", description: "Heavy",       key: ";" },
    { id: "L", label: "L", description: "Light",       key: "u" },
    { id: "M", label: "M", description: "Medium",      key: "i" },
  ],
  macros: [],
  notationAliases: {},
};

const REGISTRY: Record<string, GameInputConfig> = {
  [guiltyGearStrive.gameId]: guiltyGearStrive,
  [streetFighter6.gameId]:   streetFighter6,
  [twoXKO.gameId]:           twoXKO,
};

/** Return the config for a gameId, or the fallback if unknown. */
export function getGameConfig(gameId: string | null | undefined): GameInputConfig {
  if (!gameId) return fallback;
  return REGISTRY[gameId] ?? fallback;
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Strip notational clutter from a raw move-input string.
 *
 *  - Keep only the first option of any `or` / `/` alternation
 *  - Drop parenthetical annotations: "(air)", "(hold)", "(2 stock)", ...
 *  - Drop common prefixes: "j.", "bt.", "w.", "jc."
 *  - Strip charge brackets: "[4]6S" → "46S"
 *  - Strip stray brackets and the followup separators ">", ","
 */
function preprocessNotation(raw: string): string {
  let s = raw;

  // 1. "X or Y" → keep the first (case-insensitive)
  s = s.split(/\s+or\s+/i)[0];

  // 2. Handle parentheticals.
  //    "(2)S1" / "(6)S2" — charge motions: keep the digit so it shows up as a step.
  //    "(air)" / "(hold)" / "(2 stock)" / "(w/ enhanced clone)" — drop entirely.
  s = s.replace(/\(([^)]*)\)/g, (_match, inner: string) => {
    const trimmed = inner.trim();
    if (/^[1-9](?:\s*\/\s*[1-9])*$/.test(trimmed)) {
      // Pure-digit (or digit-alternation) — keep first digit as a charge direction.
      return trimmed.split("/")[0].trim();
    }
    return " ";
  });

  // 3. Followup separators ">", ",", "~" → whitespace BEFORE prefix
  //    handling so that mid-string prefixes (e.g. "5L > j.2H") are recognised
  //    at a word boundary. Brackets/slashes/etc. handled later.
  s = s.replace(/[>,~]/g, " ");
  // Drop trailing/embedded clauses like "after R.T.L", "during Backdash".
  s = s.split(/\s+(?:after|during|in|on|while)\s+/i)[0];

  // 4. Movement prefixes — convert into explicit direction inputs so the
  //    Practice Arena requires the player to actually press the direction.
  //
  //      lowercase  j.X  /  jX  /  j+X  /  jc.X  /  jc+X  →  "8 X"   (up)
  //      lowercase  u.X  /  u+X                            →  "8 X"   (up)
  //      lowercase  f.X  /  f+X                            →  "6 X"   (forward)
  //      st.X                                               →  "5 X"   (neutral / standing)
  //      lowercase  b.X  /  b+X                            →  "4 X"   (back)
  //      lowercase  d.X  /  dX  /  d+X  /  cr.X            →  "2 X"   (down)
  //
  //    The "+" form is what fighting-game wikis often use to mean "press the
  //    direction together with the button" (e.g. "d+PP" = crouch + double-
  //    punch macro). It works with or without whitespace around the +.
  //
  //    Case-sensitive on purpose: GGST's `D` (uppercase, Dust button) and any
  //    other capital-letter button must NOT get rewritten as a direction.
  s = s.replace(/(^|\s)jc(?:\.|\s*\+|(?=[A-Z]))/g, "$1 8 ");
  s = s.replace(/(^|\s)j(?:\.|\s*\+|(?=[A-Z]))/g,  "$1 8 ");
  s = s.replace(/(^|\s)u(?:\.|\s*\+|(?=[A-Z]))/g,  "$1 8 ");
  s = s.replace(/(^|\s)f(?:\.|\s*\+|(?=[A-Z]))/g,  "$1 6 ");
  s = s.replace(/(^|\s)st\./gi,                     "$1 5 ");
  s = s.replace(/(^|\s)b(?:\.|\s*\+|(?=[A-Z]))/g,  "$1 4 ");
  s = s.replace(/(^|\s)cr\./gi,                     "$1 2 ");
  s = s.replace(/(^|\s)d(?:\.|\s*\+|(?=[A-Z]))/g,  "$1 2 ");

  // 5. Named motion shortcuts — universal fighting-game wiki conventions that
  //    expand to the underlying numpad sequence so the player has to actually
  //    perform the motion. Applied AFTER directional prefixes so that single-
  //    letter rules (b+, f+, u+) don't accidentally chew off the trailing
  //    direction letter of a multi-letter motion (qcb+, qcf+, hcb+, hcf+).
  //    Case-insensitive: data uses both `dr`/`DR` and `qcb`/`QCB`.
  const motionShortcuts: Array<[RegExp, string]> = [
    [/(^|\s)qcf\s*\+/gi,  "$1 236 "],
    [/(^|\s)qcb\s*\+/gi,  "$1 214 "],
    [/(^|\s)hcf\s*\+/gi,  "$1 41236 "],
    [/(^|\s)hcb\s*\+/gi,  "$1 63214 "],
    [/(^|\s)srk\s*\+/gi,  "$1 623 "],     // shoryuken / Z-motion
    [/(^|\s)dp\s*\+/gi,   "$1 623 "],     // "dragon punch" alias for srk
    [/(^|\s)dd\s*\+/gi,   "$1 22 "],      // double-down
    // SF6 system mechanics. These macro ids only exist in the SF6 game config;
    // for other games the resulting characters will fall through harmlessly.
    [/(^|\s)DI\b/g,       "$1 HPHK "],    // Drive Impact   — HP+HK macro
    [/(^|\s)DR\b/gi,      "$1 MPMK "],    // Drive Rush     — MP+MK macro
  ];
  for (const [rx, rep] of motionShortcuts) s = s.replace(rx, rep);

  // 6. "xx" cancel separator — fighting-game shorthand for "cancel into",
  //    same role as ">". Replaced with whitespace so the rest of the
  //    pipeline treats it as a clean step boundary.
  s = s.replace(/(^|\s)xx(?=\s|$)/gi, "$1 ");

  // 5. Strip prefixes that are state markers, not directional intent:
  //      bt.  — back-turn (Leo Whitefang)
  //      w.   — Weapons Free (Unika)  /  inline `wX` before uppercase
  s = s.replace(/(^|\s)bt\./gi, "$1");
  s = s.replace(/(^|\s)w\./gi, "$1");
  s = s.replace(/(^|\s)w(?=[A-Z])/g, "$1");

  // 6. Charge-direction brackets [X] → X
  s = s.replace(/\[(\d+)\]/g, "$1");
  // Bracketed button alternations like [P/K/S] → first option
  s = s.replace(/\[([^\]]+)\]/g, (_, inner: string) => inner.split("/")[0]);

  // 7. Slash alternations like "236P/K/S/H" → "236P", "A/B" → "A"
  //    Run this several times to collapse chained alternations.
  for (let i = 0; i < 5; i++) {
    const next = s.replace(/([A-Za-z0-9]+)(?:\s*\/\s*[A-Za-z0-9]+)+/g, "$1");
    if (next === s) break;
    s = next;
  }

  return s;
}

interface RecognizableEntry {
  /** Original token (case preserved) used for matching. */
  id: string;
  upper: string;
  len: number;
  kind: "btn" | "macro";
  /** For btn: list of button ids that satisfy. For macro: spec via `macro`. */
  aliasIds?: string[];
  macro?: MacroDef;
}

function buildRecognizableTable(cfg: GameInputConfig): RecognizableEntry[] {
  const entries: RecognizableEntry[] = [];
  for (const b of cfg.buttons) {
    entries.push({ id: b.id, upper: b.id.toUpperCase(), len: b.id.length, kind: "btn", aliasIds: [b.id] });
  }
  for (const m of cfg.macros) {
    entries.push({ id: m.id, upper: m.id.toUpperCase(), len: m.id.length, kind: "macro", macro: m });
  }
  for (const [alias, ids] of Object.entries(cfg.notationAliases)) {
    entries.push({ id: alias, upper: alias.toUpperCase(), len: alias.length, kind: "btn", aliasIds: [...ids] });
  }
  // Greedy longest-match: sort by length DESC. Stable for ties.
  entries.sort((a, b) => b.len - a.len);
  return entries;
}

/**
 * Convert a move notation string into a sequence of practice steps for the
 * given game. Direction tokens are single digits "1".."9". Button tokens
 * carry one or more accepted button ids (an `anyOf` for SF6's bare P/K).
 * Macro tokens carry the full MacroDef so the runtime can check
 * simultaneous-press satisfaction.
 */
export function parseNotationToSteps(raw: string, gameId: string): ParsedStep[] {
  if (!raw) return [];
  const cfg = getGameConfig(gameId);
  const recognizable = buildRecognizableTable(cfg);
  const s = preprocessNotation(raw);

  const out: ParsedStep[] = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (/\s/.test(ch)) { i++; continue; }

    // Directions are always single numpad digits 1-9.
    if (ch >= "1" && ch <= "9") {
      out.push({ kind: "dir", value: ch });
      i++;
      continue;
    }

    // Try to greedily match a button or macro starting at position i.
    let matched = false;
    const remaining = s.slice(i);
    const remainingUpper = remaining.toUpperCase();
    for (const r of recognizable) {
      if (remainingUpper.length < r.len) continue;
      if (remainingUpper.slice(0, r.len) !== r.upper) continue;
      if (r.kind === "btn") {
        out.push({ kind: "btn", ids: r.aliasIds!.slice(), label: r.id });
      } else {
        out.push({ kind: "macro", macro: r.macro! });
      }
      i += r.len;
      matched = true;
      break;
    }
    if (matched) continue;

    // No recognised id at this position. If we're inside a run of letters,
    // skip the entire run — that way unknown words like "CHECK NOTES" or
    // "Block" / "Whirl" can't have stray letters mis-matched as buttons.
    if (/[A-Za-z]/.test(ch)) {
      while (i < s.length && /[A-Za-z]/.test(s[i])) i++;
      continue;
    }

    // Unknown punctuation (e.g. "+", residual marks). Skip one char.
    i++;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a keyboard-key → button-id lookup table for a game. */
export function buildKeyToButton(gameId: string): Record<string, string> {
  const cfg = getGameConfig(gameId);
  const map: Record<string, string> = {};
  for (const b of cfg.buttons) {
    map[b.key.toLowerCase()] = b.id;
  }
  return map;
}

/** Turn a Set of currently-held keyboard keys into the set of held button ids. */
export function activeButtonIds(activeKeys: Set<string>, gameId: string): Set<string> {
  const keyMap = buildKeyToButton(gameId);
  const ids = new Set<string>();
  for (const k of activeKeys) {
    const id = keyMap[k.toLowerCase()];
    if (id) ids.add(id);
  }
  return ids;
}

/** True if the given set of held button ids satisfies the macro spec. */
export function satisfiesMacro(macro: MacroDef, heldIds: Set<string>): boolean {
  const spec = macro.spec;
  if (spec.kind === "all") {
    return spec.required.every((id) => heldIds.has(id));
  }
  // anyOf: count distinct held buttons from the pool
  let n = 0;
  for (const id of spec.pool) if (heldIds.has(id)) n++;
  return n >= spec.count;
}

/** Pretty label for a step — used by the Practice Arena chips. */
export function stepLabel(step: ParsedStep): string {
  switch (step.kind) {
    case "dir":   return step.value;
    case "btn":   return step.label;
    case "macro": return step.macro.label;
  }
}