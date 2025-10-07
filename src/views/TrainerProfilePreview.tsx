import { TrainerProfileView } from "@/ui";
import { MOCK_TRAINERS } from "@/fixtures/trainers";

export default function TrainerProfilePreview() {
  const t = MOCK_TRAINERS[0];
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <TrainerProfileView
        trainer={t}
        onBack={() => console.log("back")}
        onBook={(slug) => console.log("book:", slug)}
      />
    </div>
  );
}
