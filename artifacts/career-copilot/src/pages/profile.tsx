import { useUser } from "@clerk/react";
import { User, Mail, ShieldCheck, Award } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your user profile and account preferences.</p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm max-w-2xl space-y-6">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold uppercase overflow-hidden border-2 border-primary/20">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
            ) : (
              user?.firstName?.charAt(0) || "U"
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">{user?.fullName || "User Account"}</h2>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-secondary font-serif">Account Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 rounded-lg border">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">User ID</span>
              <span className="font-mono text-xs text-secondary truncate block">{user?.id || "local-user"}</span>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Subscription</span>
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" /> Pro AI Plan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
