import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Users, 
  Map as MapIcon, 
  Mail, 
  MessageSquare, 
  User, 
  LogOut,
  Menu,
  X,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { useState } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resumes", label: "Resumes & ATS", icon: FileText },
    { href: "/jobs", label: "Job Matching", icon: Briefcase },
    { href: "/interviews", label: "Mock Interviews", icon: Users },
    { href: "/roadmaps", label: "Learning Roadmaps", icon: MapIcon },
    { href: "/projects", label: "Project Ideas", icon: Sparkles },
    { href: "/questions", label: "Question Bank", icon: HelpCircle },
    { href: "/cover-letters", label: "Cover Letters", icon: Mail },
    { href: "/chat", label: "AI Career Chat", icon: MessageSquare },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold font-serif text-secondary">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
              <svg viewBox="0 0 256 256" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                <path d="M128 56L188 184H68L128 56Z" stroke="currentColor" strokeWidth="24" strokeLinejoin="round"/>
                <circle cx="128" cy="128" r="24" fill="currentColor"/>
              </svg>
            </div>
            Career Copilot
          </Link>
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-secondary"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="mb-3 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-secondary overflow-hidden shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary truncate">{user?.fullName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          
          <Link 
            href="/profile" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-secondary mb-1 transition-colors"
          >
            <User className="w-4 h-4" />
            Profile Settings
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-4 md:hidden shrink-0">
          <button 
            className="text-muted-foreground hover:text-foreground p-2 -ml-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-2 font-serif font-bold text-lg text-secondary">
            Career Copilot
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background/50">
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}