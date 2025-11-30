import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TagPicker } from "./TagPicker";
import { Plus } from "lucide-react";

interface TagPickerPopoverProps {
  tags: string[];
  onSave: (tags: string[]) => void;
  disabled?: boolean;
}

export function TagPickerPopover({ tags, onSave, disabled }: TagPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [localTags, setLocalTags] = useState(tags);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalTags(tags);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    onSave(localTags);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          disabled={disabled}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <h4 className="font-medium">Edit Tags</h4>
          <TagPicker tags={localTags} onChange={setLocalTags} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
