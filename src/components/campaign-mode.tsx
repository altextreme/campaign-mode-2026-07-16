"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Flame,
  LayoutGrid,
  Play,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Target,
  TimerReset,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_INPUT,
  PRESET_INPUTS,
  buildCampaign,
  type Campaign,
  type CampaignInput,
  type CampaignMode,
} from "@/lib/campaign";

type StoredCampaign = Campaign & { createdAt: string };

const STORAGE_KEY = "campaign-mode-history";
const MODE_OPTIONS: Array<{ id: CampaignMode; label: string; tagline: string }> = [
  { id: "design", label: "Design", tagline: "tune hierarchy" },
  { id: "build", label: "Build", tagline: "ship a slice" },
  { id: "pitch", label: "Pitch", tagline: "clarify value" },
  { id: "repair", label: "Repair", tagline: "trace the fault" },
  { id: "learn", label: "Learn", tagline: "practice the move" },
  { id: "launch", label: "Launch", tagline: "verify the release" },
];

const ENERGY_OPTIONS: Array<CampaignInput["energy"]> = ["low", "medium", "high"];

function clampHistory(items: StoredCampaign[]) {
  return items.slice(0, 6);
}

function statTone(tone: Campaign["metrics"][number]["tone"]) {
  if (tone === "good") return "text-emerald-700";
  if (tone === "warn") return "text-amber-700";
  return "text-stone-700";
}

function statTrack(tone: Campaign["metrics"][number]["tone"]) {
  if (tone === "good") return "bg-emerald-700";
  if (tone === "warn") return "bg-amber-700";
  return "bg-stone-700";
}

