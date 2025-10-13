import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeasurementsTab } from "@/components/progress/MeasurementsTab";
import { ProgressPhotosTab } from "@/components/progress/ProgressPhotosTab";
import { PersonalRecordsTab } from "@/components/progress/PersonalRecordsTab";
import { AchievementsTab } from "@/components/progress/AchievementsTab";

export default function Progress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track measurements, photos, and personal records</p>
      </div>

      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements" className="min-h-[44px]">Measurements</TabsTrigger>
          <TabsTrigger value="photos" className="min-h-[44px]">Progress Photos</TabsTrigger>
          <TabsTrigger value="records" className="min-h-[44px]">Personal Records</TabsTrigger>
          <TabsTrigger value="achievements" className="min-h-[44px]">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="measurements" className="mt-6">
          <MeasurementsTab />
        </TabsContent>
        
        <TabsContent value="photos" className="mt-6">
          <ProgressPhotosTab />
        </TabsContent>
        
        <TabsContent value="records" className="mt-6">
          <PersonalRecordsTab />
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-6">
          <AchievementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
