
import { FC } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, BarChart2, ListChecks, Settings } from "lucide-react";
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

const SidebarNav: FC<SidebarNavProps> = ({ pathname = "/" }) => {
  const navItems: NavItem[] = [
    {
      name: "Job Description",
      path: "/",
      icon: <FileText className="h-5 w-5" />,
      active: pathname === "/"
    },
    {
      name: "Candidate Matching",
      path: "/candidates",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/candidates"
    },
    {
      name: "Visual Insights",
      path: "/insights",
      icon: <BarChart2 className="h-5 w-5" />,
      active: pathname === "/insights"
    },
    {
      name: "Shortlist",
      path: "/shortlist",
      icon: <ListChecks className="h-5 w-5" />,
      active: pathname === "/shortlist"
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/settings"
    }
  ];

  return (
    <div className="fixed h-full w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center">
          <span className="bg-accent rounded-md p-1 mr-2">AI</span>
          Recruitment Assistant
        </h1>
      </div>
      
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
          Workflow Steps
        </div>
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.active 
                  ? "bg-sidebar-accent text-white" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
              )}
            >
              <div className="mr-3">{item.icon}</div>
              <span>{item.name}</span>
              {index < 4 && (
                <span className="ml-auto bg-sidebar-accent/50 text-xs rounded-full px-2 py-0.5">
                  {index + 1}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-sidebar-border/30">
        <div className="rounded-md bg-sidebar-accent/80 p-3 text-xs text-white/90">
          <div className="font-semibold mb-1">Using Ollama</div>
          <div className="flex items-center justify-between">
            <span>Llama3:8B</span>
            <span className="text-accent px-1.5 py-0.5 bg-white/10 rounded-sm text-[10px]">Local</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
