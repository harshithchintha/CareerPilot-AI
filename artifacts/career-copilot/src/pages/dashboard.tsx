import { useGetDashboardStats, useGetDashboardActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  FileText, 
  Briefcase, 
  Users, 
  Map as MapIcon, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useGetDashboardActivity();

  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-xl"></div>
          <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Resumes Tracked",
      value: stats?.resumeCount || 0,
      icon: FileText,
      trend: stats?.avgAtsScore ? `Avg Score: ${stats.avgAtsScore}%` : "No scores yet",
      href: "/resumes"
    },
    {
      title: "Saved Jobs",
      value: stats?.jobsTracked || 0,
      icon: Briefcase,
      trend: "Active job matches",
      href: "/jobs"
    },
    {
      title: "Interviews Done",
      value: stats?.interviewsCompleted || 0,
      icon: Users,
      trend: stats?.avgInterviewScore ? `Avg Score: ${Math.round(stats.avgInterviewScore * 10) / 10}/10` : "Practice now",
      href: "/interviews"
    },
    {
      title: "Active Roadmaps",
      value: stats?.roadmapsActive || 0,
      icon: MapIcon,
      trend: `${stats?.stepsCompleted || 0} steps completed`,
      href: "/roadmaps"
    }
  ];

  const activityList = Array.isArray(activities) ? activities : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Here is a summary of your career progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className="block group">
            <div className="bg-card border rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-muted-foreground font-medium text-sm mb-1">{card.title}</h3>
              <div className="text-3xl font-bold text-secondary mb-2">{card.value}</div>
              <div className="mt-auto text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                {card.trend}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-serif text-secondary">ATS Score Trend</h2>
              <p className="text-sm text-muted-foreground">Your resume performance over time</p>
            </div>
            <Link href="/resumes" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              View Resumes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="h-[250px] w-full">
            {stats?.recentAtsScores && stats.recentAtsScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.recentAtsScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      try { return format(new Date(val), 'MMM d'); } catch (_) { return val; }
                    }}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                    labelFormatter={(val) => {
                      try { return format(new Date(val), 'MMM d, yyyy'); } catch (_) { return val; }
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No ATS scores yet.</p>
                <Link href="/resumes" className="text-sm text-primary hover:underline mt-1">Upload a resume to start</Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Skill Gaps */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold font-serif text-secondary">Skill Gaps Focus</h2>
            <p className="text-sm text-muted-foreground">Most frequently missing skills</p>
          </div>
          
          <div className="flex-1">
            {stats?.topSkillGaps && stats.topSkillGaps.length > 0 ? (
              <ul className="space-y-3">
                {stats.topSkillGaps.map((skill, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-transparent hover:border-border transition-colors">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-medium text-secondary">{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mb-2 text-primary opacity-50" />
                <p className="text-sm text-center">No skill gaps identified yet.</p>
                <p className="text-xs text-center mt-1">Match a resume to a job to see gaps.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Link href="/roadmaps" className="w-full py-2 bg-secondary text-primary-foreground text-sm font-medium rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center">
              Generate Learning Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold font-serif text-secondary mb-6">Recent Activity</h2>
        
        {activityList.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {activityList.map((activity: any) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-primary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-primary/20 z-10">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-secondary text-sm">{activity.title}</h3>
                    <time className="text-xs text-muted-foreground font-mono">
                      {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : "Recently"}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
            <p>No recent activity.</p>
            <p>Upload a resume or save a job to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}