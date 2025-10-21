import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface ClientFiltersState {
  tags: string[];
  status?: string;
  riskMin?: number;
  riskMax?: number;
  hasNext?: boolean;
}

interface ClientFiltersProps {
  filters: ClientFiltersState;
  onChange: (filters: ClientFiltersState) => void;
}

const availableTags = [
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

export function ClientFilters({ filters, onChange }: ClientFiltersProps) {
  const activeFilterCount =
    filters.tags.length +
    (filters.status ? 1 : 0) +
    (filters.riskMin !== undefined || filters.riskMax !== undefined ? 1 : 0) +
    (filters.hasNext !== undefined ? 1 : 0);

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onChange({
      tags: [],
      status: undefined,
      riskMin: undefined,
      riskMax: undefined,
      hasNext: undefined,
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) =>
                  onChange({ ...filters, status: v === "all" ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="churnRisk">Churn Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Risk Level</Label>
              <Select
                value={
                  filters.riskMin === 67
                    ? "high"
                    : filters.riskMin === 34
                    ? "medium"
                    : filters.riskMax === 33
                    ? "low"
                    : "all"
                }
                onValueChange={(v) => {
                  if (v === "all") {
                    onChange({ ...filters, riskMin: undefined, riskMax: undefined });
                  } else if (v === "low") {
                    onChange({ ...filters, riskMin: 0, riskMax: 33 });
                  } else if (v === "medium") {
                    onChange({ ...filters, riskMin: 34, riskMax: 66 });
                  } else {
                    onChange({ ...filters, riskMin: 67, riskMax: 100 });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low (0-33)</SelectItem>
                  <SelectItem value="medium">Medium (34-66)</SelectItem>
                  <SelectItem value="high">High (67-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Session Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-next"
                  checked={filters.hasNext === true}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...filters,
                      hasNext: checked ? true : undefined,
                    })
                  }
                />
                <Label htmlFor="has-next" className="text-sm font-normal cursor-pointer">
                  Has upcoming session
                </Label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {filters.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
