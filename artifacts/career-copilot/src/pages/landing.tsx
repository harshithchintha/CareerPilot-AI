import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Bot, Target, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-2xl font-bold font-serif text-secondary">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
            <svg viewBox="0 0 256 256" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <path d="M128 56L188 184H68L128 56Z" stroke="currentColor" strokeWidth="24" strokeLinejoin="round"/>
              <circle cx="128" cy="128" r="24" fill="currentColor"/>
            </svg>
          </div>
          Career Copilot
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary text-primary-foreground hover:bg-secondary/90 h-10 px-4 py-2">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 container mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Your Personal AI Career Coach
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-serif text-secondary max-w-4xl leading-tight mb-6">
            Get job-ready with <span className="text-primary italic">precision.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Stop guessing what hiring managers want. Analyze your resume, master mock interviews, and follow AI-generated roadmaps to land your target role faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/sign-up" className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 shadow-lg shadow-primary/20">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-20 pt-10 border-t border-border w-full max-w-3xl flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">Equipping you with</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-6 h-6 text-secondary" />
                <span className="text-sm font-medium text-secondary">ATS Analysis</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Target className="w-6 h-6 text-secondary" />
                <span className="text-sm font-medium text-secondary">Skill Mapping</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Bot className="w-6 h-6 text-secondary" />
                <span className="text-sm font-medium text-secondary">AI Mock Interviews</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
                <span className="text-sm font-medium text-secondary">Actionable Roadmaps</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Career Copilot. Empowering ambitious professionals.</p>
      </footer>
    </div>
  );
}