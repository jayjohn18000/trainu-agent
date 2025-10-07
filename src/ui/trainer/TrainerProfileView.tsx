import { Trainer } from "@/types/trainer";

type Props = {
  trainer: Trainer;
  onBack?: () => void;
  onBook?: (slug: string) => void;
};

export function TrainerProfileView({ trainer, onBack, onBook }: Props) {
  return (
    <article className="space-y-4 rounded-xl bg-card p-4 shadow">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-sm text-muted hover:underline">← Back</button>
        <img
          src={trainer.avatarUrl || "https://i.pravatar.cc/150?img=9"}
          alt={trainer.name}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{trainer.name}</h1>
          <p className="text-sm text-muted">
            {[trainer.city, trainer.state].filter(Boolean).join(", ")}
          </p>
        </div>
        <button
          onClick={() => onBook?.(trainer.slug)}
          className="rounded-xl bg-primary px-4 py-2 text-primary-fg"
        >
          Book
        </button>
      </div>

      {trainer.bio && <p className="text-sm leading-6">{trainer.bio}</p>}

      {trainer.specialties?.length ? (
        <div className="flex flex-wrap gap-2">
          {trainer.specialties.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100/10 border border-gray-200/20">
              {s}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
