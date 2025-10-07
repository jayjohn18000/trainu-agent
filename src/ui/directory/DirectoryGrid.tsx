import { Trainer } from "@/types/trainer";
import { TrainerCard } from "./TrainerCard";

type Props = {
  trainers: Trainer[];
  onSelect?: (slug: string) => void;
  emptyText?: string;
};

export function DirectoryGrid({ trainers, onSelect, emptyText = "No trainers found" }: Props) {
  if (!trainers?.length) {
    return <div className="text-muted">{emptyText}</div>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {trainers.map(t => (
        <TrainerCard key={t.id} trainer={t} onOpen={onSelect} />
      ))}
    </div>
  );
}
