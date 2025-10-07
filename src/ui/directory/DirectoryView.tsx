import { Trainer } from "@/types/trainer";
import { DirectoryGrid } from "./DirectoryGrid";
import { useMemo, useState } from "react";

type Props = {
  trainers: Trainer[];
  onOpenProfile?: (slug: string) => void;
};

export function DirectoryView({ trainers, onOpenProfile }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return trainers;
    return trainers.filter(t =>
      [t.name, t.city, t.state, ...(t.specialties || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q, trainers]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search trainers, city, specialty…"
          className="w-full rounded-xl border border-gray-200/20 bg-card px-3 py-2"
        />
      </div>
      <DirectoryGrid trainers={filtered} onSelect={onOpenProfile} />
    </section>
  );
}
