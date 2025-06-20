import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Users, ListChecks, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  active: boolean;
}

interface SidebarNavProps {
  pathname?: string;
}

const SidebarNav: FC<SidebarNavProps> = ({ pathname: propPathname }) => {
  // Use useLocation to get the current pathname if propPathname is not provided
  const { pathname } = useLocation();
  const currentPathname = propPathname || pathname;

  const navItems: NavItem[] = [
    {
      name: "Job Description",
      path: "/",
      icon: <FileText className="h-5 w-5" />,
      active: currentPathname === "/",
    },
    {
      name: "Candidate Matching",
      path: "/candidates",
      icon: <Users className="h-5 w-5" />,
      active: currentPathname === "/candidates",
    },
    {
      name: "Shortlist",
      path: "/shortlist",
      icon: <ListChecks className="h-5 w-5" />,
      active: currentPathname === "/shortlist",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      active: currentPathname === "/settings",
    },
  ];

  return (
    <div className="fixed h-full w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center">
          <span className="bg-accent text-accent-foreground rounded-md p-1 mr-2">AI</span>
          Recruitment Assistant
        </h1>
      </div>

      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
          Workflow Stages
        </div>
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.active
                  ? "bg-green-500 text-white" // Green background for active state
                  : "text-sidebar-foreground/80 hover:bg-accent/20 hover:text-sidebar-foreground"
              )}
              aria-current={item.active ? "page" : undefined}
            >
              <div className="mr-3">{item.icon}</div>
              <span>{item.name}</span>
              {index < 3 && (
                <span className="ml-auto bg-accent/30 text-xs rounded-full px-2 py-0.5 text-accent-foreground">
                  {index + 1}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-sidebar-border/30">
        <div className="rounded-md bg-accent/20 p-3 text-xs text-sidebar-foreground/90">
          <div className="font-semibold mb-1">Using Gemini</div>
          <div className="flex items-center justify-between">
            <span>Gemini-1.5-Flash</span>
            <span className="text-accent px-1.5 py-0.5 bg-accent/30 rounded-sm text-[10px]">
              API
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;