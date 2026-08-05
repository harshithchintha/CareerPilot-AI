import { useState } from "react";
import { Link } from "wouter";
import { Map as MapIcon, Plus, Loader2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useListRoadmaps, useGenerateRoadmap, getListRoadmapsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function RoadmapsPage() {
  const queryClient = useQueryClient();
  const { data: roadmaps, isLoading } = useListRoadmaps({ query: { queryKey: getListRoadmapsQueryKey() } });
  const generateRoadmap = useGenerateRoadmap();

  const [targetRole, setTargetRole] = useState("Senior Full Stack Developer");
  const [showNewModal, setShowNewModal] = useState(false);

  const roadmapList = Array.isArray(roadmaps) ? roadmaps : [];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    generateRoadmap.mutate({
      data: { targetRole }
    }, {
      onSuccess: () => {
        setShowNewModal(false);
        queryClient.invalidateQueries({ queryKey: getListRoadmapsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight">Learning Roadmaps</h1>
          <p className="text-muted-foreground mt-1">Personalized step-by-step career pathways powered by AI.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <Plus className="w-4 h-4" /> Generate New Roadmap
        </button>
      </div>

      {showNewModal && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-secondary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Create Custom Career Roadmap
          </h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Target Career Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. AI Engineer, DevOps Architect"
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generateRoadmap.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {generateRoadmap.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : roadmapList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmapList.map((r: any) => (
            <Link key={r.id} href={`/roadmaps/${r.id}`}>
              <div className="bg-card border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-all space-y-3 cursor-pointer group">
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded">
                    {r.targetRole}
                  </span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-secondary font-serif">{r.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-muted-foreground border-t border-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{r.completedSteps} of {r.totalSteps} steps completed</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-dashed rounded-xl p-12 text-center space-y-4">
          <MapIcon className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-bold text-secondary">No Roadmaps Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Generate an AI-powered step-by-step roadmap to bridge your skill gaps and prepare for target roles.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Sparkles className="w-4 h-4" /> Generate First Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
