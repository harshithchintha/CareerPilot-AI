import { useState } from "react";
import { Link } from "wouter";
import { useListResumes, useCreateResume, useDeleteResume, getListResumesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2, ChevronRight, Upload, Loader2, Star } from "lucide-react";
import { format } from "date-fns";

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const { data: resumes, isLoading } = useListResumes();
  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const resumeList = Array.isArray(resumes) ? resumes : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createResume.mutate({
      data: { title: title.trim(), content: content.trim(), isDefault }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() });
        setIsDialogOpen(false);
        setTitle("");
        setContent("");
        setIsDefault(false);
      },
      onError: (err: any) => {
        alert(err?.data?.error || err?.message || "Failed to save resume. Please try again.");
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteResume.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListResumesQueryKey() })
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-secondary tracking-tight">Resumes</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage and analyze your resumes for ATS compatibility.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resume
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-card">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-secondary">Upload New Resume</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-secondary text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-4 sm:p-6 overflow-auto flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-secondary mb-1">Resume Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="e.g. Senior Frontend Engineer - Tech"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-xs sm:text-sm font-medium text-secondary mb-1">Resume Content (Paste text)</label>
                <textarea 
                  required 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="flex min-h-[180px] sm:min-h-[220px] flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono"
                  placeholder="Paste your full resume content here..."
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-xs sm:text-sm text-secondary cursor-pointer font-medium">
                  Set as default resume
                </label>
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
                  disabled={createResume.isPending}
                  className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2 disabled:opacity-50"
                >
                  {createResume.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Resume"}
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
      ) : resumeList.length === 0 ? (
        <div className="bg-card border border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-2">No resumes yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
            Upload your first resume to get an ATS score, identify missing skills, and start generating tailored cover letters.
          </p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumeList.map(resume => (
            <Link key={resume.id} href={`/resumes/${resume.id}`} className="group block h-full">
              <div className="bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full flex flex-col relative">
                {resume.isDefault && (
                  <div className="absolute top-4 right-4 text-amber-500" title="Default Resume">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                )}
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                
                <h3 className="text-lg font-bold text-secondary mb-1 line-clamp-1 group-hover:text-primary transition-colors">{resume.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Added {resume.createdAt ? format(new Date(resume.createdAt), 'MMM d, yyyy') : "Recently"}
                </p>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {resume.atsScore !== null && resume.atsScore !== undefined ? (
                      <div className={`px-2.5 py-1 rounded text-xs font-bold ${
                        resume.atsScore >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                        resume.atsScore >= 60 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        ATS: {resume.atsScore}%
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
                        Unscored
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, resume.id)}
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