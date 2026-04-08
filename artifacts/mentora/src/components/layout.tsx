import { useLocation, Link } from "wouter";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { BookOpen, MessageSquare, LayoutDashboard, Settings as SettingsIcon, GraduationCap } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: profile, isLoading, error } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey(), retry: false },
  });

  useEffect(() => {
    if (!isLoading && error && location !== "/onboarding" && location !== "/") {
      setLocation("/onboarding");
    }
  }, [isLoading, error, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (location === "/") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Chat", icon: MessageSquare, href: "/chat" },
    { label: "Quiz", icon: BookOpen, href: "/quiz" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Library", icon: GraduationCap, href: "/library" },
    { label: "Settings", icon: SettingsIcon, href: "/settings" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <GraduationCap className="h-6 w-6" />
            <span>Mentora</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
              {profile?.name?.[0] || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{profile?.name || "Student"}</span>
              <span className="text-xs text-muted-foreground capitalize">{profile?.difficulty || ""}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
