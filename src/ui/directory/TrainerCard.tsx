import { Trainer } from "@/types/trainer";

type Props = {
  trainer: Trainer;
  onOpen?: (slug: string) => void; // UI-level callback only
};

export function TrainerCard({ trainer, onOpen }: Props) {
  return (
    <button
      onClick={() => onOpen?.(trainer.slug)}
      className="w-full text-left rounded-xl bg-card p-4 shadow hover:shadow-md transition"
    >
      <div className="flex items-center gap-4">
        <img
          src={trainer.avatarUrl || "https://i.pravatar.cc/150?img=5"}
          alt={trainer.name}
          className="h-[var(--tu-avatar)] w-[var(--tu-avatar)] rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{trainer.name}</h3>
            {trainer.verified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-fg">Verified</span>
            )}
          </div>
          <p className="text-sm text-muted">
            {[trainer.city, trainer.state].filter(Boolean).join(", ")}
          </p>
          {trainer.specialties?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {trainer.specialties.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100/10 border border-gray-200/20">
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
