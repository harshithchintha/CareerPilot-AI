import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetJob, 
  useListResumes, 
  useMatchJobWithResume, 
  useListJobMatches,
  getGetJobQueryKey,
  getListJobMatchesQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Briefcase, 
  ArrowLeft,
  Building,
  Target,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  FileText
} from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams();
  const jobId = parseInt(id!);
  const queryClient = useQueryClient();

  const { data: job, isLoading: jobLoading } = useGetJob(jobId, { 
    query: { queryKey: getGetJobQueryKey(jobId), enabled: !!jobId } 
  });
  
  const { data: resumes } = useListResumes();
  
  const { data: matches, isLoading: matchesLoading } = useListJobMatches(jobId, {
    query: { enabled: !!jobId, queryKey: getListJobMatchesQueryKey(jobId) }
  });

  const matchMutation = useMatchJobWithResume();
  
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  const handleMatch = () => {
    if (!selectedResumeId) return;
    matchMutation.mutate({ 
      id: jobId,
      data: { resumeId: parseInt(selectedResumeId) } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobMatchesQueryKey(jobId) });
      }
    });
  };

  if (jobLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-muted-foreground">Job not found</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-secondary mb-2 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight">
            {job.title}
          </h1>
          {job.company && (
            <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
              <Building className="w-4 h-4" />
              {job.company}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description & Skills */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-secondary font-serif mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Extracted Requirements
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-md">
                  {skill}
                </span>
              ))}
              {job.requiredSkills.length === 0 && (
                <span className="text-sm text-muted-foreground italic">No specific skills extracted.</span>
              )}
            </div>
          </div>
          
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted/50 p-4 border-b flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-medium text-secondary">Original Description</h3>
            </div>
            <div className="p-6">
              <pre className="font-sans text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.description}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column - Matching */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm bg-gradient-to-b from-secondary to-secondary/95 text-secondary-foreground">
            <h3 className="font-bold text-lg mb-2 font-serif text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" /> Match with Resume
            </h3>
            <p className="text-sm text-secondary-foreground/70 mb-6">
              Compare this job against one of your resumes to find skill gaps.
            </p>
            
            <div className="space-y-4">
              <div>
                <select 
                  className="w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary [&>option]:text-secondary [&>option]:bg-white"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  <option value="" disabled>Select a resume...</option>
                  {resumes?.map(r => (
                    <option key={r.id} value={r.id}>{r.title} {r.isDefault ? "(Default)" : ""}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleMatch}
                disabled={!selectedResumeId || matchMutation.isPending}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
              >
                {matchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calculate Match Score"}
              </button>
            </div>
          </div>

          {matchesLoading ? (
            <div className="bg-card border rounded-xl p-8 flex flex-col items-center justify-center shadow-sm h-[300px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Loading matches...</p>
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-bold text-secondary font-serif px-1">Previous Matches</h3>
              {matches.map(match => {
                const matchedResume = resumes?.find(r => r.id === match.resumeId);
                return (
                  <div key={match.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm text-secondary truncate max-w-[150px]">
                          {matchedResume?.title || "Unknown Resume"}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                        match.similarityScore >= 80 ? 'bg-green-100 text-green-700' :
                        match.similarityScore >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {match.similarityScore}% Match
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{match.recommendation}"
                      </p>
                      
                      {match.missingSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-500" /> Missing Skills
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {match.missingSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {match.matchedSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Matched Skills
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {match.matchedSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {match.missingSkills.length > 0 && (
                        <div className="pt-3 border-t mt-3">
                          <Link href={`/roadmaps?jobId=${jobId}`} className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
                            Generate Learning Roadmap <ArrowLeft className="w-3 h-3 rotate-180" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}