import arthaNita from "@/data/arthaNita.json";
import arthaNitiQuiz from "@/data/arthaNitiQuiz.json";
import kutayala from "@/data/kutayala.json";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type SubjectKey = "arthaNita" | "artha-niti-quiz" | "kutayala";

export interface Subject {
  key: SubjectKey;
  name: string;
  tagline: string;
  questions: Question[];
  /** Tailwind utility tokens — themed via design system */
  themeBg: string;       // gradient utility
  themeBadge: string;    // badge bg color class
  themeRing: string;     // focus ring class
  themeBtn: string;      // solid button class
  themeText: string;     // text color class
  themeBorder: string;   // border color class
  themeSoft: string;     // soft tint bg
}

export const SUBJECTS: Record<SubjectKey, Subject> = {
  arthaNita: {
    key: "arthaNita",
    name: "Artha Nita",
    tagline: "The Indic Tradition of Wealth & Polity",
    questions: arthaNita as Question[],
    themeBg: "bg-gradient-artha",
    themeBadge: "bg-artha text-artha-foreground",
    themeRing: "focus-visible:ring-artha",
    themeBtn: "bg-artha text-artha-foreground hover:opacity-90",
    themeText: "text-artha",
    themeBorder: "border-artha/30",
    themeSoft: "bg-artha/10",
  },
  "artha-niti-quiz": {
    key: "artha-niti-quiz",
    name: "Artha Niti Quiz",
    tagline: "Artha Niti question bank (50 questions)",
    questions: arthaNitiQuiz as Question[],
    themeBg: "bg-gradient-niti",
    themeBadge: "bg-niti text-niti-foreground",
    themeRing: "focus-visible:ring-niti",
    themeBtn: "bg-niti text-niti-foreground hover:opacity-90",
    themeText: "text-niti",
    themeBorder: "border-niti/30",
    themeSoft: "bg-niti/10",
  },
  kutayala: {
    key: "kutayala",
    name: "Kutayala",
    tagline: "Kautilya's Arthashastra",
    questions: kutayala as Question[],
    themeBg: "bg-gradient-kuta",
    themeBadge: "bg-kuta text-kuta-foreground",
    themeRing: "focus-visible:ring-kuta",
    themeBtn: "bg-kuta text-kuta-foreground hover:opacity-90",
    themeText: "text-kuta",
    themeBorder: "border-kuta/30",
    themeSoft: "bg-kuta/10",
  },
};

export const SUBJECT_LIST = Object.values(SUBJECTS);
