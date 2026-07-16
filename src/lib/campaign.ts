export type CampaignMode = "build" | "pitch" | "design" | "repair" | "learn" | "launch";

export type CampaignInput = {
  goal: string;
  timeBudget: string;
  energy: "low" | "medium" | "high";
  mode: CampaignMode;
};

export type CampaignMetric = {
  label: string;
  value: string;
  percent: number;
  tone: "neutral" | "good" | "warn";
};

export type Campaign = {
  id: string;
  goal: string;
  title: string;
  codename: string;
  subtitle: string;
  mission: string;
  victory: string;
  focus: string;
  tempo: string;
  missionCards: string[];
  rulesOfEngagement: string[];
  risks: Array<{ title: string; note: string; severity: "low" | "medium" | "high" }>;
  powerUps: string[];
  nextMoves: string[];
  metrics: CampaignMetric[];
  logLine: string;
  mode: CampaignMode;
  timeBudget: string;
  energy: CampaignInput["energy"];
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "any",
  "at",
  "be",
  "build",
  "create",
  "design",
  "for",
  "from",
  "get",
  "goal",
  "in",
  "into",
  "launch",
  "make",
  "my",
  "of",
  "or",
  "project",
  "the",
  "to",
  "turn",
  "with",
  "workflow",
]);

const COGNITIVE_VERBS = {
  build: ["shape", "assemble", "scaffold", "ship", "stabilize"],
  pitch: ["frame", "position", "clarify", "sell", "de-risk"],
  design: ["sketch", "refine", "compose", "tighten", "focus"],
  repair: ["diagnose", "untangle", "stabilize", "patch", "rebuild"],
  learn: ["study", "absorb", "map", "practice", "test"],
  launch: ["stage", "trigger", "prepare", "activate", "deliver"],
} satisfies Record<CampaignMode, string[]>;

const CODENAMES = [
  "Quiet Orbit",
  "Glass Comet",
  "Northline",
  "Signal Atlas",
  "Blue Relay",
  "Moonwake",
  "Velvet Arc",
  "Stone Circuit",
  "Field Note",
  "Sunlit Vector",
  "Paper Compass",
  "Night Ferry",
  "Relay House",
  "Amber Current",
];

const POWER_UPS = {
  build: [
    "Cut one feature and keep the sharpest proof path.",
    "Use a scaffold you can delete without regret.",
    "Keep the first pass ugly but complete.",
    "Trade polish for a real end-to-end check.",
  ],
  pitch: [
    "Lead with the problem, not the cleverness.",
    "Say the outcome before the mechanism.",
    "Use one concrete artifact as evidence.",
    "Trim any sentence that sounds like marketing fog.",
  ],
  design: [
    "Remove a panel before changing a color.",
    "Let one dominant system do the talking.",
    "Make hierarchy obvious in three seconds.",
    "Use restraint as a feature, not a compromise.",
  ],
  repair: [
    "Trace the failure path before touching the fix.",
    "Isolate the smallest reproducer.",
    "Verify the live state, not just the code path.",
    "Fix the contract before the cosmetics.",
  ],
  learn: [
    "Learn by doing one narrow thing all the way through.",
    "Write the shortest version first, then refine.",
    "Capture the rule that made it click.",
    "Turn confusion into one concrete test.",
  ],
  launch: [
    "Prepare the gate before opening the door.",
    "Verify the production path independently.",
    "Stage a fallback if the first route stalls.",
    "Keep the release note short and factual.",
  ],
};

const RISK_BANK = {
  build: [
    { title: "Scope creep", note: "The solution keeps sprouting nice-to-haves.", severity: "high" as const },
    { title: "Premature polish", note: "Time goes into surfaces before the flow works.", severity: "medium" as const },
    { title: "Missing proof", note: "A feature looks complete without being exercised.", severity: "high" as const },
    { title: "Tool drift", note: "The architecture becomes more elaborate than the value.", severity: "medium" as const },
  ],
  pitch: [
    { title: "Vague promise", note: "The idea sounds useful but not specific enough.", severity: "high" as const },
    { title: "Audience mismatch", note: "The message talks to the wrong buyer or user.", severity: "medium" as const },
    { title: "Evidence gap", note: "The pitch has claims but not enough proof.", severity: "high" as const },
    { title: "Over-explaining", note: "The message loses energy by trying to cover everything.", severity: "low" as const },
  ],
  design: [
    { title: "Hierarchy blur", note: "Too many surfaces ask for equal attention.", severity: "high" as const },
    { title: "Decorative drift", note: "The interface gets charming before it gets clear.", severity: "medium" as const },
    { title: "Clutter creep", note: "The layout keeps adding weight instead of removing it.", severity: "high" as const },
    { title: "Tone mismatch", note: "The visual language fights the actual job.", severity: "medium" as const },
  ],
  repair: [
    { title: "False fix", note: "A patch hides the real failure and returns later.", severity: "high" as const },
    { title: "Surface diagnosis", note: "The visible symptom is not the root cause.", severity: "high" as const },
    { title: "Regression risk", note: "One repair could break the adjacent path.", severity: "medium" as const },
    { title: "Verification gap", note: "The fix is not tested in the state that matters.", severity: "high" as const },
  ],
  learn: [
    { title: "Information fog", note: "Too many notes, not enough action.", severity: "medium" as const },
    { title: "Shallow recall", note: "It feels familiar but won’t hold under pressure.", severity: "high" as const },
    { title: "Practice gap", note: "The concept makes sense but the hands never do it.", severity: "high" as const },
    { title: "Over-reading", note: "The plan stays in the browser and never enters the world.", severity: "medium" as const },
  ],
  launch: [
    { title: "Gate failure", note: "The release path is blocked by a hidden dependency.", severity: "high" as const },
    { title: "Auth mismatch", note: "The protection layer behaves differently in production.", severity: "high" as const },
    { title: "Last-mile drift", note: "The deploy is good but the live page is not fully right.", severity: "medium" as const },
    { title: "Silent stall", note: "A process looks active while nothing actually advances.", severity: "medium" as const },
  ],
};

