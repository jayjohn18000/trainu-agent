import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface TagPickerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const suggestedTags = [
  "vip",
  "strength",
  "cardio",
  "weight-loss",
  "mobility",
  "injury-recovery",
  "beginner",
  "athlete",
  "nutrition",
  "hiit",
  "busy-professional",
  "yoga",
  "wellness",
  "powerlifting",
  "endurance",
];

export function TagPicker({ tags, onChange }: TagPickerProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    }
  };

  const availableSuggestions = suggestedTags.filter((tag) => !tags.includes(tag));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add tag..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="sm"
          onClick={() => addTag(input)}
          disabled={!input.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="default" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {availableSuggestions.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Suggested:</p>
          <div className="flex flex-wrap gap-1">
            {availableSuggestions.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer"
                onClick={() => addTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
