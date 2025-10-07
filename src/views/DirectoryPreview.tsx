import { DirectoryView } from "@/ui";
import { MOCK_TRAINERS } from "@/fixtures/trainers";

export default function DirectoryPreview() {
  return (
    <div className="p-6">
      <DirectoryView
        trainers={MOCK_TRAINERS}
        onOpenProfile={(slug) => console.log("open profile:", slug)}
      />
    </div>
  );
}
