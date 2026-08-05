import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListInterviews, useCreateInterview, getListInterviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Plus, ChevronRight, Play, Loader2, Award, Clock } from "lucide-react";
import { format } from "date-fns";

export default function InterviewsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: interviews, isLoading } = useListInterviews();
  const createInterview = useCreateInterview();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("technical");

  const interviewList = Array.isArray(interviews) ? interviews : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createInterview.mutate({
      data: { role, interviewType, totalQuestions: 5 }
    }, {
      onSuccess: (newInterview) => {
        queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
        setIsDialogOpen(false);
        setLocation(`/interviews/${newInterview.id}`);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight">Mock Interviews</h1>
          <p className="text-muted-foreground mt-1">Practice with an AI interviewer tailored to your target role.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Interview
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary text-secondary-foreground">
              <h2 className="text-xl font-bold font-serif text-white">Start Mock Interview</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex-1 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Target Role</label>
                <input 
                  required 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Interview Type</label>
                <select 
                  value={interviewType} 
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="technical">Technical / Hard Skills</option>
                  <option value="behavioral">Behavioral / Soft Skills</option>
                  <option value="system_design">System Design</option>
                  <option value="leadership">Leadership & Management</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createInterview.isPending}
                  className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
                >
                  {createInterview.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      ) : interviewList.length === 0 ? (
        <div className="bg-card border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-2">No interviews yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Practice makes perfect. Start a mock interview to get real-time feedback on your answers.
          </p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviewList.map(interview => (
            <Link key={interview.id} href={`/interviews/${interview.id}`} className="group block">
              <div className="bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden flex flex-col h-full">
                {interview.status === 'completed' && (
                  <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center transform translate-x-4 -translate-y-4 rounded-bl-full bg-green-50 text-green-500">
                    <Award className="w-6 h-6 ml-2 mt-2" />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(interview.status)}`}>
                    {interview.status.replace('_', ' ')}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {interview.createdAt ? format(new Date(interview.createdAt), 'MMM d, yyyy') : "Recently"}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold font-serif text-secondary mb-1 group-hover:text-primary transition-colors">
                  {interview.role}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 capitalize font-medium">
                  {interview.interviewType.replace('_', ' ')} Interview
                </p>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-secondary font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                      {interview.answeredQuestions} / {interview.totalQuestions} Qs
                    </div>
                    {interview.overallScore && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Score: {Math.round(interview.overallScore)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-secondary/5 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}