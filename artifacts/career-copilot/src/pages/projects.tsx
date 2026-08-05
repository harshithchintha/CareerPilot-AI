import { useState } from "react";
import { Sparkles, Code, CheckCircle, Clock, ArrowRight, Layers, Lightbulb, Loader2 } from "lucide-react";

interface Project {
  title: string;
  description: string;
  skillsTargeted: string[];
  difficulty: string;
  estimatedHours: number;
  architectureOverview: string;
  keyFeatures: string[];
}

export default function ProjectsPage() {
  const [targetRole, setTargetRole] = useState("Full Stack Engineer");
  const [missingSkillsInput, setMissingSkillsInput] = useState("Docker, GraphQL, AWS, Microservices");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([
    {
      title: "AI-Powered Career & Resume Analytics SaaS",
      description: "A production full-stack web application that parses resume data, evaluates ATS scores, and provides real-time AI interview coaching.",
      skillsTargeted: ["TypeScript", "Node.js", "PostgreSQL", "Gemini AI", "Tailwind CSS"],
      difficulty: "Intermediate",
      estimatedHours: 25,
      architectureOverview: "React + Vite frontend, Express REST API backend, PostgreSQL database managed via Drizzle ORM, Google Gemini AI integration.",
      keyFeatures: [
        "Secure User Authentication & Session Management",
        "Interactive Resume Parsing & ATS Keyword Analysis",
        "AI Mock Interview Simulator with Text-to-Speech",
        "Personalized Career Learning Roadmaps"
      ]
    },
    {
      title: "Distributed Task Queue & Microservice Monitor",
      description: "Build an event-driven task processing system that handles async background jobs, retries, rate limiting, and real-time telemetry.",
      skillsTargeted: ["Docker", "GraphQL", "AWS / Cloud", "Microservices"],
      difficulty: "Advanced",
      estimatedHours: 35,
      architectureOverview: "Node.js microservices wrapped in Docker containers, Redis pub/sub queue, GraphQL API gateway, and Prometheus monitoring dashboard.",
      keyFeatures: [
        "Distributed job queue with dynamic worker scaling",
        "GraphQL schema federation for service metrics",
        "Docker Compose setup for quick local developer orchestration",
        "Cloud deployment automated via GitHub Actions CI/CD"
      ]
    }
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const skillsArray = missingSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/projects/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          missingSkills: skillsArray
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.error("Failed to generate project recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Portfolio Project Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">
          Bridge your technical skill gaps with tailored, production-ready portfolio project blueprints recruiters love.
        </p>
      </div>

      {/* Form Input */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Engineer"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Skills to Target / Bridge (comma-separated)
              </label>
              <input
                type="text"
                value={missingSkillsInput}
                onChange={(e) => setMissingSkillsInput(e.target.value)}
                placeholder="e.g. Docker, GraphQL, AWS, System Design"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Tailored Project Ideas
              </>
            )}
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-serif text-secondary flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Recommended Project Blueprints ({projects.length})
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary">{proj.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      <Code className="w-3.5 h-3.5" />
                      {proj.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{proj.estimatedHours} Hours
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {proj.description}
              </p>

              {/* Skills targeted */}
              <div>
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">
                  Skills Target & Demonstrate:
                </span>
                <div className="flex flex-wrap gap-2">
                  {proj.skillsTargeted.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-md border border-secondary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Architecture */}
              <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-1">
                <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  Recommended Architecture & Tech Stack
                </span>
                <p className="text-xs text-muted-foreground">{proj.architectureOverview}</p>
              </div>

              {/* Key Features */}
              <div>
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">
                  Key Portfolio Feature Deliverables:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {proj.keyFeatures.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
