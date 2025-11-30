import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrograms } from "@/hooks/queries/usePrograms";
import { Loader2 } from "lucide-react";

interface ProgramSelectorProps {
  value?: string;
  onChange: (programId: string | null) => void;
  disabled?: boolean;
}

export function ProgramSelector({ value, onChange, disabled }: ProgramSelectorProps) {
  const { data: programs, isLoading } = usePrograms();

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!programs || programs.length === 0) {
    return <span className="text-muted-foreground text-sm">No programs</span>;
  }

  return (
    <Select
      value={value || "none"}
      onValueChange={(val) => onChange(val === "none" ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-[140px] text-xs">
        <SelectValue placeholder="Select program" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No program</SelectItem>
        {programs.map((program) => (
          <SelectItem key={program.id} value={program.id}>
            {program.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
