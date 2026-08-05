import { useState } from "react";
import { Mail, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { useListCoverLetters, useGenerateCoverLetter, useListResumes, useListJobs, getListCoverLettersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function CoverLettersPage() {
  const queryClient = useQueryClient();
  const { data: letters, isLoading: lettersLoading } = useListCoverLetters({ query: { queryKey: getListCoverLettersQueryKey() } });
  const { data: resumes } = useListResumes();
  const { data: jobs } = useListJobs();

  const generateLetter = useGenerateCoverLetter();

  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [tone, setTone] = useState("professional and enthusiastic");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const letterList = Array.isArray(letters) ? letters : [];
  const resumeList = Array.isArray(resumes) ? resumes : [];
  const jobList = Array.isArray(jobs) ? jobs : [];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedJobId) return;

    generateLetter.mutate({
      data: { resumeId: selectedResumeId, jobId: selectedJobId, tone }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCoverLettersQueryKey() });
      }
    });
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight flex items-center gap-3">
          <Mail className="w-8 h-8 text-primary" /> Cover Letter Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate tailored cover letters based on your resume and target job posting.
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-secondary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Generate New Cover Letter
        </h3>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Select Resume</label>
              <select
                onChange={(e) => setSelectedResumeId(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
                required
              >
                <option value="">-- Choose Resume --</option>
                {resumeList.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Select Saved Job</label>
              <select
                onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
                required
              >
                <option value="">-- Choose Job --</option>
                {jobList.map((j: any) => (
                  <option key={j.id} value={j.id}>{j.title} ({j.company || 'Company'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Writing Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
              >
                <option value="professional and enthusiastic">Professional & Enthusiastic</option>
                <option value="executive and authoritative">Executive & Authoritative</option>
                <option value="creative and storytelling">Creative & Storytelling</option>
                <option value="bold and confident">Bold & Confident</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={generateLetter.isPending || !selectedResumeId || !selectedJobId}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {generateLetter.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Cover Letter
          </button>
        </form>
      </div>

      {/* Generated Letters List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-serif text-secondary">Saved Cover Letters</h2>

        {lettersLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : letterList.length > 0 ? (
          <div className="space-y-6">
            {letterList.map((l: any) => (
              <div key={l.id} className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-lg text-secondary">{l.title}</h3>
                  <button
                    onClick={() => handleCopy(l.id, l.content)}
                    className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-md hover:bg-muted/80 font-medium"
                  >
                    {copiedId === l.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === l.id ? "Copied!" : "Copy Letter"}
                  </button>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {l.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-dashed rounded-xl p-8 text-center text-muted-foreground text-sm">
            No cover letters generated yet. Select a resume and job above to write your first cover letter!
          </div>
        )}
      </div>
    </div>
  );
}
