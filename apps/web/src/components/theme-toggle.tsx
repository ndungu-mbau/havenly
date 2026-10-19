import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@havenly/ui/components/switch";
import { Label } from "@havenly/ui/components/label";

export function ThemeToggleSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-between gap-2 text-sm ${className ?? ""}`}>
        <span className="text-muted-foreground flex items-center gap-2">
          <Sun size={16} />
          <span>Dark mode</span>
        </span>
        <div className="bg-input h-[18.4px] w-[32px] rounded-full opacity-50" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`flex items-center justify-between gap-3 text-sm ${className ?? ""}`}>
      <Label
        htmlFor="theme-mode-switch"
        className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 font-normal"
      >
        {isDark ? <Moon size={16} className="text-primary" /> : <Sun size={16} />}
        <span>Dark mode</span>
      </Label>
      <Switch
        id="theme-mode-switch"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}

export { ThemeToggleSwitch as ThemeToggle };
