import { useState } from "react";
import { HelpCircle, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles, Award } from "lucide-react";

interface QuestionItem {
  question: string;
  category: string;
  difficulty: string;
  modelAnswer: string;
  keyPoints: string[];
}

export default function QuestionsPage() {
  const [role, setRole] = useState("Software Engineer");
  const [questionType, setQuestionType] = useState("Technical & Behavioral");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      question: "Explain the difference between SQL and NoSQL databases, and when would you choose PostgreSQL over MongoDB?",
      category: "Database Systems",
      difficulty: "Intermediate",
      modelAnswer: "SQL databases like PostgreSQL are relational, table-based, and strictly enforce schemas with ACID compliance—making them essential for transactional applications like finance or order processing. NoSQL like MongoDB stores flexible JSON documents, suitable for rapidly changing data structures or high-volume logging.",
      keyPoints: [
        "ACID compliance vs Eventual Consistency",
        "Structured Schema vs Document Model",
        "Relational Foreign Key Constraints",
        "Horizontal vs Vertical Scaling strategies"
      ]
    },
    {
      question: "Describe a situation where you had a major disagreement with a teammate on architecture. How did you handle it?",
      category: "STAR Behavioral",
      difficulty: "Intermediate",
      modelAnswer: "During a major sprint, a teammate favored GraphQL while I advocated for a REST API to meet tight deadlines. I organized a 30-minute technical evaluation where we benchmarked build complexity, caching needs, and client library overhead. We reached a consensus to launch REST v1 and migrate to GraphQL in v2.",
      keyPoints: [
        "Objective data-driven decision making",
        "Active listening and respectful collaboration",
        "Focusing on product deadlines and trade-offs",
        "Documenting the architectural decision record (ADR)"
      ]
    },
    {
      question: "How does the browser rendering engine handle HTML parsing, CSSOM construction, and JavaScript execution?",
      category: "Frontend Performance",
      difficulty: "Hard",
      modelAnswer: "The browser constructs the DOM tree from HTML tokens and the CSSOM tree from CSS tokens. These combine to create the Render Tree. Layout calculates exact geometry, followed by Painting. JavaScript blocks HTML parsing unless flagged with async or defer, which can delay the Critical Rendering Path.",
      keyPoints: [
        "Critical Rendering Path stages (DOM -> CSSOM -> Render Tree -> Layout -> Paint)",
        "Script loading strategies (async vs defer)",
        "Reflow and Repaint triggers",
        "GPU compositing layers"
      ]
    }
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, questionType, count: 5 })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setExpandedIndex(0);
        }
      }
    } catch (err) {
      console.error("Failed to generate interview questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          AI Interview Question Bank & Study Guide
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate role-specific interview question sets complete with model answers and evaluation rubrics.
        </p>
      </div>

      {/* Generator Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Target Role / Specialization
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Backend Developer, Data Scientist"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Focus Question Category
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Technical & Behavioral">Technical & Behavioral Mix</option>
                <option value="System Design & Architecture">System Design & Architecture</option>
                <option value="STAR Method Behavioral">STAR Method Behavioral</option>
                <option value="Coding & Algorithm Concepts">Coding & Algorithm Concepts</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Custom Question Bank...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Question Set
              </>
            )}
          </button>
        </form>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-secondary flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Study Questions for {role} ({questions.length})
        </h2>

        {questions.map((q, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="bg-card border border-border rounded-xl overflow-hidden transition-all shadow-sm"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {q.category}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Difficulty: {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-secondary">{q.question}</h3>
                </div>
                <div className="mt-1 text-muted-foreground shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-5 border-t border-border bg-muted/20 space-y-4">
                  {/* Model Answer */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                      Recommended Model Answer:
                    </span>
                    <p className="text-sm text-foreground leading-relaxed bg-card p-4 rounded-lg border border-border">
                      {q.modelAnswer}
                    </p>
                  </div>

                  {/* Key Points recruiters look for */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Key Points Interviewers Look For:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.keyPoints.map((kp, kIdx) => (
                        <div key={kIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
