
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "../../../contexts/ThemeContext";

export function ThemeSwitch() {
  // The flow editor no longer owns theme state — the whole app's theme is
  // controlled by the single toggle in the sidebar / user-profile section.
  // This control is kept (disabled) so the toolbar layout is unchanged.
  const { theme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span wrapper so the tooltip still works while the button is disabled */}
          <span className="inline-flex">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
              aria-label="Theme is controlled from the sidebar"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme is controlled from the sidebar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
