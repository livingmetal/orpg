// Dice notation roller. Supports standard RPG notation like:
//   "d20", "2d6", "3d8+2", "1d100-5", "4d6"
//
// This is intentionally self-contained and deterministic-friendly:
// pass a custom `rng` to make rolls reproducible in tests.

export interface DieGroup {
  count: number;
  sides: number;
}

export interface DiceExpression {
  groups: DieGroup[];
  modifier: number;
}

export interface DiceRollResult {
  notation: string;
  rolls: { sides: number; value: number }[];
  modifier: number;
  total: number;
}

const NOTATION_RE = /^\s*(\d*d\d+(?:\s*[+-]\s*\d*d\d+)*)\s*([+-]\s*\d+)?\s*$/i;
const GROUP_RE = /([+-]?)\s*(\d*)d(\d+)/gi;

export function parseNotation(notation: string): DiceExpression {
  if (!NOTATION_RE.test(notation)) {
    throw new Error(`Invalid dice notation: "${notation}"`);
  }

  const groups: DieGroup[] = [];
  let match: RegExpExecArray | null;
  GROUP_RE.lastIndex = 0;
  while ((match = GROUP_RE.exec(notation)) !== null) {
    const count = match[2] === "" ? 1 : parseInt(match[2], 10);
    const sides = parseInt(match[3], 10);
    if (count < 1 || count > 1000) throw new Error("Die count out of range (1-1000)");
    if (sides < 2 || sides > 1000) throw new Error("Die sides out of range (2-1000)");
    groups.push({ count, sides });
  }

  // Trailing flat modifier, e.g. "+2" or "-5".
  const modMatch = notation.match(/([+-]\s*\d+)\s*$/);
  const modifier = modMatch ? parseInt(modMatch[1].replace(/\s+/g, ""), 10) : 0;

  return { groups, modifier };
}

export function roll(notation: string, rng: () => number = Math.random): DiceRollResult {
  const { groups, modifier } = parseNotation(notation);
  const rolls: { sides: number; value: number }[] = [];

  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      rolls.push({ sides: group.sides, value: 1 + Math.floor(rng() * group.sides) });
    }
  }

  const total = rolls.reduce((sum, r) => sum + r.value, 0) + modifier;
  return { notation, rolls, modifier, total };
}
