import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface KeyboardShortcut {
  key: string;
  description: string;
  category: "navigation" | "actions";
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  { key: "1", description: "Today", category: "navigation" },
  { key: "2", description: "Clients", category: "navigation" },
  { key: "3", description: "Messages", category: "navigation" },
  { key: "4", description: "Calendar", category: "navigation" },
  { key: "5", description: "Settings", category: "navigation" },
  { key: "/", description: "Search", category: "navigation" },
  { key: "Cmd+K", description: "Command palette", category: "navigation" },
  
  // Actions
  { key: "A", description: "Approve selected", category: "actions" },
  { key: "E", description: "Edit selected", category: "actions" },
  { key: "Shift+A", description: "Approve all safe", category: "actions" },
  { key: "N", description: "New message", category: "actions" },
  { key: "U", description: "Undo last", category: "actions" },
  { key: "Esc", description: "Close modal", category: "actions" },
  { key: "?", description: "Show shortcuts", category: "actions" },
];

interface KeyboardShortcutsOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsOverlay({ open, onOpenChange }: KeyboardShortcutsOverlayProps) {
  const navigationShortcuts = shortcuts.filter(s => s.category === "navigation");
  const actionShortcuts = shortcuts.filter(s => s.category === "actions");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Navigation
            </h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-2">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Actions
            </h3>
            <div className="space-y-2">
              {actionShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-2">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <p className="text-xs text-muted-foreground text-center">
          Press <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> anytime to show this dialog
        </p>
      </DialogContent>
    </Dialog>
  );
}
