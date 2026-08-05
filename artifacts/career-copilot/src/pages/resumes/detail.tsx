import { useParams, Link } from "wouter";
import { 
  useGetResume, 
  useAnalyzeResume, 
  useGetResumeAnalysis, 
  useGetResumeImprovements,
  getGetResumeQueryKey,
  getGetResumeAnalysisQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Loader2,
  TrendingUp,
  FileSearch,
  PenTool
} from "lucide-react";

export default function ResumeDetailPage() {
  const { id } = useParams();
  const resumeId = parseInt(id!);
  const queryClient = useQueryClient();

  const { data: resume, isLoading: resumeLoading } = useGetResume(resumeId, { 
    query: { enabled: !!resumeId, queryKey: getGetResumeQueryKey(resumeId) } 
  });
  
  const { data: analysis, isLoading: analysisLoading } = useGetResumeAnalysis(resumeId, {
    query: { enabled: !!resumeId, queryKey: getGetResumeAnalysisQueryKey(resumeId) }
  });

  const improvementsMutation = useGetResumeImprovements();
  const analyzeMutation = useAnalyzeResume();

  const handleAnalyze = () => {
    analyzeMutation.mutate({ id: resumeId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetResumeAnalysisQueryKey(resumeId) });
        queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey(resumeId) });
        improvementsMutation.mutate({ id: resumeId });
      }
    });
  };

  if (resumeLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!resume) {
    return <div className="p-8 text-center text-muted-foreground">Resume not found</div>;
  }

  const improvements = improvementsMutation.data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/resumes" className="text-sm font-medium text-muted-foreground hover:text-secondary mb-2 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Resumes
          </Link>
          <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight flex items-center gap-3">
            {resume.title}
            {resume.isDefault && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase tracking-wider font-bold">Default</span>}
          </h1>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={analyzeMutation.isPending || improvementsMutation.isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary text-primary-foreground hover:bg-secondary/90 h-10 px-4 py-2 disabled:opacity-50"
        >
          {analyzeMutation.isPending || improvementsMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><Activity className="w-4 h-4 mr-2" /> Run AI Analysis</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted/50 p-4 border-b flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-medium text-secondary">Document Content</h3>
            </div>
            <div className="p-6">
              <pre className="font-mono text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {resume.content}
              </pre>
            </div>
          </div>

          {/* AI Improvements (if available) */}
          {improvements && improvements.suggestions && improvements.suggestions.length > 0 && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-primary/5 p-4 border-b flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-secondary font-serif">AI Rewrite Suggestions</h3>
              </div>
              <div className="divide-y">
                {improvements.rewrittenSections.map((rewrite, i) => (
                  <div key={i} className="p-6">
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 rounded bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        {rewrite.section}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-xs font-bold text-red-800 mb-2 uppercase">Original</p>
                        <p className="text-sm text-red-900/80">{rewrite.original}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-100 relative">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-border hidden md:flex items-center justify-center text-muted-foreground z-10">
                          <ArrowLeft className="w-3 h-3 rotate-180" />
                        </div>
                        <p className="text-xs font-bold text-green-800 mb-2 uppercase flex items-center gap-1">
                          Improved <CheckCircle2 className="w-3 h-3" />
                        </p>
                        <p className="text-sm text-green-900/90 font-medium">{rewrite.improved}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-6">
          {!analysis && !analysisLoading ? (
            <div className="bg-card border border-dashed rounded-xl p-8 text-center shadow-sm">
              <FileSearch className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-secondary mb-2">No Analysis Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Run the AI analysis to get your ATS score and feedback.</p>
              <button 
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary text-primary-foreground hover:bg-secondary/90 h-10 px-4 py-2"
              >
                Run Analysis Now
              </button>
            </div>
          ) : analysisLoading ? (
            <div className="bg-card border rounded-xl p-8 flex flex-col items-center justify-center shadow-sm h-[400px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Analyzing document...</p>
            </div>
          ) : analysis ? (
            <>
              {/* Score Card */}
              <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-green-500"></div>
                <h3 className="font-bold text-secondary mb-6 w-full text-left font-serif">ATS Score</h3>
                <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/50" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="439.8" 
                      strokeDashoffset={439.8 - (439.8 * analysis.atsScore) / 100}
                      className={`transition-all duration-1000 ${
                        analysis.atsScore >= 80 ? 'text-green-500' :
                        analysis.atsScore >= 60 ? 'text-amber-500' :
                        'text-red-500'
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-secondary">{analysis.atsScore}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">/ 100</span>
                  </div>
                </div>
                
                <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Impact</div>
                    <div className="font-bold text-secondary">{analysis.impactScore}</div>
                  </div>
                  <div className="text-center border-l border-r">
                    <div className="text-xs text-muted-foreground mb-1">Content</div>
                    <div className="font-bold text-secondary">{analysis.contentScore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Format</div>
                    <div className="font-bold text-secondary">{analysis.formattingScore}</div>
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-secondary mb-3 flex items-center gap-2 font-serif">
                  <TrendingUp className="w-4 h-4 text-primary" /> Overall Feedback
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.overallFeedback}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-green-50 border-b border-green-100">
                  <h3 className="font-bold text-green-800 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-red-50 border-b border-red-100">
                  <h3 className="font-bold text-red-800 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Found */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-serif">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Detected Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.skillsFound.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-muted text-secondary text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}