const RULES = {
  build: [
    "Ship one vertical slice end to end.",
    "Keep the UI useful before making it beautiful.",
    "Prefer components that are easy to delete.",
    "Test the exact path the user will take.",
  ],
  pitch: [
    "State the value in one sentence.",
    "Show proof before showing nuance.",
    "Make the next action obvious.",
    "Cut anything that sounds apologetic.",
  ],
  design: [
    "One dominant visual system only.",
    "Remove equal-weight panels first.",
    "Use whitespace to create authority.",
    "Treat hierarchy as the primary feature.",
  ],
  repair: [
    "Reproduce the issue before altering the code.",
    "Verify the fix in the live path.",
    "Prefer a smaller, explicit patch.",
    "Document the failure mode as you go.",
  ],
  learn: [
    "Turn every concept into one test.",
    "Practice in public, not only in notes.",
    "Keep the lesson concrete and short.",
    "Build memory by using the skill now.",
  ],
  launch: [
    "Set the gate before the deploy.",
    "Verify prod separately from local.",
    "Keep credentials and links together.",
    "Never confuse a push with a release.",
  ],
};

const NEXT_MOVES = {
  build: ["Shape the core flow.", "Wire the supporting details.", "Run lint and build.", "Exercise the real path."],
  pitch: ["Write the one-line promise.", "Collect proof.", "Trim the deck.", "Test with one skeptical reader."],
  design: ["Lock the hierarchy.", "Reduce the card count.", "Refine typography.", "Polish the spacing rhythm."],
  repair: ["Find the reproduction.", "Patch the root cause.", "Retest the live path.", "Capture the lesson."],
  learn: ["Pick one narrow example.", "Practice it once.", "Write the rule.", "Repeat with a variation."],
  launch: ["Prepare the auth gate.", "Deploy the current commit.", "Inspect the live URL.", "Confirm credentials work."],
};

const MOOD_LINES = {
  build: "Tonight is for turning a rough idea into something shippable.",
  pitch: "Tonight is for making the value impossible to miss.",
  design: "Tonight is for making the structure feel inevitable.",
  repair: "Tonight is for finding the fault line and sealing it cleanly.",
  learn: "Tonight is for learning by finishing the smallest useful version.",
  launch: "Tonight is for a clean gate, a verified deploy, and a quiet handoff.",
};

const METRIC_TEMPLATES = {
  build: [
    ["Momentum", 84, "good"],
    ["Focus load", 66, "neutral"],
    ["Proof", 72, "good"],
    ["Risk", 28, "warn"],
  ],
  pitch: [
    ["Clarity", 88, "good"],
    ["Believability", 67, "neutral"],
    ["Tension", 54, "neutral"],
    ["Risk", 32, "warn"],
  ],
  design: [
    ["Hierarchy", 91, "good"],
    ["Noise", 24, "good"],
    ["Polish", 78, "neutral"],
    ["Overload", 22, "good"],
  ],
  repair: [
    ["Repro", 85, "good"],
    ["Root cause", 62, "neutral"],
    ["Regression", 36, "warn"],
    ["Confidence", 74, "good"],
  ],
  learn: [
    ["Recall", 76, "good"],
    ["Practice", 64, "neutral"],
    ["Transfer", 58, "neutral"],
    ["Fog", 30, "warn"],
  ],
  launch: [
    ["Ready", 89, "good"],
    ["Gate", 73, "neutral"],
    ["Confidence", 81, "good"],
    ["Leakage", 18, "good"],
  ],
} satisfies Record<CampaignMode, Array<[string, number, CampaignMetric["tone"]]>>;

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function uniquePick<T>(items: T[], seed: number, count: number): T[] {
  const picked: T[] = [];
  const seen = new Set<number>();
  let offset = 0;
  while (picked.length < count && seen.size < items.length) {
    const index = (seed + offset * 7) % items.length;
    offset += 1;
    if (seen.has(index)) continue;
    seen.add(index);
    picked.push(items[index]);
  }
  return picked;
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function extractKeywords(goal: string) {
  return goal
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word && !STOPWORDS.has(word));
}

