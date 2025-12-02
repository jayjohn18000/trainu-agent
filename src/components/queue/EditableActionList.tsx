import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Plus, GripVertical, Trash2 } from "lucide-react";

interface EditableActionListProps {
  actions: string[];
  onChange: (actions: string[]) => void;
}

export function EditableActionList({ actions, onChange }: EditableActionListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newAction, setNewAction] = useState("");

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(actions[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...actions];
      updated[editingIndex] = editValue.trim();
      onChange(updated);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleDelete = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (newAction.trim()) {
      onChange([...actions, newAction.trim()]);
      setNewAction("");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">Recommended Actions:</div>
      <div className="space-y-1.5">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            {editingIndex === index ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </>
            ) : (
              <>
                <div
                  className="flex-1 text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleEdit(index)}
                >
                  • {action}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </>
            )}
          </div>
        ))}
        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Add new action..."
              className="flex-1 h-8"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewAction("");
                }
              }}
            />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAdd}>
              <Check className="h-4 w-4 text-success" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
              setIsAdding(false);
              setNewAction("");
            }}>
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add action
          </Button>
        )}
      </div>
    </div>
  );
}