function severityTone(level: "low" | "medium" | "high") {
  if (level === "high") return "border-rose-300 bg-rose-50 text-rose-800";
  if (level === "medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-stone-200 bg-stone-50 text-stone-700";
}

function energyLabel(value: CampaignInput["energy"]) {
  return value[0].toUpperCase() + value.slice(1);
}

function CampaignRail({ campaign }: { campaign: Campaign }) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <section className="border border-stone-200 bg-white/80 p-4 backdrop-blur-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-stone-500">
              Mission rail
            </p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">{campaign.codename}</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center border border-stone-200 bg-stone-50 text-stone-800">
            <Target className="h-5 w-5" />
          </div>
        </div>

        <p className="text-sm leading-6 text-stone-600">{campaign.logLine}</p>

        <div className="mt-5 space-y-4">
          {campaign.metrics.map((metric) => (
            <div key={metric.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.28em] text-stone-500">
                <span>{metric.label}</span>
                <span className={statTone(metric.tone)}>{metric.value}</span>
              </div>
              <div className="h-1.5 w-full bg-stone-200">
                <div className={`h-1.5 ${statTrack(metric.tone)}`} style={{ width: `${metric.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-stone-200 bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-stone-500">
          <Flame className="h-4 w-4" />
          Tempo
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="font-serif text-3xl text-stone-900">{campaign.tempo}</p>
            <p className="mt-1 text-sm text-stone-600">{energyLabel(campaign.energy)} energy, {campaign.timeBudget} minute target</p>
          </div>
          <div className="rounded-none border border-stone-200 bg-stone-50 px-3 py-2 text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-500">Mode</p>
            <p className="mt-1 text-sm font-medium text-stone-800">{campaign.mode}</p>
          </div>
        </div>
      </section>

      <section className="border border-stone-200 bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-stone-500">
          <BadgeCheck className="h-4 w-4" />
          Victory condition
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-700">{campaign.victory}</p>
      </section>
    </aside>
  );
}

function MissionCards({ campaign }: { campaign: Campaign }) {
  return (
    <section className="border border-stone-200 bg-white/90 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-stone-500">Current mission</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-stone-900 sm:text-4xl">
            {campaign.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">{campaign.subtitle}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 border border-stone-200 bg-stone-50 px-3 py-2 text-xs uppercase tracking-[0.28em] text-stone-600 md:flex">
          <Clock3 className="h-4 w-4" />
          Tonight
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <article className="border border-stone-200 bg-stone-50/80 p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">Mission brief</p>
          <p className="mt-3 font-serif text-2xl leading-tight text-stone-900 sm:text-[2rem]">{campaign.mission}</p>
          <p className="mt-4 text-sm leading-6 text-stone-600">{campaign.focus}</p>
        </article>

        <article className="border border-stone-200 bg-white p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">Rules of engagement</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-stone-700">
            {campaign.rulesOfEngagement.map((rule, index) => (
              <li key={rule} className="flex gap-3 border-b border-stone-100 pb-2 last:border-none last:pb-0">
                <span className="font-mono text-xs text-stone-400">0{index + 1}</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <article className="border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-stone-500">
            <Sparkles className="h-4 w-4" />
            Mission cards
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-stone-700">
            {campaign.missionCards.map((card) => (
              <li key={card} className="border-b border-stone-100 pb-2 last:border-none last:pb-0">
                {card}
              </li>
            ))}
          </ul>
        </article>

        <article className="border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-stone-500">
            <ShieldAlert className="h-4 w-4" />
            Risks
          </div>
          <div className="mt-4 space-y-3">
            {campaign.risks.map((risk) => (
              <div key={risk.title} className={`border p-3 ${severityTone(risk.severity)}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{risk.title}</p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
                    {risk.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-5 opacity-90">{risk.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-stone-500">
            <Wand2 className="h-4 w-4" />
            Power-ups
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-stone-700">
            {campaign.powerUps.map((power) => (
              <li key={power} className="flex gap-3 border-b border-stone-100 pb-2 last:border-none last:pb-0">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <span>{power}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-stone-500">
            <TimerReset className="h-4 w-4" />
            Next moves
          </div>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-stone-700">
            {campaign.nextMoves.map((move, index) => (
              <li key={move} className="flex gap-3 border-b border-stone-100 pb-2 last:border-none last:pb-0">
                <span className="font-mono text-xs text-stone-400">0{index + 1}</span>
                <span>{move}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}

function MissionComposer({
  input,
  onInputChange,
  onGenerate,
  onPreset,
  onLaunch,
}: {
  input: CampaignInput;
  onInputChange: (next: CampaignInput) => void;
  onGenerate: () => void;
  onPreset: (preset: CampaignMode) => void;
  onLaunch: () => void;
}) {
  return (
    <section className="border border-stone-200 bg-white/90 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-stone-500">Mission composer</p>
          <h3 className="mt-2 font-serif text-2xl text-stone-900">Set the campaign brief</h3>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-stone-800"
        >
          <RefreshCcw className="h-4 w-4" />
          Reroll
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">Goal</span>
          <input
            value={input.goal}
            onChange={(event) => onInputChange({ ...input, goal: event.target.value })}
            className="border-b border-stone-300 bg-transparent px-0 py-3 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-900"
            placeholder="What should tonight’s campaign accomplish?"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">Time budget</span>
            <div className="relative">
              <input
                value={input.timeBudget}
                onChange={(event) => onInputChange({ ...input, timeBudget: event.target.value })}
                inputMode="numeric"
                className="w-full border-b border-stone-300 bg-transparent px-0 py-3 pr-12 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-900"
                placeholder="45"
              />
              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-[0.28em] text-stone-400">
                min
              </span>
            </div>
          </label>

          <div className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">Energy</span>
            <div className="grid grid-cols-3 gap-2">
              {ENERGY_OPTIONS.map((energy) => (
                <button
                  key={energy}
                  type="button"
                  onClick={() => onInputChange({ ...input, energy })}
                  className={`border px-3 py-2 text-sm transition ${
                    input.energy === energy
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  {energyLabel(energy)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">Mode</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {MODE_OPTIONS.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onPreset(mode.id)}
                className={`border p-3 text-left transition ${
                  input.mode === mode.id
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{mode.label}</span>
                  <Plus className="h-4 w-4" />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] opacity-80">
                  {mode.tagline}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onLaunch}
            className="inline-flex flex-1 items-center justify-center gap-2 border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-stone-800"
          >
            <Play className="h-4 w-4" />
            Launch mission
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex flex-1 items-center justify-center gap-2 border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
          >
            <Sparkles className="h-4 w-4" />
            Regenerate board
          </button>
        </div>
      </div>
    </section>
  );
}

function MissionLog({
  history,
  onRestore,
}: {
  history: StoredCampaign[];
  onRestore: (item: StoredCampaign) => void;
}) {
  return (
    <section className="border border-stone-200 bg-white/90 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-stone-500">Mission log</p>
          <h3 className="mt-2 font-serif text-2xl text-stone-900">Recent campaigns</h3>
        </div>
        <LayoutGrid className="h-5 w-5 text-stone-500" />
      </div>

      <div className="mt-4 space-y-3">
        {history.length === 0 ? (
          <p className="text-sm leading-6 text-stone-500">Launch a mission and it will land here for quick recall.</p>
        ) : (
          history.map((item) => (
            <button
              key={item.id + item.createdAt}
              type="button"
              onClick={() => onRestore(item)}
              className="w-full border border-stone-200 bg-stone-50 p-3 text-left transition hover:border-stone-300 hover:bg-stone-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-900">{item.codename}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">{item.subtitle}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-400">{item.mode}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

export function CampaignModeApp() {
  const [input, setInput] = useState<CampaignInput>(DEFAULT_INPUT);
  const [campaign, setCampaign] = useState<Campaign>(() => buildCampaign(DEFAULT_INPUT));
  const [history, setHistory] = useState<StoredCampaign[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const rawHistory = window.localStorage.getItem(STORAGE_KEY);
      if (rawHistory) {
        try {
          const parsed = JSON.parse(rawHistory) as StoredCampaign[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(clampHistory(parsed));
            setCampaign(parsed[0]);
            setInput({
              goal: parsed[0].goal || DEFAULT_INPUT.goal,
              timeBudget: parsed[0].timeBudget,
              energy: parsed[0].energy,
              mode: parsed[0].mode,
            });
            return;
          }
        } catch {
          // Ignore malformed storage and continue with the fresh default.
        }
      }

      const initial = buildCampaign(DEFAULT_INPUT);
      setCampaign(initial);
      setHistory([
        {
          ...initial,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (history.length === 0) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const restoredCampaign = useMemo(() => campaign, [campaign]);

  function generate(nextInput = input) {
    const next = buildCampaign(nextInput);
    setCampaign(next);
    setHistory((current) =>
      clampHistory([
        {
          ...next,
          createdAt: new Date().toISOString(),
        },
        ...current.filter((item) => item.id !== next.id),
      ]),
    );
  }

  function launchMission() {
    generate(input);
  }

  function setPreset(mode: CampaignMode) {
    const preset = PRESET_INPUTS[mode];
    setInput(preset);
    generate(preset);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,75,65,0.08),_transparent_30%),linear-gradient(180deg,#fbf9f4_0%,#f6f2ea_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-4 sm:px-6 lg:px-10 lg:py-6">
        <header className="mb-5 flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-stone-500">
              Campaign Mode / Stitch-first mission board
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
              Turn a fuzzy goal into a playable mission.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              A calm, game-like planner for the work you want to finish tonight. It uses editorial hierarchy,
              restrained color, and a tactical mission board to keep the next move unmistakable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-xs uppercase tracking-[0.22em] text-stone-500">
              <Sparkles className="h-4 w-4" />
              Stitch-guided
            </span>
            <span className="inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-xs uppercase tracking-[0.22em] text-stone-500">
              <Clock3 className="h-4 w-4" />
              Local first
            </span>
          </div>
        </header>

        <main className="grid flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <CampaignRail campaign={restoredCampaign} />

          <div className="flex flex-col gap-4">
            <MissionCards campaign={restoredCampaign} />
            <div className="grid gap-4 xl:grid-cols-2">
              <MissionComposer
                input={input}
                onInputChange={setInput}
                onGenerate={() => generate()}
                onPreset={setPreset}
                onLaunch={launchMission}
              />
              <section className="border border-stone-200 bg-white/90 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-stone-500">Campaign promise</p>
                    <h3 className="mt-2 font-serif text-2xl text-stone-900">Why this app earns a place on your desk</h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-stone-400" />
                </div>

                <div className="mt-4 space-y-4 text-sm leading-6 text-stone-600">
                  <p>
                    Campaign Mode is useful when the next project feels too large to start cleanly. It compresses
                    the problem into a mission board with visible constraints, risks, and exact next moves.
                  </p>
                  <p>
                    It is also designed to be fun: the app gives the work a codename, generates a tactical board,
                    and stores recent missions so you can return to a clear frame instead of restarting from
                    scratch.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border border-stone-200 bg-stone-50 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone-500">Value</p>
                      <p className="mt-2 text-sm text-stone-700">Reduces scope fog and turns planning into a concrete flow.</p>
                    </div>
                    <div className="border border-stone-200 bg-stone-50 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone-500">Fun</p>
                      <p className="mt-2 text-sm text-stone-700">Feels like a mission deck rather than a dry productivity form.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <MissionLog history={history} onRestore={(item) => {
            const restored: CampaignInput = {
              goal: item.goal,
              timeBudget: item.timeBudget,
              energy: item.energy,
              mode: item.mode,
            };
            setInput(restored);
            setCampaign(item);
          }} />
        </main>

        <footer className="mt-5 border-t border-stone-200 pt-4 text-xs uppercase tracking-[0.24em] text-stone-500">
          Campaign Mode · built locally first, then verified for production
        </footer>
      </div>
    </div>
  );
}
