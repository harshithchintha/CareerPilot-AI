import { useParams, Link } from "wouter";
import { useGetRoadmap, useToggleRoadmapStep, getGetRoadmapQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, CheckCircle2, Circle, ExternalLink, Clock, Map } from "lucide-react";

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const roadmapId = parseInt(id!);
  const queryClient = useQueryClient();

  const { data: roadmap, isLoading } = useGetRoadmap(roadmapId, {
    query: { queryKey: getGetRoadmapQueryKey(roadmapId), enabled: !!roadmapId }
  });

  const toggleStep = useToggleRoadmapStep();

  const handleToggle = (stepId: number, currentCompleted: boolean) => {
    toggleStep.mutate({
      id: roadmapId,
      stepId,
      data: { isCompleted: !currentCompleted }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRoadmapQueryKey(roadmapId) });
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!roadmap) {
    return <div className="p-8 text-center text-muted-foreground">Roadmap not found.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/roadmaps" className="text-sm font-medium text-muted-foreground hover:text-secondary mb-2 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Roadmaps
        </Link>
        <h1 className="text-3xl font-bold font-serif text-secondary flex items-center gap-3">
          <Map className="w-7 h-7 text-primary" />
          {roadmap.title}
        </h1>
        <p className="text-muted-foreground mt-1">{roadmap.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-sm font-bold text-secondary">
          <span>Overall Completion</span>
          <span>{roadmap.completedSteps} / {roadmap.totalSteps} Steps</span>
        </div>
        <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${roadmap.totalSteps ? (roadmap.completedSteps / roadmap.totalSteps) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Steps Checklist */}
      <div className="space-y-4">
        {roadmap.steps.map((step, idx) => (
          <div
            key={step.id}
            className={`bg-card border rounded-xl p-5 shadow-sm transition-all flex items-start gap-4 ${
              step.isCompleted ? 'bg-emerald-50/30 border-emerald-200' : 'border-border'
            }`}
          >
            <button
              onClick={() => handleToggle(step.id, step.isCompleted)}
              disabled={toggleStep.isPending}
              className="mt-1 shrink-0 text-muted-foreground hover:text-primary transition-colors"
            >
              {step.isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
            </button>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className={`text-base font-bold ${step.isCompleted ? 'line-through text-muted-foreground' : 'text-secondary'}`}>
                  {idx + 1}. {step.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 bg-muted rounded font-semibold uppercase">{step.resourceType}</span>
                  {step.estimatedHours && (
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {step.estimatedHours}h</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              {step.resourceUrl && (
                <a
                  href={step.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
                >
                  View Resource <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
