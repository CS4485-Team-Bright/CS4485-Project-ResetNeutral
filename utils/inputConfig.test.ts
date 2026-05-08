import { describe, expect, it } from "vitest";
import {
  parseNotationToSteps,
  buildKeyToButton,
  activeButtonIds,
  satisfiesMacro,
  getGameConfig,
} from "./inputConfig";

function shape(input: string, gameId: string) {
  return parseNotationToSteps(input, gameId).map((s) => {
    if (s.kind === "dir")   return s.value;
    if (s.kind === "btn")   return s.label;
    return s.macro.label;
  });
}

describe("parseNotationToSteps — Guilty Gear Strive", () => {
  const game = "guilty-gear-strive";

  it("expands the j. jumping prefix into an up-direction (8) step", () => {
    expect(shape("j.236K", game)).toEqual(["8", "2", "3", "6", "K"]);
  });

  it("strips the bt. (back-turn) prefix", () => {
    expect(shape("bt.214K", game)).toEqual(["2", "1", "4", "K"]);
  });

  it("preserves charge-direction digit inside square brackets", () => {
    expect(shape("[4]6S", game)).toEqual(["4", "6", "S"]);
  });

  it("takes the first option of a slash alternation", () => {
    expect(shape("236P/K/S/H", game)).toEqual(["2", "3", "6", "P"]);
  });

  it("ignores 'CHECK NOTES' placeholder text entirely", () => {
    expect(shape("CHECK NOTES", game)).toEqual([]);
  });

  it("strips 'during X' / 'after Y' clauses", () => {
    expect(shape("P during Weapons Free", game)).toEqual(["P"]);
    expect(shape("5H after R.T.L", game)).toEqual(["5", "H"]);
  });

  it("returns empty for empty notation", () => {
    expect(shape("", game)).toEqual([]);
  });
});

describe("parseNotationToSteps — Street Fighter 6 (Classic)", () => {
  const game = "street-fighter-6";

  it("treats LP / MP / HP / LK / MK / HK as single tokens", () => {
    expect(shape("214LP", game)).toEqual(["2", "1", "4", "LP"]);
    expect(shape("63214LK", game)).toEqual(["6", "3", "2", "1", "4", "LK"]);
    expect(shape("5HK > HP > HP", game)).toEqual(["5", "HK", "HP", "HP"]);
  });

  it("recognises bare P / K supers as any-of aliases", () => {
    const steps = parseNotationToSteps("214214P", game);
    expect(steps).toHaveLength(7);
    const last = steps[6];
    expect(last.kind).toBe("btn");
    if (last.kind === "btn") {
      expect(last.label).toBe("P");
      expect(last.ids.sort()).toEqual(["HP", "LP", "MP"]);
    }
  });

  it("recognises OD macros (PP / KK)", () => {
    expect(shape("46PP", game)).toEqual(["4", "6", "PP"]);
    expect(shape("KK or 6KK", game)).toEqual(["KK"]);
  });

  it("recognises throw / drive parry / drive impact macros", () => {
    expect(shape("LPLK", game)).toEqual(["LP+LK"]);
    expect(shape("MPMK", game)).toEqual(["MP+MK"]);
    expect(shape("HPHK", game)).toEqual(["HP+HK"]);
  });

  it("recognises 3-button (PPP / KKK) macros", () => {
    expect(shape("4PPP or KKK", game)).toEqual(["4", "PPP"]);
  });

  it("strips parenthetical annotations like (proximity), (air), (hold)", () => {
    expect(shape("236K (proximity) > K", game)).toEqual(["2", "3", "6", "K", "K"]);
    expect(shape("236P (hold)", game)).toEqual(["2", "3", "6", "P"]);
  });
});

describe("parseNotationToSteps — 2XKO", () => {
  const game = "2xko";

  it("treats S1 / S2 as single multi-char buttons", () => {
    expect(shape("2S1 > 2S1 > 2S1", game)).toEqual(["2", "S1", "2", "S1", "2", "S1"]);
    expect(shape("S2", game)).toEqual(["S2"]);
  });

  it("recognises simultaneous-press macros (LM / MH / LH / S1+S2)", () => {
    expect(shape("4MH", game)).toEqual(["4", "M+H"]);
    expect(shape("Block > 4LM", game)).toEqual(["4", "L+M"]);
    expect(shape("(2)LH", game)).toEqual(["2", "L+H"]);
    expect(shape("S1+S2", game)).toEqual(["S1+S2"]);
  });

  it("expands the inline 'j' jumping prefix into an up-direction step", () => {
    expect(shape("jS2", game)).toEqual(["8", "S2"]);
    expect(shape("jS2 > jS2", game)).toEqual(["8", "S2", "8", "S2"]);
    expect(shape("j.2H", game)).toEqual(["8", "2", "H"]);
  });

  it("preserves the digit inside (2) / (6) charge parens", () => {
    expect(shape("(6)S2 > 6S2", game)).toEqual(["6", "S2", "6", "S2"]);
    expect(shape("(2)S1", game)).toEqual(["2", "S1"]);
  });
});

