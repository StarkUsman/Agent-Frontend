
import type { Node } from "@xyflow/react";
import { ChevronLeft, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NODE_TEMPLATES } from "@/lib/nodes/templates";
import { useEditorStore } from "@/lib/store/editorStore";
import { deriveNodeType } from "@/lib/utils/nodeType";
import { useTheme } from "../../../../contexts/ThemeContext";

type Props = {
  nodes: Node[];
  readOnly?: boolean;
};

export default function NodePalette({ nodes, readOnly = false }: Props) {
  const setShowNodesPanel = useEditorStore((state) => state.setShowNodesPanel);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Check if an initial node already exists
  const hasInitialNode = nodes.some(
    (n) => deriveNodeType(n.data as Record<string, unknown>, n.type as string) === "initial"
  );

  return (
    <aside className="w-56 shrink-0 border-r bg-white/70 p-2 text-sm backdrop-blur dark:bg-black/40 flex flex-col overflow-hidden h-full">
      {/* Exit back to My Agents */}
      <button
        onClick={() => navigate("/agents")}
        className="mb-2 flex items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
        title="Back to My Agents"
      >
        <LogOut className="h-4 w-4 rotate-180" />
        <span>Exit to My Agents</span>
      </button>

      <div className="mb-2 px-2 flex items-center justify-between text-xs font-semibold uppercase opacity-70 shrink-0">
        <span>Nodes</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6"
                onClick={() => setShowNodesPanel(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide nodes panel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
        {readOnly ? (
          <p className="px-2 py-2 text-[12px] leading-snug text-slate-400 dark:text-slate-500">
            View only — editing disabled
          </p>
        ) : (
          NODE_TEMPLATES.map((t) => {
            const isInitial = t.type === "initial";
            const isDisabled = isInitial && hasInitialNode;
            return (
              <Button
                key={t.type}
                variant="outline"
                className="h-auto! w-full flex-col items-start px-2! py-2! text-left shadow-sm"
                style={{ height: "auto" }}
                disabled={isDisabled}
                draggable={!isDisabled}
                onDragStart={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.setData("application/x-node-type", t.type);
                  e.dataTransfer.effectAllowed = "move";
                }}
                title={isDisabled ? "Only one initial node is allowed" : undefined}
              >
                <div className="text-[13px] font-medium leading-tight">{t.label}</div>
                <div className="text-[11px] opacity-60 leading-tight">{t.type}</div>
              </Button>
            );
          })
        )}
      </div>

      {/* User profile */}
      <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-1">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
            style={{ backgroundColor: "#6366f1" }}
          >
            SA
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              Sara Ahmed
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Operations manager
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