function modeLabel(mode: CampaignMode) {
  switch (mode) {
    case "build":
      return "Build mission";
    case "pitch":
      return "Pitch mission";
    case "design":
      return "Design mission";
    case "repair":
      return "Repair mission";
    case "learn":
      return "Learning mission";
    case "launch":
      return "Launch mission";
  }
}

function moodFocus(mode: CampaignMode, energy: CampaignInput["energy"]) {
  const map = {
    low: "keep the mission compact and visible",
    medium: "balance momentum with clarity",
    high: "take advantage of the stronger push and move fast",
  } as const;

  return `${map[energy]} while you ${pick(COGNITIVE_VERBS[mode], hashString(mode + energy), 2)} the highest-leverage piece first.`;
}

function chooseCodename(seed: number) {
  return pick(CODENAMES, seed, 3);
}

export function buildCampaign(input: CampaignInput): Campaign {
  const goal = input.goal.trim() || "Untitled mission";
  const seed = hashString(`${goal}|${input.timeBudget}|${input.energy}|${input.mode}`);
  const keywords = extractKeywords(goal);
  const anchor = titleCase(keywords[0] ?? "clarity");
  const second = titleCase(keywords[1] ?? pick(["vector", "signal", "orbit", "scope", "relay"], seed, 1));
  const codename = chooseCodename(seed);
  const modeName = modeLabel(input.mode);
  const verb = pick(COGNITIVE_VERBS[input.mode], seed, 1);
  const candidateRisk = uniquePick(RISK_BANK[input.mode], seed, 3);
  const timeMinutes = Number.parseInt(input.timeBudget, 10);
  const timeKnown = Number.isFinite(timeMinutes) && timeMinutes > 0 ? timeMinutes : 45;

  return {
    id: `cm-${seed.toString(36)}`,
    goal,
    title: `Project: ${anchor} ${second}`,
    codename,
    subtitle: `${modeName} · ${goal}`,
    mission: `Use ${timeKnown} minutes to ${verb} the most valuable part of “${goal}” without letting the scope widen.`,
    victory: `You can point to a concrete result, a real proof path, and a next move you’d actually ship tonight.`,
    focus: moodFocus(input.mode, input.energy),
    tempo:
      input.energy === "high"
        ? "Aggressive"
        : input.energy === "medium"
          ? "Steady"
          : "Deliberate",
    missionCards: [
      `Aim: ${titleCase(goal)}`,
      `Constraint: ${timeKnown} minutes, ${input.energy} energy`,
      `Outcome: one visible result that proves the mission is real`,
      `Style rule: stay calm, edit hard, and keep the hierarchy obvious`,
    ],
    rulesOfEngagement: RULES[input.mode],
    risks: candidateRisk,
    powerUps: uniquePick(POWER_UPS[input.mode], seed + 9, 4),
    nextMoves: NEXT_MOVES[input.mode],
    metrics: METRIC_TEMPLATES[input.mode].map(([label, value, tone], index) => ({
      label,
      value: `${Math.max(0, Math.min(100, value + ((seed + index * 11) % 7) - 3))}%`,
      percent: Math.max(0, Math.min(100, value + ((seed + index * 11) % 7) - 3)),
      tone,
    })),
    logLine: `${MOOD_LINES[input.mode]} The board is set to ${input.energy} energy and a ${input.timeBudget} target.`,
    mode: input.mode,
    timeBudget: input.timeBudget,
    energy: input.energy,
  };
}

export const DEFAULT_INPUT: CampaignInput = {
  goal: "Turn a fuzzy idea into a clean, shippable mission board",
  timeBudget: "45",
  energy: "medium",
  mode: "design",
};

export const PRESET_INPUTS: Record<string, CampaignInput> = {
  build: {
    goal: "Ship a focused app that proves the core value in one screen",
    timeBudget: "60",
    energy: "high",
    mode: "build",
  },
  pitch: {
    goal: "Make a product pitch impossible to misunderstand",
    timeBudget: "30",
    energy: "medium",
    mode: "pitch",
  },
  design: {
    goal: "Tighten a busy interface until the hierarchy feels inevitable",
    timeBudget: "45",
    energy: "medium",
    mode: "design",
  },
  repair: {
    goal: "Find the real failure path and fix it without collateral damage",
    timeBudget: "50",
    energy: "low",
    mode: "repair",
  },
  learn: {
    goal: "Learn one new tool well enough to use it without friction",
    timeBudget: "35",
    energy: "medium",
    mode: "learn",
  },
  launch: {
    goal: "Get a production release across the line with clean verification",
    timeBudget: "40",
    energy: "high",
    mode: "launch",
  },
};