describe("parseNotationToSteps — fallback for unknown games", () => {
  it("uses the generic P/K/S/H/L/M alphabet", () => {
    expect(shape("236P", "unknown-game")).toEqual(["2", "3", "6", "P"]);
  });
});

describe("Movement-prefix expansion (j → up, d → down)", () => {
  it("emits up (8) for both `j.X` and inline `jX` forms", () => {
    expect(shape("j.236K", "guilty-gear-strive")).toEqual(["8", "2", "3", "6", "K"]);
    expect(shape("jS2", "2xko")).toEqual(["8", "S2"]);
    expect(shape("j.2H", "2xko")).toEqual(["8", "2", "H"]);
  });

  it("emits down (2) for both `d.X` and inline `dX` forms", () => {
    expect(shape("d.236K", "guilty-gear-strive")).toEqual(["2", "2", "3", "6", "K"]);
    expect(shape("dS2", "2xko")).toEqual(["2", "S2"]);
  });

  it("treats jc. (jump-cancel) as an up-direction press too", () => {
    expect(shape("jc.214P", "guilty-gear-strive")).toEqual(["8", "2", "1", "4", "P"]);
  });

  it("recognises the `+` form (d+X / j+X / jc+X) the same as the dot form", () => {
    expect(shape("d+PP", "street-fighter-6")).toEqual(["2", "PP"]);
    expect(shape("d+HK", "street-fighter-6")).toEqual(["2", "HK"]);
    expect(shape("j+HP", "street-fighter-6")).toEqual(["8", "HP"]);
    expect(shape("jc+H", "guilty-gear-strive")).toEqual(["8", "H"]);
    // tolerates whitespace around the +
    expect(shape("d + PP", "street-fighter-6")).toEqual(["2", "PP"]);
    // works mid-string after a separator
    expect(shape("5L > d+M", "2xko")).toEqual(["5", "L", "2", "M"]);
  });

  it("does NOT confuse the `+` in macro tokens like S1+S2", () => {
    // S1+S2 is a defined 2XKO macro and must stay one chip even though it
    // contains a +; the d/j prefix expansion is anchored on word boundary.
    expect(shape("S1+S2", "2xko")).toEqual(["S1+S2"]);
    expect(shape("S2+L/M/H", "2xko")).toEqual(["S2", "L"]);
  });

  it("expands prefixes mid-string after >, , or ~ separators", () => {
    expect(shape("5L > j.2H", "2xko")).toEqual(["5", "L", "8", "2", "H"]);
    expect(shape("236K~jH", "guilty-gear-strive")).toEqual(["2", "3", "6", "K", "8", "H"]);
  });

  it("does NOT touch uppercase D — that's GGST's Dust button", () => {
    expect(shape("236D", "guilty-gear-strive")).toEqual(["2", "3", "6", "D"]);
    expect(shape("4D", "guilty-gear-strive")).toEqual(["4", "D"]);
  });

  it("still strips bt. and w. as state-only prefixes", () => {
    expect(shape("bt.214K", "guilty-gear-strive")).toEqual(["2", "1", "4", "K"]);
    expect(shape("w.SS", "guilty-gear-strive")).toEqual(["S", "S"]);
  });
});

describe("buildKeyToButton & activeButtonIds", () => {
  it("maps keyboard keys to the right per-game buttons", () => {
    expect(buildKeyToButton("guilty-gear-strive")["j"]).toBe("P");
    expect(buildKeyToButton("street-fighter-6")["u"]).toBe("LP");
    expect(buildKeyToButton("2xko")["u"]).toBe("S1");
  });

  it("translates a Set of held keys into the corresponding button ids", () => {
    const held = new Set(["u", "i"]);
    expect(activeButtonIds(held, "street-fighter-6")).toEqual(new Set(["LP", "MP"]));
    expect(activeButtonIds(held, "2xko")).toEqual(new Set(["S1", "S2"]));
  });
});

describe("satisfiesMacro", () => {
  const sf6 = getGameConfig("street-fighter-6");
  const xko = getGameConfig("2xko");

  it("any-of macro PP requires 2 distinct punches", () => {
    const pp = sf6.macros.find((m) => m.id === "PP")!;
    expect(satisfiesMacro(pp, new Set(["LP"]))).toBe(false);
    expect(satisfiesMacro(pp, new Set(["LP", "MP"]))).toBe(true);
    expect(satisfiesMacro(pp, new Set(["LP", "HP", "MP"]))).toBe(true);
    expect(satisfiesMacro(pp, new Set(["LP", "LK"]))).toBe(false);
  });

  it("all-required macro LM needs both L and M held", () => {
    const lm = xko.macros.find((m) => m.id === "LM")!;
    expect(satisfiesMacro(lm, new Set(["L"]))).toBe(false);
    expect(satisfiesMacro(lm, new Set(["L", "M"]))).toBe(true);
    expect(satisfiesMacro(lm, new Set(["L", "M", "H"]))).toBe(true);
    expect(satisfiesMacro(lm, new Set(["M", "H"]))).toBe(false);
  });
});
