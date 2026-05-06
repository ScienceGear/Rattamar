import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Home,
  Shuffle,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { SUBJECTS, type Question, type SubjectKey } from "@/lib/quizData";
import {
  getBadge,
  loadProgress,
  resetProgress,
  saveLast,
  saveProgress,
  shuffleArr,
} from "@/lib/progress";

interface QuizSearch {
  resume?: number;
}

export const Route = createFileRoute("/quiz/$subject")({
  validateSearch: (s: Record<string, unknown>): QuizSearch => ({
    resume: s.resume === 1 || s.resume === "1" ? 1 : undefined,
  }),
  head: ({ params }) => {
    const subj = SUBJECTS[params.subject as SubjectKey];
    const name = subj?.name ?? "Quiz";
    return {
      meta: [
        { title: `${name} — Rattamar` },
        { name: "description", content: `Practice ${name} MCQs with mastery tracking and XP.` },
      ],
    };
  },
  component: QuizPage,
  ssr: false,
});

function QuizPage() {
  const { subject: subjectParam } = Route.useParams();
  const { resume } = Route.useSearch();
  const navigate = useNavigate();

  const subject = SUBJECTS[subjectParam as SubjectKey];
  if (!subject) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-muted-foreground">Unknown subject.</p>
        <Link to="/" className="mt-4 inline-block text-primary">
          Back to home
        </Link>
      </div>
    );
  }

  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>(() => subject.questions);
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    if (resume === 1) {
      try {
        const last = JSON.parse(window.localStorage.getItem("rattamar_lastSession") || "null");
        if (last && last.subjectKey === subject.key) return Math.min(last.idx, subject.questions.length - 1);
      } catch {
        /* noop */
      }
    }
    return 0;
  });
  const [progress, setProgress] = useState(() => loadProgress(subject.key));
  const [sessionScore, setSessionScore] = useState({
    correct: 0,
    attempted: 0,
    streak: 0,
    bestStreak: 0,
  });

  const q = sessionQuestions[currentIdx];

  // ============================================================
  // SHUFFLE LOGIC — CRITICAL
  // Each question's `correctAnswer` is an INDEX into the ORIGINAL
  // options array. Once we shuffle, that index no longer points to
  // the right choice. We capture the *text* of the correct option
  // BEFORE shuffling and later determine correctness by comparing
  // option TEXT — never displayed position. The user can never
  // memorize positions, only the actual answer content.
  // ============================================================
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [correctText, setCorrectText] = useState<string>("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const answered = selectedIdx !== null;

  const prepareQuestion = useCallback((qq: Question) => {
    setCorrectText(qq.options[qq.correctAnswer]);
    setShuffledOptions(shuffleArr(qq.options));
    setSelectedIdx(null);
  }, []);

  useEffect(() => {
    if (q) prepareQuestion(q);
  }, [q, prepareQuestion]);

  // Persist last session whenever index changes
  useEffect(() => {
    saveLast({ subjectKey: subject.key, idx: currentIdx });
  }, [currentIdx, subject.key]);

  const total = subject.questions.length;
  const masteredCount = progress.mastered.length;
  const pct = total ? Math.round((masteredCount / total) * 100) : 0;
  const badge = useMemo(() => getBadge(pct), [pct]);

  const triggerConfetti = useRef(false);
  useEffect(() => {
    if (masteredCount >= total && !triggerConfetti.current) {
      triggerConfetti.current = true;
      const end = Date.now() + 2500;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [masteredCount, total]);

  const handleAnswer = (i: number) => {
    if (answered) return;
    setSelectedIdx(i);
    const chosen = shuffledOptions[i];
    const isCorrect = chosen === correctText;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isCorrect) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // ignore
    }

    setSessionScore((s) => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      return {
        correct: s.correct + (isCorrect ? 1 : 0),
        attempted: s.attempted + 1,
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
      };
    });

    setProgress((prev) => {
      const next = { ...prev, correctCounts: { ...prev.correctCounts }, mastered: [...prev.mastered] };
      next.totalAttempts++;
      if (isCorrect) {
        next.totalCorrect++;
        next.xp += 10;
        next.correctCounts[q.id] = (next.correctCounts[q.id] || 0) + 1;
        // Mastery: 2 correct answers
        if (next.correctCounts[q.id] >= 2 && !next.mastered.includes(q.id)) {
          next.mastered.push(q.id);
        }
      } else {
        next.xp += 3;
        if (next.correctCounts[q.id]) {
          next.correctCounts[q.id] = Math.max(0, next.correctCounts[q.id] - 1);
        }
      }
      saveProgress(subject.key, next);
      return next;
    });
  };

  const goNext = () => {
    if (currentIdx < sessionQuestions.length - 1) setCurrentIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const toggleShuffle = () => {
    const newVal = !shuffleQuestions;
    setShuffleQuestions(newVal);
    const cur = q;
    const reordered = newVal ? shuffleArr(subject.questions) : subject.questions.slice();
    setSessionQuestions(reordered);
    const newIdx = reordered.findIndex((x) => x.id === cur.id);
    setCurrentIdx(newIdx >= 0 ? newIdx : 0);
  };

  const exitToHome = () => {
    if (!answered) {
      const ok = window.confirm(
        "Leave this session and return home? Your saved mastery progress is kept.",
      );
      if (!ok) return;
    }
    navigate({ to: "/" });
  };

  if (masteredCount >= total) {
    return <CompleteScreen subjectKey={subject.key} />;
  }

  if (!q) return null;

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8 animate-fade-up">
      {/* Top bar */}
      <div className={`overflow-hidden rounded-2xl border ${subject.themeBorder} bg-card shadow-soft`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white sm:px-6 ${subject.themeBg}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={exitToHome}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur hover:bg-white/25"
              aria-label="Back to home"
            >
              <Home className="h-4 w-4" />
            </button>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/80">
                You are learning
              </div>
              <div className="text-base font-bold sm:text-lg">{subject.name}</div>
            </div>
          </div>
          <button
            onClick={toggleShuffle}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              shuffleQuestions ? "bg-white text-foreground" : "bg-white/15 text-white hover:bg-white/25"
            }`}
            title="Toggle question shuffle"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Shuffle Qs {shuffleQuestions ? "ON" : "OFF"}
          </button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.className}`}
          >
            {badge.name}
          </span>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>You are <b className="text-foreground">{pct}%</b> close to mastering this</span>
              <span>{masteredCount}/{total}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${subject.themeBg} transition-[width] duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill icon={<Trophy className="h-3.5 w-3.5" />} label="Score" value={`${sessionScore.correct}/${sessionScore.attempted}`} />
        <StatPill icon={<Flame className="h-3.5 w-3.5 text-warning" />} label="Streak" value={`${sessionScore.streak}`} />
        <StatPill icon={<Sparkles className="h-3.5 w-3.5 text-primary" />} label="XP" value={`${progress.xp}`} />
      </div>

      {/* Question card */}
      <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold">
            Question {currentIdx + 1} <span className="text-muted-foreground/70">/ {sessionQuestions.length}</span>
          </span>
          {progress.mastered.includes(q.id) ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
              <Check className="h-3 w-3" /> Mastered
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
              {progress.correctCounts[q.id] ? `${progress.correctCounts[q.id]}/2` : "Practicing"}
            </span>
          )}
        </div>

        <h2 className="text-lg font-bold leading-snug sm:text-xl">{q.question}</h2>

        <div className="mt-5 space-y-2.5">
          {shuffledOptions.map((opt, i) => {
            const isCorrect = opt === correctText;
            const isSelected = selectedIdx === i;
            let cls =
              "border-border bg-card hover:border-primary/40 hover:bg-accent/40";
            let labelCls = "bg-muted text-muted-foreground";
            let icon: React.ReactNode = null;
            let extra = "";
            if (answered) {
              if (isCorrect) {
                cls = "border-success bg-success/10";
                labelCls = "bg-success text-success-foreground";
                extra = "animate-pulse-correct";
                icon = <Check className="ml-auto h-5 w-5 text-success" />;
              } else if (isSelected) {
                cls = "border-destructive bg-destructive/10";
                labelCls = "bg-destructive text-destructive-foreground";
                extra = "animate-shake";
                icon = <X className="ml-auto h-5 w-5 text-destructive" />;
              } else {
                cls = "border-border bg-card opacity-60";
              }
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => handleAnswer(i)}
                className={`group flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all disabled:cursor-default sm:py-3.5 ${cls} ${extra} ${
                  !answered ? "hover:-translate-y-0.5 hover:shadow-soft" : ""
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${labelCls}`}
                >
                  {labels[i]}
                </span>
                <span className="flex-1 text-sm sm:text-base">{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {answered && q.explanation && (
          <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 animate-fade-up">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Explanation
            </div>
            <div className="text-sm leading-relaxed">{q.explanation}</div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Prev
          </button>
          {answered ? (
            currentIdx < sessionQuestions.length - 1 ? (
              <button
                onClick={goNext}
                className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold shadow-soft ${subject.themeBtn}`}
              >
                Next Question <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold shadow-soft ${subject.themeBtn}`}
              >
                Finish Session
              </Link>
            )
          ) : (
            <span className="text-xs text-muted-foreground">Choose an answer</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-soft">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-lg font-extrabold tracking-tight sm:text-xl">{value}</div>
    </div>
  );
}

function CompleteScreen({ subjectKey }: { subjectKey: SubjectKey }) {
  const subject = SUBJECTS[subjectKey];
  const navigate = useNavigate();
  useEffect(() => {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 65, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 65, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 animate-fade-up">
      <div className="rounded-3xl border-4 border-warning/60 bg-card p-8 text-center shadow-elevated">
        <div className="mb-3 text-6xl">🏆</div>
        <h2 className="text-3xl font-extrabold tracking-tight">Subject Complete!</h2>
        <p className="mt-3 text-muted-foreground">
          You have mastered every question in <b className="text-foreground">{subject.name}</b>.
          You are now a{" "}
          <span className="rounded-md bg-warning px-2 py-0.5 text-sm font-bold text-warning-foreground">
            Master
          </span>
          .
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              if (window.confirm(`Reset all progress for ${subject.name}?`)) {
                resetProgress(subject.key);
                saveLast(null);
                navigate({ to: "/" });
              }
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-soft ${subject.themeBtn}`}
          >
            Reset Progress
          </button>
          <Link
            to="/"
            className="rounded-xl bg-muted px-5 py-2.5 text-sm font-bold hover:bg-accent"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
