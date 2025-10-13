import { useState, useEffect } from "react";
import { AchievementBadge } from "@/components/ui/AchievementBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAchievements, getUserAchievements } from "@/lib/mock/api-extended";
import type { Achievement } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function AchievementsTab() {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    
    const [allAchievements, unlocked] = await Promise.all([
      listAchievements(),
      getUserAchievements(user.id),
    ]);

    setAchievements(allAchievements);
    setUserAchievements(new Set(unlocked.map(a => a.id)));
  };

  const filteredAchievements = achievements.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  );

  const unlockedCount = filteredAchievements.filter(a => userAchievements.has(a.id)).length;

  const categories = [
    { value: 'all' as const, label: 'All', icon: '🏆' },
    { value: 'consistency' as const, label: 'Consistency', icon: '🔥' },
    { value: 'strength' as const, label: 'Strength', icon: '💪' },
    { value: 'social' as const, label: 'Social', icon: '👥' },
    { value: 'transformation' as const, label: 'Transformation', icon: '📸' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {unlockedCount} of {filteredAchievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {unlockedCount}
          </div>
          <div className="text-xs text-muted-foreground uppercase">Badges Earned</div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="min-h-[44px]">
              <span className="mr-1.5">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                tier={achievement.tier}
                unlocked={userAchievements.has(achievement.id)}
                progress={achievement.progress}
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No achievements in this category yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
