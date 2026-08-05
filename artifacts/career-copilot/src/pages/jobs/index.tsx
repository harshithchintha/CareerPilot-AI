import { useState } from "react";
import { Link } from "wouter";
import { useListJobs, useCreateJob, useDeleteJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronRight, Target, Building, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function JobsPage() {
  const queryClient = useQueryClient();
  const { data: jobs, isLoading } = useListJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const jobList = Array.isArray(jobs) ? jobs : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createJob.mutate({
      data: { title: title.trim(), company: company.trim() || undefined, description: description.trim() }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        setIsDialogOpen(false);
        setTitle("");
        setCompany("");
        setDescription("");
      },
      onError: (err: any) => {
        alert(err?.data?.error || err?.message || "Failed to save job. Please try again.");
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this saved job?")) {
      deleteJob.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() })
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-secondary tracking-tight">Saved Jobs</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track target roles and compare them against your resumes.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-card">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-secondary">Save a Job Description</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-secondary text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-4 sm:p-6 overflow-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary mb-1">Job Title</label>
                  <input 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="e.g. Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-secondary mb-1">Company (Optional)</label>
                  <input 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-xs sm:text-sm font-medium text-secondary mb-1">Job Description</label>
                <textarea 
                  required 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[180px] sm:min-h-[220px] flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-xs sm:text-sm"
                  placeholder="Paste the full job description here. AI will extract required skills automatically."
                />
              </div>
              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createJob.isPending}
                  className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2 disabled:opacity-50"
                >
                  {createJob.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      ) : jobList.length === 0 ? (
        <div className="bg-card border border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-2">No jobs saved yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
            Save a job description to see how well your resume matches and to generate a personalized learning roadmap.
          </p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobList.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="group block h-full">
              <div className="bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full flex flex-col">
                
                <h3 className="text-lg font-bold text-secondary mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                
                {job.company && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground mb-3">
                    <Building className="w-4 h-4" />
                    {job.company}
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5 h-14 overflow-hidden">
                    {job.requiredSkills?.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="inline-block px-2 py-0.5 bg-muted text-xs font-medium text-secondary rounded">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills && job.requiredSkills.length > 5 && (
                      <span className="inline-block px-2 py-0.5 bg-muted/50 text-xs font-medium text-muted-foreground rounded">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Added {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : "Recently"}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, job.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-secondary/5 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
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