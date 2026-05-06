import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Trophy, Flame, BookOpen, ChevronRight, RotateCcw } from "lucide-react";
import { SUBJECT_LIST, SUBJECTS, type Subject } from "@/lib/quizData";
import { loadProgress, loadLast, saveLast, getBadge } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rattamar — Choose Your Subject" },
      {
        name: "description",
        content:
          "Pick a subject and start mastering MCQs with shuffled options, mastery tracking and gamified XP.",
      },
    ],
  }),
  component: HomePage,
  ssr: false,
});

function HomePage() {
  const [tick, setTick] = useState(0);
  // Re-read localStorage after mount (it's client-only)
  useEffect(() => setTick((n) => n + 1), []);
  void tick;

  const last = typeof window !== "undefined" ? loadLast() : null;
  const lastSubject = last && SUBJECTS[last.subjectKey];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-14 animate-fade-up">
      {/* Hero */}
      <header className="mb-10 text-center sm:mb-14">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Gamified MCQ Learning
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          <span className="bg-gradient-brand bg-clip-text text-transparent">Rattamar</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          This is just a practice platform based on question banks from a Telegram group, nothing else. But you should prepare, so start preparing. Choose your course and start preparing.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/Artha Niti_QB.pdf"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <BookOpen className="h-4 w-4" />
            Download Artha Niti PDF
          </a>
          <a
            href="/Kautilya's Arthashastra_QB.pdf"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <BookOpen className="h-4 w-4" />
            Download Kautilya's Arthashastra PDF
          </a>
        </div>
      </header>

      {/* Resume bar */}
      {lastSubject && last && last.idx > 0 && (
        <ResumeBar
          subject={lastSubject}
          idx={last.idx}
          onDismiss={() => {
            saveLast(null);
            setTick((n) => n + 1);
          }}
        />
      )}

      <h2 className="mb-5 text-center text-lg font-semibold text-muted-foreground">
        Choose your subject
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SUBJECT_LIST.map((s) => (
          <SubjectCard key={s.key} subject={s} />
        ))}
      </div>

      <Stats />
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const prog = loadProgress(subject.key);
  const total = subject.questions.length;
  const masteredCount = prog.mastered.length;
  const pct = total ? Math.round((masteredCount / total) * 100) : 0;
  const badge = getBadge(pct);
  const initials = subject.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <Link
      to="/quiz/$subject"
      params={{ subject: subject.key }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card p-1 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <div className={`relative overflow-hidden rounded-[1.4rem] ${subject.themeBg} p-6 text-white`}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-125" />
        <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur-sm">
            {initials}
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.className}`}
          >
            {badge.name}
          </span>
        </div>
        <div className="relative mt-4">
          <div className="text-2xl font-extrabold leading-tight">{subject.name}</div>
          <div className="mt-1 text-xs text-white/80">{subject.tagline}</div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">{pct}% Mastered</span>
          <span className="text-muted-foreground">
            {masteredCount} / {total} learned
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${subject.themeBg} transition-[width] duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" /> {prog.xp} XP
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> {total}
            </span>
          </div>
          <div
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${subject.themeBtn}`}
          >
            Start
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ResumeBar({
  subject,
  idx,
  onDismiss,
}: {
  subject: Subject;
  idx: number;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${subject.themeBg} text-white`}>
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">Continue {subject.name}?</div>
          <div className="text-xs text-muted-foreground">
            You stopped at question {idx + 1}
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2 sm:w-auto">
        <Link
          to="/quiz/$subject"
          params={{ subject: subject.key }}
          search={{ resume: 1 }}
          className={`flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold sm:flex-none ${subject.themeBtn}`}
        >
          Resume
        </Link>
        <button
          onClick={onDismiss}
          className="inline-flex items-center gap-1 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

function Stats() {
  const totalQs = SUBJECT_LIST.reduce((a, s) => a + s.questions.length, 0);
  const totalMastered = SUBJECT_LIST.reduce(
    (a, s) => a + loadProgress(s.key).mastered.length,
    0,
  );
  const totalXp = SUBJECT_LIST.reduce((a, s) => a + loadProgress(s.key).xp, 0);
  return (
    <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
      <StatCell label="Questions" value={totalQs} />
      <StatCell label="Mastered" value={totalMastered} />
      <StatCell label="Total XP" value={totalXp} />
    </div>
  );
}
function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
      <div className="text-2xl font-extrabold tracking-tight sm:text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
