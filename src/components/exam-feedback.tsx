import { useState } from "react";
import { Sparkles, Star } from "lucide-react";

export type FeedbackTheme = {
  themeBg: string;
  themeRing: string;
  themeBtn: string;
  themeSoft: string;
  themeText: string;
};

const DEFAULT_THEME: FeedbackTheme = {
  themeBg: "bg-gradient-brand",
  themeRing: "focus-visible:ring-primary",
  themeBtn: "bg-primary text-primary-foreground hover:opacity-90",
  themeSoft: "bg-primary/10",
  themeText: "text-primary",
};

export default function ExamFeedback({
  theme,
  headline = "Live exam feedback",
  subhead = "Share your experience and leave a quick rating.",
}: {
  theme?: FeedbackTheme;
  headline?: string;
  subhead?: string;
}) {
  const activeTheme = theme ?? DEFAULT_THEME;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = name.trim().length >= 2 && message.trim().length >= 5;

  const submitFeedback = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/90 p-6 shadow-elevated backdrop-blur sm:p-8">
      <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full ${activeTheme.themeBg} opacity-25 blur-2xl`} />
      <div className={`absolute -bottom-12 -left-10 h-32 w-32 rounded-full ${activeTheme.themeBg} opacity-20 blur-2xl`} />

      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Exam feedback
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">{headline}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{subhead}</p>

          <form onSubmit={submitFeedback} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={`h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus-visible:ring-2 ${activeTheme.themeRing}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a quick note about your experience"
                rows={4}
                className={`w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 ${activeTheme.themeRing}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`rounded-lg p-1 transition ${submitted ? "cursor-default" : "hover:-translate-y-0.5"}`}
                    aria-label={`Rate ${star} stars`}
                    disabled={submitted}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating >= star ? "text-warning fill-current" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-xs font-semibold text-muted-foreground">{rating}/5</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit || submitted}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50 ${activeTheme.themeBtn}`}
              >
                {submitted ? "Feedback sent" : "Send feedback"}
              </button>
              <span className="text-xs text-muted-foreground">We only show name, message, and your stars.</span>
            </div>
          </form>

          {submitted && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 animate-fade-up">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your feedback
              </div>
              <div className="mt-2 text-sm font-semibold">{name.trim()}</div>
              <div className="mt-1 text-sm text-foreground/90">{message.trim()}</div>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      rating >= star ? "text-warning fill-current" : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-soft sm:p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Thank you note
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            May be this site is helpful for you to prepare the exam, and thank you for using it. If you
            need any more kind of stuff, let me know, and thanks for your support. Wish you all the
            best!
          </p>
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeTheme.themeSoft} ${activeTheme.themeText}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Premium study vibes
          </div>
        </div>
      </div>
    </div>
  );
}
