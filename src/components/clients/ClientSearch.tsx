import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export function ClientSearch({ value, onChange, onFocus }: ClientSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search clients..."
        className="pl-9"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={onFocus}
      />
    </div>
  );
}
